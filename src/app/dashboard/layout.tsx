"use client";

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useEmployeeRole } from '@/hooks/use-employee-role';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { supabaseClient } from '@/lib/supabase';
import {
  Compass,
  LayoutGrid,
  Settings,
  Users,
  LifeBuoy,
  LogOut,
  Printer,
  StickyNote,
  Clock,
  Package,
  CreditCard,
  Home as HomeIcon,
  BookOpen,
  Archive,
  BarChart3,
  Plug,
  FileText,
  Megaphone,
  GraduationCap,
  Search,
} from 'lucide-react';
import { NotificationsBell } from '@/components/notifications-bell';

// use real supabase auth
// If user is not present, we will redirect to /auth/signin


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, session, loading } = useSupabaseAuth();
  const { isAdmin } = useEmployeeRole();

  React.useEffect(() => {
    // Wait for auth to load before redirecting
    if (loading) return;
    
    // If not signed in and we aren't on auth page, push to sign in
    if (!user && !pathname?.startsWith('/auth')) {
      router.push('/auth/signin');
    }
  }, [user, loading, pathname, router]);

  // Show nothing while checking auth
  if (loading) {
    return null;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center">
              <img src="/logo.png" alt="3Thirty3 Group" className="h-13 w-auto" />
            </Link>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                href="/dashboard"
                isActive={pathname === '/dashboard'}
                tooltip="Dashboard"
              >
                <LayoutGrid />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton
                href="/dashboard/analytics"
                isActive={pathname.startsWith('/dashboard/analytics')}
                tooltip="Analytics"
              >
                <BarChart3 />
                Analytics
              </SidebarMenuButton>
            </SidebarMenuItem>
            )}

             <SidebarMenuItem>
              <SidebarMenuButton
                href="/dashboard/search"
                isActive={pathname.startsWith('/dashboard/search')}
                tooltip="Google Search"
              >
                <Search />
                Search
              </SidebarMenuButton>
            </SidebarMenuItem>

             <SidebarMenuItem>
              <SidebarMenuButton
                href="/dashboard/resources"
                isActive={pathname.startsWith('/dashboard/resources')}
                tooltip="Resources"
              >
                <BookOpen />
                Resources
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                href="/dashboard/catalog"
                isActive={pathname.startsWith('/dashboard/catalog')}
                tooltip="Product Catalog"
              >
                <Archive />
                Catalog
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                href="/dashboard/documents"
                isActive={pathname.startsWith('/dashboard/documents')}
                tooltip="Documents"
              >
                <FileText className="w-4 h-4" />
                Documents
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            {isAdmin && (
              <>
                 <SidebarSeparator />
                 <SidebarMenuItem>
                  <SidebarMenuButton
                    href="/dashboard/products"
                    isActive={pathname.startsWith('/dashboard/products')}
                    tooltip="Products"
                  >
                    <Package />
                    Products
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton
                    href="/dashboard/team"
                    isActive={pathname.startsWith('/dashboard/team')}
                    tooltip="Employees"
                  >
                    <Users />
                    Employees
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    href="/dashboard/training/admin"
                    isActive={pathname === '/dashboard/training/admin'}
                    tooltip="Onboarding Progress"
                  >
                    <GraduationCap />
                    Onboarding Progress
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    href="/dashboard/integrations"
                    isActive={pathname.startsWith('/dashboard/integrations')}
                    tooltip="Integrations"
                  >
                    <Plug />
                    Integrations
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    href="/dashboard/announcements"
                    isActive={pathname.startsWith('/dashboard/announcements')}
                    tooltip="Announcements"
                  >
                    <Megaphone />
                    Announcements
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}

            <SidebarSeparator />

            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="PrintPilot">
                <Printer />
                PrintPilot
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="StickerPilot">
                <StickyNote />
                StickerPilot
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="TimePilot">
                <Clock />
                TimePilot
              </SidebarMenuButton>
            </SidebarMenuItem>
            
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <SidebarMenu>
            {isAdmin && (
            <SidebarMenuItem>
                <SidebarMenuButton
                  href="/dashboard/settings"
                  isActive={pathname.startsWith('/dashboard/settings')}
                  tooltip="Settings"
                >
                  <Settings />
                  Settings
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
             <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <LifeBuoy />
                Support
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={async () => {
                    try {
                      await supabaseClient?.auth?.signOut();
                      router.push('/auth/signin');
                      router.refresh();
                    } catch (error) {
                      console.error('Sign out error:', error);
                      router.push('/auth/signin');
                    }
                  }}
                >
                <LogOut />
                Log out
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <button 
            onClick={() => router.push('/dashboard/profile')}
            className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg transition-colors w-full"
          >
            <Avatar className="cursor-pointer">
              <AvatarImage src={user?.user_metadata?.avatar_url ?? 'https://placehold.co/40x40.png'} alt={user?.email ?? 'User'} data-ai-hint="male avatar" />
              <AvatarFallback>{user?.email?.split('@')[0]?.slice(0,2).toUpperCase() ?? 'DU'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 text-left">
              <span className="text-sm font-semibold">{user?.user_metadata?.full_name ?? user?.email?.split('@')[0]}</span>
              <span className="text-xs text-muted-foreground">
                {user?.email}
              </span>
            </div>
          </button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center justify-between border-b border-white/10 bg-background/30 backdrop-blur-md px-4 lg:h-14 sticky top-0 z-10">
          <div className="flex-1">
            <SidebarTrigger />
          </div>
          <h1 className="text-lg font-semibold capitalize flex-1 text-center">{pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}</h1>

          <div className="flex-1 flex justify-end">
            <NotificationsBell />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
