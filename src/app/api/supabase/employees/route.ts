import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest } from 'next/server';

async function requireAdmin(req: Request | NextRequest) {
  const admin = getSupabaseAdmin();
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '') ?? null;
  if (!token) return null;

  // Use admin client to get user from token
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return null;
  const email = data.user.email;
  // check in employees table for admin role
  const { data: rows, error: rerr } = await admin.from('employees').select('role').eq('email', email).single();
  if (rerr || !rows) return null;
  if (rows.role !== 'Admin') return null;
  return { user: data.user, email };
}

export async function GET(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    const identity = await requireAdmin(req);
    if (!identity) return NextResponse.json({ success: false, message: 'unauthorized' }, { status: 401 });
    
    const { data, error } = await admin.from('employees').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    return NextResponse.json({ success: true, rows: data });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, message: String(err?.message || err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    const identity = await requireAdmin(req);
    if (!identity) return NextResponse.json({ success: false, message: 'unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const { email, name, role } = body;
    if (!email) return NextResponse.json({ success: false, message: 'email required' }, { status: 400 });

    const existing = await admin.from('employees').select('*').eq('email', email).single();
    if (existing?.data) {
      return NextResponse.json({ success: true, rows: [existing.data] });
    }

    const { data, error } = await admin.from('employees').insert({ email, name: name ?? null, role: role ?? 'Viewer' }).select();
    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    return NextResponse.json({ success: true, rows: data });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, message: String(err?.message || err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    const identity = await requireAdmin(req);
    if (!identity) return NextResponse.json({ success: false, message: 'unauthorized' }, { status: 401 });
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'id required' }, { status: 400 });

    const { data, error } = await admin.from('employees').delete().match({ id }).select();
    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    return NextResponse.json({ success: true, rows: data });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, message: String(err?.message || err) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    const identity = await requireAdmin(req);
    if (!identity) return NextResponse.json({ success: false, message: 'unauthorized' }, { status: 401 });
    
    const body = await req.json().catch(() => ({}));
    const { id, name, email, role, avatar_url } = body;
    
    if (!id) return NextResponse.json({ success: false, message: 'id required' }, { status: 400 });
    
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, message: 'no fields to update' }, { status: 400 });
    }

    const { data, error } = await admin.from('employees').update(updates).eq('id', id).select();
    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    
    // If email was updated, we should also update the auth user's email
    if (email !== undefined && data && data[0]) {
      const oldEmployee = await admin.from('employees').select('email').eq('id', id).single();
      if (oldEmployee.data) {
        // Find and update the auth user
        const { data: { users } } = await admin.auth.admin.listUsers();
        const authUser = users.find(u => u.email?.toLowerCase() === oldEmployee.data.email.toLowerCase());
        if (authUser) {
          await admin.auth.admin.updateUserById(authUser.id, { email });
        }
      }
    }
    
    return NextResponse.json({ success: true, rows: data });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, message: String(err?.message || err) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    const identity = await requireAdmin(req);
    if (!identity) return NextResponse.json({ success: false, message: 'unauthorized' }, { status: 401 });
    
    const body = await req.json().catch(() => ({}));
    const { id, password } = body;
    
    if (!id || !password) return NextResponse.json({ success: false, message: 'id and password required' }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ success: false, message: 'password too short' }, { status: 400 });

    // 1. Get employee email
    const { data: employee, error: eErr } = await admin.from('employees').select('email').eq('id', id).single();
    if (eErr || !employee) return NextResponse.json({ success: false, message: 'employee not found' }, { status: 404 });

    // 2. Find Auth User ID
    // Note: listUsers is not efficient for large userbases, but fine for this scale.
    // We need to find the user with this email.
    let authUser = null;
    let page = 1;
    let hasMore = true;
    
    while (hasMore && !authUser) {
        const { data: { users }, error: uErr } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
        if (uErr) throw uErr;
        
        const found = users.find(u => u.email?.toLowerCase() === employee.email.toLowerCase());
        if (found) {
            authUser = found;
        } else {
            if (users.length < 1000) hasMore = false;
            else page++;
        }
    }

    if (!authUser) {
        // User doesn't exist in Auth, create them?
        // The user asked for "password function", implying reset. 
        // But if they don't exist, we can create them with this password.
        const { data: newUser, error: cErr } = await admin.auth.admin.createUser({
            email: employee.email,
            password: password,
            email_confirm: true
        });
        
        if (cErr) return NextResponse.json({ success: false, message: cErr.message }, { status: 500 });
        return NextResponse.json({ success: true, message: 'User created with password' });
    } else {
        // 3. Update password
        const { error: uErr } = await admin.auth.admin.updateUserById(authUser.id, { password: password });
        if (uErr) return NextResponse.json({ success: false, message: uErr.message }, { status: 500 });
        return NextResponse.json({ success: true, message: 'Password updated' });
    }

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, message: String(err?.message || err) }, { status: 500 });
  }
}
