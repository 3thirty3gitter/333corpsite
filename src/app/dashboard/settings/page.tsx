'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { supabaseClient } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ProfileAvatar } from "./profile-avatar";
import { useState, useEffect } from "react";
import { Shield, Mail, Calendar, Key, CheckCircle2, XCircle, Users, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AddEmployeeDialog } from "./add-employee-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";
import { useEmployeeRole } from "@/hooks/use-employee-role";
import { PricingRulesManager } from "./pricing-rules-manager";

export default function SettingsPage() {
    const { user, session } = useSupabaseAuth();
    const { toast } = useToast();
    const { isAdmin, employee: employeeData, loading: loadingEmployee } = useEmployeeRole();
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updatingPassword, setUpdatingPassword] = useState(false);

    useEffect(() => {
        if (user?.user_metadata?.full_name) {
            setFullName(user.user_metadata.full_name);
        }
    }, [user]);


    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            if (!supabaseClient) throw new Error('Supabase not configured');
            
            const { error } = await supabaseClient.auth.updateUser({
                data: { full_name: fullName }
            });
            
            if (error) throw error;
            
            toast({
                title: 'Profile updated',
                description: 'Your profile has been updated successfully.'
            });
        } catch (error: any) {
            toast({
                title: 'Update failed',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast({ title: "Passwords don't match", variant: "destructive" });
            return;
        }
        if (newPassword.length < 6) {
            toast({ title: "Password must be at least 6 characters", variant: "destructive" });
            return;
        }

        setUpdatingPassword(true);
        try {
            if (!supabaseClient) throw new Error('Supabase not configured');
            const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
            if (error) throw error;
            
            toast({ title: "Password updated successfully" });
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast({ title: "Failed to update password", description: error.message, variant: "destructive" });
        } finally {
            setUpdatingPassword(false);
        }
    };



    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account and preferences.</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-3'}`}>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="account">Account Info</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    {isAdmin && <TabsTrigger value="users">Users</TabsTrigger>}
                    {isAdmin && <TabsTrigger value="pricing">Pricing</TabsTrigger>}
                </TabsList>
                
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal information and how others see you.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <ProfileAvatar />
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input 
                                    id="name" 
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    value={user?.email || ''} 
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">Email cannot be changed. Contact your administrator if you need to update it.</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveProfile} disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="account" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Details</CardTitle>
                            <CardDescription>View your account information and status.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Email Address</p>
                                            <p className="text-sm text-muted-foreground">{user?.email || 'Not available'}</p>
                                        </div>
                                    </div>
                                    {user?.email_confirmed_at ? (
                                        <Badge variant="default" className="gap-1">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Verified
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="gap-1">
                                            <XCircle className="w-3 h-3" />
                                            Unverified
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Account Role</p>
                                            <p className="text-sm text-muted-foreground">
                                                {loadingEmployee ? 'Loading...' : (employeeData?.role || 'Employee')}
                                            </p>
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <Badge variant="default">Admin</Badge>
                                    )}
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Account Created</p>
                                            <p className="text-sm text-muted-foreground">
                                                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                }) : 'Not available'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Key className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Last Sign In</p>
                                            <p className="text-sm text-muted-foreground">
                                                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('en-US', { 
                                                    year: 'numeric', 
                                                    month: 'short', 
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) : 'Not available'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {employeeData && (
                                <Alert>
                                    <AlertDescription>
                                        <strong>Employee ID:</strong> {employeeData.id}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {isAdmin && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Admin Access</CardTitle>
                                <CardDescription>You have administrative privileges in this workspace.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Alert>
                                    <Shield className="w-4 h-4" />
                                    <AlertDescription>
                                        As an admin, you have access to team management, billing, and system settings.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Settings</CardTitle>
                            <CardDescription>Manage your password and security preferences.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form onSubmit={handleUpdatePassword} className="space-y-4 border p-4 rounded-lg">
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input 
                                        id="new-password" 
                                        type="password" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm Password</Label>
                                    <Input 
                                        id="confirm-password" 
                                        type="password" 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                    />
                                </div>
                                <Button type="submit" disabled={!newPassword || updatingPassword}>
                                    {updatingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
                                    Update Password
                                </Button>
                            </form>

                            <div className="p-4 border rounded-lg space-y-2">
                                <p className="font-medium text-sm">Active Sessions</p>
                                <p className="text-sm text-muted-foreground">You are currently signed in on this device.</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Session started: {session?.user?.last_sign_in_at ? new Date(session.user.last_sign_in_at).toLocaleString() : 'Unknown'}
                                </p>
                            </div>

                            <div className="p-4 border rounded-lg space-y-2">
                                <p className="font-medium text-sm">Two-Factor Authentication</p>
                                <p className="text-sm text-muted-foreground">
                                    Two-factor authentication is not currently enabled for your account.
                                </p>
                                <Badge variant="secondary" className="mt-2">Coming Soon</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {isAdmin && (
                    <TabsContent value="users" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>User Management</CardTitle>
                                        <CardDescription>Add and manage employee access to the platform.</CardDescription>
                                    </div>
                                    <AddEmployeeDialog 
                                        session={session} 
                                        onEmployeeAdded={() => setRefreshKey(prev => prev + 1)} 
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loadingEmployee ? (
                                    <div className="text-center py-8 text-muted-foreground">Loading employees...</div>
                                ) : (
                                    <UsersList key={refreshKey} session={session} />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {isAdmin && (
                    <TabsContent value="pricing" className="space-y-4">
                        <PricingRulesManager />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

function UsersList({ session }: { session: any }) {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchEmployees();
    }, []);

    async function fetchEmployees() {
        if (!session?.access_token) return;
        
        setLoading(true);
        try {
            const res = await fetch('/api/supabase/employees', {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            const data = await res.json();
            if (data.success) {
                setEmployees(data.rows || []);
            }
        } catch (error) {
            toast({
                title: 'Failed to load employees',
                description: 'Could not fetch employee list',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    }

    async function deleteEmployee(id: string, email: string) {
        if (!session?.access_token) return;
        if (!confirm(`Remove ${email} from the platform?`)) return;

        try {
            const res = await fetch(`/api/supabase/employees?id=${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            const data = await res.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to remove employee');
            }

            toast({
                title: 'Employee removed',
                description: `${email} has been removed`
            });

            fetchEmployees();
        } catch (error: any) {
            toast({
                title: 'Failed to remove employee',
                description: error.message,
                variant: 'destructive'
            });
        }
    }

    if (loading) {
        return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
    }

    if (employees.length === 0) {
        return (
            <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No employees yet. Add your first employee to get started.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {employees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarFallback>{employee.email.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{employee.email}</p>
                            <p className="text-xs text-muted-foreground">
                                Added {new Date(employee.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={employee.role === 'Admin' ? 'default' : 'secondary'}>
                            {employee.role}
                        </Badge>
                        <ResetPasswordDialog 
                            employeeId={employee.id} 
                            employeeEmail={employee.email} 
                            session={session} 
                        />
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteEmployee(employee.id, employee.email)}
                        >
                            <XCircle className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
