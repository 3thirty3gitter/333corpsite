"use client";

import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { supabaseClient } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, Calendar, Shield, Clock, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, session } = useSupabaseAuth();
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [employeeData, setEmployeeData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      fetchEmployeeData();
    }
  }, [user]);

  const fetchEmployeeData = async () => {
    if (!user?.email || !session?.access_token) return;
    
    try {
      const response = await fetch('/api/supabase/employees', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const employee = data.find((emp: any) => emp.email === user.email);
        setEmployeeData(employee);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const { error } = await supabaseClient.auth.updateUser({
        data: { full_name: fullName }
      });
      
      if (error) throw error;
      
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            View and manage your personal information
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="edit">Edit Profile</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage 
                    src={user?.user_metadata?.avatar_url ?? 'https://placehold.co/80x80.png'} 
                    alt={user?.email ?? 'User'} 
                  />
                  <AvatarFallback className="text-2xl">
                    {user?.email?.split('@')[0]?.slice(0,2).toUpperCase() ?? 'DU'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    {user?.email}
                  </CardDescription>
                  {employeeData && (
                    <div className="mt-2">
                      <Badge variant={employeeData.role === 'Admin' ? 'default' : 'secondary'}>
                        {employeeData.role}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{user?.email}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {user?.email_confirmed_at ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Verified</span>
                      </>
                    ) : (
                      <>
                        <span className="h-2 w-2 rounded-full bg-yellow-500" />
                        <span>Pending verification</span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Role
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{employeeData?.role || 'Employee'}</p>
                  <p className="text-sm text-muted-foreground">
                    {employeeData?.role === 'Admin' 
                      ? 'Full system access with admin privileges' 
                      : 'Standard employee access'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Member Since
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">
                    {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Account created
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Last Login
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">
                    {user?.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Last sign in time
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="edit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile Information</CardTitle>
              <CardDescription>
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  Email cannot be changed. Contact support if you need to update it.
                </p>
              </div>

              {message && (
                <Alert>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your account activity and sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">Logged in</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">Account created</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                    </p>
                  </div>
                </div>

                {user?.email_confirmed_at && (
                  <div className="flex items-start gap-4 pb-4">
                    <div className="h-2 w-2 rounded-full bg-purple-500 mt-2" />
                    <div className="flex-1">
                      <p className="font-medium">Email verified</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(user.email_confirmed_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
