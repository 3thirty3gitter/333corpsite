"use client";

import { useEffect, useState } from 'react';
import { useSupabaseAuth } from './use-supabase-auth';
import { supabaseClient } from '@/lib/supabase';

export type EmployeeRole = 'Admin' | 'Viewer' | null;

export function useEmployeeRole() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [role, setRole] = useState<EmployeeRole>(null);
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any>(null);

  useEffect(() => {
    async function fetchRole() {
      // Wait for auth to finish loading first
      if (authLoading) {
        return;
      }
      
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        if (!supabaseClient) {
           setLoading(false);
           return;
        }
        const { data, error } = await supabaseClient
          .from('employees')
          .select('*')
          .eq('email', user.email)
          .single();

        if (error) {
          console.error('Error fetching employee role:', error);
          setRole(null);
        } else if (data) {
          setEmployee(data);
          setRole(data.role as EmployeeRole);
        }
      } catch (err) {
        console.error('Error in useEmployeeRole:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRole();
  }, [user, authLoading]);

  // Helper to check if admin
  const isAdmin = role === 'Admin';

  return { role, isAdmin, loading, employee };
}
