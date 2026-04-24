
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const admin = getSupabaseAdmin();

    // 1. Fetch all training modules
    const { data: modules, error: modError } = await admin
      .from('training_modules')
      .select('*');

    if (modError) throw modError;

    // 2. Fetch all employees from the employees table
    const { data: employees, error: empError } = await admin
      .from('employees')
      .select('*');

    if (empError) throw empError;

    // 3. Get the list of auth users to match emails to user_id
    // This is needed because user_training_progress uses auth.users id
    const { data: { users }, error: authError } = await admin.auth.admin.listUsers();
    
    if (authError) {
        console.error('Auth User List Error:', authError);
        // Fallback or handle error
    }

    // 4. Fetch all training progress
    const { data: allProgress, error: progError } = await admin
      .from('user_training_progress')
      .select('*');

    if (progError) throw progError;

    // 5. Build mapping: email -> user_id
    const emailToUserId: Record<string, string> = {};
    if (users) {
      users.forEach(u => {
        if (u.email) emailToUserId[u.email.toLowerCase()] = u.id;
      });
    }

    // 6. Summarize progress per employee
    const summary = employees.map(emp => {
      const emailLower = emp.email.toLowerCase();
      const authUserId = emailToUserId[emailLower];
      const empProgress = authUserId ? allProgress.filter(p => p.user_id === authUserId) : [];
      
      const onboardingModules = modules.filter(m => m.category === 'Onboarding');
      const safetyModules = modules.filter(m => m.category === 'Safety');
      
      const onboardingCount = onboardingModules.length;
      const safetyCount = safetyModules.length;
      
      const onboardingCompleted = empProgress.filter(p => 
        onboardingModules.some(m => m.id === p.module_id) && p.status === 'Completed'
      ).length;
      
      const safetyCompleted = empProgress.filter(p => 
        safetyModules.some(m => m.id === p.module_id) && p.status === 'Completed'
      ).length;

      // Group modules by category for detailed drill-down if needed later
      const progressByCategory = modules.reduce((acc: any, mod: any) => {
        const prog = empProgress.find(p => p.module_id === mod.id);
        const cat = mod.category || 'General';
        if (!acc[cat]) acc[cat] = { total: 0, completed: 0 };
        acc[cat].total++;
        if (prog?.status === 'Completed') acc[cat].completed++;
        return acc;
      }, {});

      return {
        id: emp.id,
        name: emp.name || emp.email.split('@')[0],
        email: emp.email,
        role: emp.role,
        onboardingProgress: onboardingCount > 0 ? Math.round((onboardingCompleted / onboardingCount) * 100) : 0,
        safetyProgress: safetyCount > 0 ? Math.round((safetyCompleted / safetyCount) * 100) : 0,
        totalModules: modules.length,
        completedModules: empProgress.filter(p => p.status === 'Completed').length,
        progressByCategory,
        lastActivity: empProgress.length > 0 
          ? new Date(Math.max(...empProgress.map(p => new Date(p.created_at).getTime()))).toISOString() 
          : null
      };
    });

    return NextResponse.json({ 
      success: true, 
      data: summary,
      stats: {
        totalEmployees: employees.length,
        totalModules: modules.length,
        avgOnboardingProgress: summary.length > 0 ? summary.reduce((acc, curr) => acc + curr.onboardingProgress, 0) / summary.length : 0
      }
    });
  } catch (error: any) {
    console.error('Error in admin-progress route:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
