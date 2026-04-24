'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Percent, DollarSign, Layers, CheckCircle2 } from "lucide-react";

export function PricingRulesManager() {
  const [rules, setRules] = React.useState<any[]>([]);
  const [profiles, setProfiles] = React.useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = React.useState<string | null>(null);
  const [isAddingProfile, setIsAddingProfile] = React.useState(false);
  const [newProfileName, setNewProfileName] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const { toast } = useToast();

  // New rule state
  const [newRule, setNewRule] = React.useState({
    supplier: 'all',
    category: 'all',
    markup_percent: 50,
    markup_flat: 0,
    priority: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Fetch Profiles
      const profRes = await fetch('/api/supabase/markup-profiles');
      const profData = await profRes.json();
      if (profData.success) {
        setProfiles(profData.profiles || []);
        const active = profData.profiles.find((p: any) => p.is_active);
        if (active && !selectedProfileId) {
          setSelectedProfileId(active.id);
        } else if (!selectedProfileId && profData.profiles.length > 0) {
          setSelectedProfileId(profData.profiles[0].id);
        }
      }

      // 2. Fetch Rules (will default to active if no profileId provided, but we want for selected)
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRules = async (profileId: string) => {
    try {
      const res = await fetch(`/api/supabase/markup-rules?profileId=${profileId}`);
      const data = await res.json();
      if (data.rules) {
        setRules(data.rules);
      }
    } catch (err) {
      console.error('Failed to fetch rules:', err);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  React.useEffect(() => {
    if (selectedProfileId) {
      fetchRules(selectedProfileId);
    }
  }, [selectedProfileId]);

  const handleAddRule = async () => {
    if (!selectedProfileId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/supabase/markup-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newRule, profile_id: selectedProfileId })
      });
      
      if (res.ok) {
        toast({ title: "Rule added successfully" });
        fetchRules(selectedProfileId);
        setNewRule({ supplier: 'all', category: 'all', markup_percent: 50, markup_flat: 0, priority: 0 });
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add rule');
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleActivateProfile = async (id: string) => {
    try {
      const res = await fetch('/api/supabase/markup-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: true })
      });
      if (res.ok) {
        toast({ title: "Profile activated" });
        fetchData();
      }
    } catch (err) {
      toast({ title: "Failed to activate profile", variant: "destructive" });
    }
  };

  const handleCreateProfile = async () => {
    if (!newProfileName) return;
    try {
      const res = await fetch('/api/supabase/markup-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProfileName, description: 'Custom markup profile', is_active: false })
      });
      if (res.ok) {
        toast({ title: "Profile created" });
        setNewProfileName('');
        setIsAddingProfile(false);
        fetchData();
      }
    } catch (err) {
      toast({ title: "Failed to create profile", variant: "destructive" });
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const res = await fetch(`/api/supabase/markup-rules?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast({ title: "Rule deleted" });
        if (selectedProfileId) fetchRules(selectedProfileId);
      }
    } catch (err) {
      toast({ title: "Failed to delete rule", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pricing Profiles</CardTitle>
              <CardDescription>Select or create markup profiles based on current material costs.</CardDescription>
            </div>
            {!isAddingProfile ? (
              <Button variant="outline" size="sm" onClick={() => setIsAddingProfile(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Profile
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Input 
                  placeholder="Profile Name" 
                  value={newProfileName} 
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="h-8 max-w-[200px]"
                />
                <Button size="sm" onClick={handleCreateProfile}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsAddingProfile(false)}>Cancel</Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => (
              <Card 
                key={profile.id} 
                className={`relative cursor-pointer transition-all ${selectedProfileId === profile.id ? 'border-primary ring-1 ring-primary' : 'hover:bg-accent'}`}
                onClick={() => setSelectedProfileId(profile.id)}
              >
                 <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-semibold">{profile.name}</h4>
                       {profile.is_active ? (
                          <Badge className="bg-green-500">Active</Badge>
                       ) : (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-[10px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivateProfile(profile.id);
                            }}
                          >
                             Set Active
                          </Button>
                       )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{profile.description}</p>
                 </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Markup Rule</CardTitle>
          <CardDescription>Rules for the "{profiles.find(p => p.id === selectedProfileId)?.name}" profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Select value={newRule.supplier} onValueChange={(v) => setNewRule({...newRule, supplier: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suppliers</SelectItem>
                  <SelectItem value="sinalite">SinaLite</SelectItem>
                  <SelectItem value="momentec">Momentec</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input 
                placeholder="all" 
                value={newRule.category} 
                onChange={(e) => setNewRule({...newRule, category: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Markup %</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="number" 
                  className="pl-9" 
                  value={newRule.markup_percent} 
                  onChange={(e) => setNewRule({...newRule, markup_percent: Number(e.target.value)})} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Markup Flat ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="number" 
                  className="pl-9" 
                  value={newRule.markup_flat} 
                  onChange={(e) => setNewRule({...newRule, markup_flat: Number(e.target.value)})} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Input 
                type="number" 
                value={newRule.priority} 
                onChange={(e) => setNewRule({...newRule, priority: Number(e.target.value)})} 
              />
            </div>
            <Button onClick={handleAddRule} disabled={saving || !selectedProfileId} className="w-full">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Add Rule
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Rules: {profiles.find(p => p.id === selectedProfileId)?.name}</CardTitle>
          <CardDescription>These rules determine the retail prices displayed in the catalog for this profile.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Markup</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No rules defined yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="capitalize">{rule.supplier}</TableCell>
                      <TableCell className="capitalize">{rule.category || 'All'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {rule.markup_percent}%
                          {rule.markup_flat > 0 && ` + $${rule.markup_flat}`}
                        </Badge>
                      </TableCell>
                      <TableCell>{rule.priority}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteRule(rule.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
