"use client";
import { useEffect, useRef } from 'react';
import { useEmployeeRole } from './use-employee-role';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';

export function useRequireAdmin() {
  const { isAdmin, loading, role } = useEmployeeRole();
  const router = useRouter();
  const { toast } = useToast();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Wait for loading to complete
    if (loading) return;
    
    // Only check once to avoid redirect loops
    if (hasChecked.current) return;
    hasChecked.current = true;
    
    if (!isAdmin) {
      toast({ title: 'Access denied', description: 'Admin access required', variant: 'destructive' });
      router.push('/dashboard');
    }
  }, [isAdmin, loading, role, router, toast]);

  return { isAdmin, loading };
}
