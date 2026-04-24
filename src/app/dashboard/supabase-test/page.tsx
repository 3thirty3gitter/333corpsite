"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SupabaseTestPage() {
  const [name, setName] = useState('test-' + Math.random().toString(36).slice(2, 7));
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/supabase/pilot_test');
      const data = await res.json();
      if (!data?.success) throw new Error(data?.message || 'failed');
      setRows(data.rows ?? []);
    } catch (err: any) {
      setMessage(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  async function create() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/supabase/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.message || 'seed failed');
      setMessage(`Created ${data?.rows?.length ?? 0} row(s).`);
      await refresh();
    } catch (err: any) {
      setMessage(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  async function clearRows() {
    setLoading(true);
    setMessage(null);
    try {
      if (!confirm('Clear all test rows from pilot_test? This action cannot be undone.')) return;
      const res = await fetch('/api/supabase/pilot_test', { method: 'DELETE' });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.message || 'clear failed');
      setMessage(`Deleted ${data?.rows?.length ?? 0} rows.`);
      await refresh();
    } catch (err: any) {
      setMessage(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Supabase - Test</h1>
        <p className="text-muted-foreground">Use this page to test writing to and reading from the `pilot_test` table.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Write a test row</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-3">
            <Input className="flex-1" value={name} onChange={(e: any) => setName(e.target.value)} />
            <Button onClick={create} disabled={loading}>{loading ? '...' : 'Create'}</Button>
            <Button variant="secondary" onClick={refresh} disabled={loading}>{loading ? '...' : 'Refresh'}</Button>
            <Button variant="destructive" onClick={clearRows} disabled={loading}>{loading ? '...' : 'Clear'}</Button>
          </div>
          {message && <p className="text-sm mt-2 text-muted-foreground">{message}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent rows</CardTitle>
        </CardHeader>
        <CardContent className="p-6 overflow-auto">
          {!rows.length && <p className="text-sm text-muted-foreground">No rows yet. Use the button above to seed a row.</p>}
          {rows.length > 0 && (
            <ul className="space-y-2">
              {rows.map((r: any) => (
                <li key={r.id} className="flex justify-between border p-3 rounded">
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{r.id}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
