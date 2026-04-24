"use client";
import * as React from 'react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabaseClient } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'signin' | 'magic' | 'reset'>('signin');
  const { toast } = useToast();
  const router = useRouter();

  // Always use production redirect for magic link
  const redirectTo = process.env.NEXT_PUBLIC_APP_URL || 'https://www.3thirty3group.ca';

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      if (!supabaseClient) throw new Error('Supabase not configured.');
      
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${redirectTo}/dashboard/settings`,
      });
      
      if (error) throw error;
      
      toast({ 
        title: 'Check your email', 
        description: 'We sent you a password reset link.' 
      });
      setMode('signin');
    } catch (err: any) {
      toast({ 
        title: 'Failed to send reset link', 
        description: err?.message || 'Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      if (!supabaseClient) throw new Error('Supabase not configured.');
      
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${redirectTo}/dashboard/settings`,
      });
      
      if (error) throw error;
      
      toast({ 
        title: 'Check your email', 
        description: 'We sent you a password reset link.' 
      });
      setMode('signin');
    } catch (err: any) {
      toast({ 
        title: 'Failed to send reset link', 
        description: err?.message || 'Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      if (!supabaseClient) throw new Error('Supabase not configured. Have you set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY?');
      
      const { data, error } = await supabaseClient.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      toast({ 
        title: 'Welcome back!', 
        description: 'You have successfully signed in.' 
      });
      
      // Wait a moment for auth state to update, then redirect
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      toast({ 
        title: 'Sign in failed', 
        description: err?.message || 'Invalid email or password. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      if (!supabaseClient) throw new Error('Supabase not configured.');
      
      const { error } = await supabaseClient.auth.signInWithOtp({ 
        email, 
        options: { 
          shouldCreateUser: false, 
          emailRedirectTo: redirectTo 
        } 
      });
      
      if (error) throw error;
      
      toast({ 
        title: 'Check your email', 
        description: 'We sent you a magic link to sign in.' 
      });
    } catch (err: any) {
      toast({ 
        title: 'Failed to send magic link', 
        description: err?.message || 'Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  }

  if (!supabaseClient) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <h3 className="font-semibold text-destructive mb-2">Configuration Error</h3>
        <p className="text-sm text-muted-foreground">
          Supabase is not configured. Please set <code className="bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
          <code className="bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> file.
        </p>
      </div>
    );
  }

  if (mode === 'reset') {
    return (
      <div className="space-y-4">
        <div className="space-y-2 text-center">
          <h3 className="text-lg font-semibold">Reset Password</h3>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        <form onSubmit={resetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="reset-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Reset Link'}
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            className="w-full" 
            onClick={() => setMode('signin')}
          >
            Back to Sign In
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <button
          type="button"
          onClick={() => setMode('signin')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'signin' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setMode('magic')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'magic' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Magic Link
        </button>
      </div>

      {mode === 'signin' ? (
        <form onSubmit={signIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={loading}
              />
              <Label 
                htmlFor="remember" 
                className="text-sm font-normal cursor-pointer"
              >
                Remember me
              </Label>
            </div>
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => setMode('reset')}
            >
              Forgot password?
            </button>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!email || !password || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={sendMagicLink} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="magic-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="magic-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="pl-10"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              We'll send you a magic link to sign in without a password.
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!email || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Magic Link'
            )}
          </Button>
        </form>
      )}

      <div className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link href="#" className="text-primary hover:underline" onClick={(e) => {
          e.preventDefault();
          toast({ 
            title: 'Contact your administrator', 
            description: 'New accounts must be created by a master admin.' 
          });
        }}>
          Contact admin
        </Link>
      </div>
    </div>
  );
}
