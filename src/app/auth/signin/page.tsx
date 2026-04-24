import { SignInForm } from '@/components/auth/SignInForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center justify-center">
            <Image src="/logo.png" alt="3Thirty3 Group" width={312} height={94} className="h-18 w-auto" />
          </Link>
          <p className="text-muted-foreground">Employee Portal</p>
        </div>

        {/* Sign In Card */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to access your dashboard and resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignInForm />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            By signing in, you agree to our{' '}
            <Link href="#" className="hover:text-foreground underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="#" className="hover:text-foreground underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
