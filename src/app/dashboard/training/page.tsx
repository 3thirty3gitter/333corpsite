'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, PlayCircle, CheckCircle, Clock, Award, BookOpen, Users, TrendingUp, Loader2, Play } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useToast } from "@/hooks/use-toast";

export default function TrainingPage() {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [modules, setModules] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [modulesRes, progressRes] = await Promise.all([
        fetch('/api/supabase/training'),
        user ? fetch(`/api/supabase/training/progress?userId=${user.id}`) : Promise.resolve(null)
      ]);

      const modulesData = await modulesRes.json();
      if (modulesData.success) {
        setModules(modulesData.modules || []);
      }

      if (progressRes) {
        const progressData = await progressRes.json();
        if (progressData.success) {
          setProgress(progressData.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch training data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const updateProgress = async (moduleId: string, status: string) => {
    if (!user) return;
    try {
      setUpdating(moduleId);
      const res = await fetch('/api/supabase/training/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, module_id: moduleId, status })
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: `Module marked as ${status.toLowerCase()}` });
        fetchData();
      }
    } catch (err) {
      toast({ title: "Failed to update progress", variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  };

  const getModuleStatus = (moduleId: string) => {
    const item = progress.find(p => p.module_id === moduleId);
    return item?.status || 'Not Started';
  };

  const completedModulesCount = progress.filter(p => p.status === 'Completed').length;
  const inProgressModulesCount = progress.filter(p => p.status === 'In Progress').length;

  const learningStats = [
    { label: "Courses Completed", value: completedModulesCount.toString(), icon: <CheckCircle className="w-4 h-4" /> },
    { label: "In Progress", value: inProgressModulesCount.toString(), icon: <PlayCircle className="w-4 h-4" /> },
    { label: "Certifications", value: "0", icon: <Award className="w-4 h-4" /> },
    { label: "Total Modules", value: modules.length.toString(), icon: <TrendingUp className="w-4 h-4" /> }
  ];

  const onboardingModules = modules.filter(m => m.category === 'Onboarding');
  const availableCourses = modules.filter(m => m.category !== 'Onboarding');

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Training Center</h1>
        <p className="text-muted-foreground">Develop your skills, track progress, and earn certifications.</p>
      </div>

      {/* Learning Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {learningStats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="onboarding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="courses">Available Courses</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>

        {/* Onboarding Tab */}
        <TabsContent value="onboarding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>New Employee Onboarding</CardTitle>
              <CardDescription>Complete these modules to get started with Pilot Suite.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : onboardingModules.length > 0 ? (
                onboardingModules.map((module) => {
                  const status = getModuleStatus(module.id);
                  return (
                    <Card key={module.id} className={`border-2 ${status === 'Completed' ? 'border-green-100 bg-green-50/10' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-secondary text-primary'}`}>
                             {status === 'Completed' ? <CheckCircle className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold flex items-center gap-2">
                                  {module.title}
                                  {status === 'In Progress' && <Badge variant="secondary" className="text-[10px] h-4">In Progress</Badge>}
                                  {status === 'Completed' && <Badge variant="default" className="bg-green-500 text-[10px] h-4">Completed</Badge>}
                                </h3>
                                <p className="text-sm text-muted-foreground">{module.description}</p>
                              </div>
                              <Badge variant="outline">
                                {module.category}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-3">
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {module.duration_minutes} min
                              </span>
                              <div className="flex-1" />
                              <div className="flex gap-2">
                                {status === 'Not Started' && (
                                  <Button size="sm" onClick={() => updateProgress(module.id, 'In Progress')} disabled={updating === module.id}>
                                    {updating === module.id && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                    Start Module
                                  </Button>
                                )}
                                {status === 'In Progress' && (
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateProgress(module.id, 'Completed')} disabled={updating === module.id}>
                                    {updating === module.id && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                    Mark Completed
                                  </Button>
                                )}
                                {status === 'Completed' && (
                                  <Button size="sm" variant="ghost" disabled>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Done
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No onboarding modules found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : availableCourses.length > 0 ? (
              availableCourses.map((course) => {
                const status = getModuleStatus(course.id);
                return (
                  <Card key={course.id} className={`hover:border-primary/50 transition-colors ${status === 'Completed' ? 'border-green-100 bg-green-50/10' : ''}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Badge variant="outline">{course.category}</Badge>
                        {status === 'Completed' && (
                          <Badge className="bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                        {status === 'In Progress' && (
                          <Badge variant="secondary">In Progress</Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg mt-2">{course.title}</CardTitle>
                      <CardDescription>{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration_minutes} min</span>
                        </div>
                      </div>
                      
                      {status === 'Not Started' && (
                        <Button className="w-full" onClick={() => updateProgress(course.id, 'In Progress')} disabled={updating === course.id}>
                          {updating === course.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Start Course
                        </Button>
                      )}
                      
                      {status === 'In Progress' && (
                        <div className="flex gap-2">
                          <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => updateProgress(course.id, 'Completed')} disabled={updating === course.id}>
                            {updating === course.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Complete
                          </Button>
                          <Button variant="outline" className="flex-grow-0" disabled>
                            <PlayCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      {status === 'Completed' && (
                        <Button className="w-full" variant="outline" onClick={() => updateProgress(course.id, 'In Progress')} disabled={updating === course.id}>
                          Retake Course
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No advanced courses found.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {certifications.map((cert) => (
              <Card key={cert.id} className={cert.earned ? 'border-2 border-green-500/50 bg-green-50/50' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${cert.earned ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Award className={`w-6 h-6 ${cert.earned ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    {cert.earned && <Badge className="bg-green-500">Earned</Badge>}
                  </div>
                  <CardTitle className="text-lg mt-2">{cert.name}</CardTitle>
                  <CardDescription>{cert.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {cert.earned ? (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Earned: {new Date(cert.earnedDate!).toLocaleDateString()}
                      </div>
                      {cert.expiresDate && (
                        <div className="text-sm text-muted-foreground">
                          Expires: {new Date(cert.expiresDate).toLocaleDateString()}
                        </div>
                      )}
                      <Button variant="outline" className="w-full mt-2">
                        View Certificate
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{cert.progress}%</span>
                        </div>
                        <Progress value={cert.progress} />
                      </div>
                      <Button className="w-full">
                        Continue Learning
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
