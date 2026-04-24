'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { useRequireAdmin } from '@/hooks/use-require-admin';
import { useToast } from '@/hooks/use-toast';

export default function TrainingAdminPage() {
    useRequireAdmin();
    const { toast } = useToast();
    const [data, setData] = React.useState<any[]>([]);
    const [stats, setStats] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/supabase/training/admin-progress');
            const result = await res.json();
            if (result.success) {
                setData(result.data);
                setStats(result.stats);
            } else {
                throw new Error(result.error);
            }
        } catch (err: any) {
            toast({ title: 'Failed to load progress', description: err.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadData();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                   <h1 className="text-3xl font-bold tracking-tight">Onboarding & Training Dashboard</h1>
                   <p className="text-muted-foreground">Monitor employee progress through key training modules.</p>
                </div>
                <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Refresh
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalEmployees || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalModules || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Onboarding Progress</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(stats?.avgOnboardingProgress || 0)}%</div>
                         <Progress value={stats?.avgOnboardingProgress || 0} className="h-2 mt-2" />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Employee Progress Matrix</CardTitle>
                    <CardDescription>Real-time completion status for all employees.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading && data.length === 0 ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Onboarding</TableHead>
                                    <TableHead>Safety</TableHead>
                                    <TableHead>Total Progress</TableHead>
                                    <TableHead>Last Activity</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((emp) => (
                                    <TableRow key={emp.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{emp.name}</span>
                                                <span className="text-xs text-muted-foreground">{emp.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="w-[120px] space-y-1">
                                                <div className="flex items-center justify-between text-[10px]">
                                                    <span className="text-muted-foreground">Progression</span>
                                                    <span>{emp.onboardingProgress}%</span>
                                                </div>
                                                <Progress value={emp.onboardingProgress} className="h-1.5" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                              <div className="w-[120px] space-y-1">
                                                <div className="flex items-center justify-between text-[10px]">
                                                    <span className="text-muted-foreground">Progression</span>
                                                    <span>{emp.safetyProgress}%</span>
                                                </div>
                                                <Progress value={emp.safetyProgress} className="h-1.5" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary">
                                                    {emp.completedModules} / {emp.totalModules}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {emp.lastActivity ? new Date(emp.lastActivity).toLocaleDateString() : 'No activity'}
                                        </TableCell>
                                        <TableCell>
                                            {emp.onboardingProgress === 100 && emp.safetyProgress === 100 ? (
                                                <Badge className="bg-green-500 hover:bg-green-600">Certified</Badge>
                                            ) : emp.completedModules > 0 ? (
                                                <Badge variant="outline">In Progress</Badge>
                                            ) : (
                                                <Badge variant="secondary">Not Started</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
