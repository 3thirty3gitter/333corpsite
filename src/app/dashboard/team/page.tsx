'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Key, UserCog, Trash2 } from 'lucide-react';
import { InviteMemberDialog } from './invite-member-dialog';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useRequireAdmin } from '@/hooks/use-require-admin';
import { RemoveMemberDialog } from './remove-member-dialog';
import { SetPasswordDialog } from './set-password-dialog';
import { EditEmployeeDialog } from './edit-employee-dialog';

type TeamMember = {
    id: string;
  name: string;
  email: string;
  avatar: string;
  avatar_url?: string;
  role: 'Admin' | 'Developer' | 'Viewer';
  status: 'Active' | 'Invited';
};

const initialTeamMembers: TeamMember[] = [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', avatar: 'https://placehold.co/40x40.png?text=AJ', role: 'Admin', status: 'Active' },
    { id: '2', name: 'Bob Williams', email: 'bob@example.com', avatar: 'https://placehold.co/40x40.png?text=BW', role: 'Developer', status: 'Active' },
    { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', avatar: 'https://placehold.co/40x40.png?text=CB', role: 'Viewer', status: 'Active' },
    { id: '4', name: 'Diana Miller', email: 'diana@example.com', avatar: 'https://placehold.co/40x40.png?text=DM', role: 'Developer', status: 'Invited' },
];

export default function TeamPage() {
    useRequireAdmin();
    const [members, setMembers] = React.useState<TeamMember[]>(initialTeamMembers);
    const { toast } = useToast();

    const { session } = useSupabaseAuth();

    React.useEffect(() => {
        // fetch employees from server
        async function load() {
            if (!session?.access_token) return; // Wait for session
            try {
                const res = await fetch('/api/supabase/employees', { headers: { Authorization: `Bearer ${session.access_token}` } });
                const data = await res.json();
                if (!data?.success) throw new Error(data?.message || 'Failed to load employees');
                const list = data.rows.map((r: any) => ({ 
                    id: r.id, 
                    name: r.name ?? 'Invited User', 
                    email: r.email, 
                    avatar: r.avatar_url || `https://placehold.co/40x40.png?text=${r.email.charAt(0).toUpperCase()}`,
                    avatar_url: r.avatar_url,
                    role: r.role, 
                    status: 'Active' 
                })) as TeamMember[];
                setMembers(list);
            } catch (err) {
                // fallback to initial
            }
        }
        load();
    }, [session?.access_token]);
  const [selectedMember, setSelectedMember] = React.useState<TeamMember | null>(null);
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = React.useState(false);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = React.useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const handleInviteMember = (values: { email: string; role: 'Admin' | 'Developer' | 'Viewer' }) => {
        (async () => {
            try {
                const res = await fetch('/api/supabase/employees', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token ?? ''}` }, body: JSON.stringify({ email: values.email, role: values.role }) });
                const data = await res.json();
                if (!data?.success) throw new Error(data?.message || 'Invite failed');
                const rows = data.rows ?? [];
                const r = rows[0];
                    const newMember: TeamMember = { id: r.id, name: r.name ?? 'Invited User', email: r.email, avatar: `https://placehold.co/40x40.png?text=${r.email.charAt(0).toUpperCase()}`, role: r.role, status: 'Invited' };
                setMembers(prev => [...prev, newMember]);
                toast({ title: 'Invite sent', description: `Invite sent to ${values.email}` });
            } catch (err: any) {
                toast({ title: 'Invite failed', description: String(err?.message || err), variant: 'destructive' });
            }
        })();
  };

  const handleRemoveClick = (member: TeamMember) => {
    setSelectedMember(member);
    setIsRemoveDialogOpen(true);
  };

  const handleSetPasswordClick = (member: TeamMember) => {
    setSelectedMember(member);
    setIsPasswordDialogOpen(true);
  };

  const handleEditClick = (member: TeamMember) => {
    setSelectedMember(member);
    setIsEditDialogOpen(true);
  };

  const handleEditConfirm = (values: { name: string; email: string; role: 'Admin' | 'Developer' | 'Viewer'; avatar_url?: string | null }) => {
    if (!selectedMember) return;
    (async () => {
      try {
        const res = await fetch('/api/supabase/employees', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token ?? ''}`,
          },
          body: JSON.stringify({ id: selectedMember.id, ...values }),
        });
        const data = await res.json();
        if (!data?.success) throw new Error(data?.message || 'Failed to update employee');
        
        // Update the local state
        setMembers(prev => prev.map(m => 
          m.id === selectedMember.id 
            ? { 
                ...m, 
                name: values.name, 
                email: values.email, 
                role: values.role,
                avatar: values.avatar_url || m.avatar,
                avatar_url: values.avatar_url || undefined
              }
            : m
        ));
        
        toast({ title: 'Employee updated', description: `${values.name} has been updated successfully.` });
      } catch (err: any) {
        toast({ title: 'Update failed', description: String(err?.message || err), variant: 'destructive' });
      }
    })();
    setIsEditDialogOpen(false);
    setSelectedMember(null);
  };

  const handleSetPasswordConfirm = (password: string) => {
    if (!selectedMember) return;
    (async () => {
      try {
        const res = await fetch('/api/supabase/employees', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token ?? ''}`,
          },
          body: JSON.stringify({ id: selectedMember.id, password }),
        });
        const data = await res.json();
        if (!data?.success) throw new Error(data?.message || 'Failed to set password');
        toast({ title: 'Password set', description: `Password set for ${selectedMember.name}. They can now login.` });
      } catch (err: any) {
        toast({ title: 'Failed', description: String(err?.message || err), variant: 'destructive' });
      }
    })();
    setIsPasswordDialogOpen(false);
    setSelectedMember(null);
  };
  
  const handleRemoveConfirm = () => {
    if (!selectedMember) return;
        (async () => {
            try {
                const res = await fetch(`/api/supabase/employees?id=${encodeURIComponent(selectedMember.id)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${session?.access_token ?? ''}` } });
                const data = await res.json();
                if (!data?.success) throw new Error(data?.message || 'Delete failed');
                setMembers(prev => prev.filter(member => member.id !== selectedMember.id));
                toast({ title: 'Member removed', description: `${selectedMember.name} removed` });
            } catch (err: any) {
                toast({ title: 'Remove failed', description: String(err?.message || err), variant: 'destructive' });
            }
        })();

    // Toast will be shown after the async deletion completes in the async function above.

    setIsRemoveDialogOpen(false);
    setSelectedMember(null);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
                <p className="text-muted-foreground">Add employees and manage their access credentials.</p>
            </div>
            <InviteMemberDialog onInviteMember={handleInviteMember} />
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Employees</CardTitle>
                <CardDescription>All employees who can access the system.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                    No employees yet. Click &quot;Add Employee&quot; to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            members.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="cursor-pointer" onClick={() => handleEditClick(member)}>
                                            <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="avatar" />
                                            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div className="cursor-pointer" onClick={() => handleEditClick(member)}>
                                            <p className="font-medium hover:text-primary transition-colors">{member.name}</p>
                                            <p className="text-sm text-muted-foreground">{member.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={member.role === 'Admin' ? 'default' : 'secondary'}>
                                        {member.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={member.status === 'Active' ? 'secondary' : 'outline'}>
                                        <span className={member.status === 'Active' ? 'text-chart-2' : ''}>{member.status}</span>
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEditClick(member)}
                                            title="Edit employee"
                                        >
                                            <UserCog className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleSetPasswordClick(member)}
                                            title="Set password"
                                        >
                                            <Key className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveClick(member)}
                                            title="Remove employee"
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">More actions</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleEditClick(member)}>
                                                Edit Employee
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleSetPasswordClick(member)}>
                                                Set Password
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem 
                                                className="text-destructive"
                                                onClick={() => handleRemoveClick(member)}
                                            >
                                                Remove Employee
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
      <RemoveMemberDialog 
        isOpen={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
        onConfirm={handleRemoveConfirm}
        memberName={selectedMember?.name || ''}
      />
      <SetPasswordDialog 
        isOpen={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        onConfirm={handleSetPasswordConfirm}
        memberName={selectedMember?.name || ''}
        memberEmail={selectedMember?.email || ''}
      />
      <EditEmployeeDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onConfirm={handleEditConfirm}
        employee={selectedMember}
      />
    </>
  );
}
