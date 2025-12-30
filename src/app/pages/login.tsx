/**
 * Login Page for Calyx Command
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@/components/ui';
import { useAuth } from '@/app/auth-context';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, startDemoMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStartingDemo, setIsStartingDemo] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/app');
    } catch (err) {
      setError('Invalid credentials. For demo, use any email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryDemo = async () => {
    setIsStartingDemo(true);
    try {
      await startDemoMode();
      navigate('/app');
    } catch (error) {
      console.error('Failed to start demo:', error);
    } finally {
      setIsStartingDemo(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <Link to="/landing" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6M12 12l-4 4M12 12l4 4M12 12l-3-3M12 12l3-3" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-2xl">Calyx Command</span>
            </div>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle>Welcome back</CardTitle>
              <CardDescription>
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleTryDemo}
                disabled={isStartingDemo}
              >
                {isStartingDemo ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting demo...
                  </>
                ) : (
                  'Try Demo Mode'
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground mt-4">
                No signup required • Explore the full platform with sample data
              </p>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <a href="#" className="text-primary hover:underline font-medium">
              Contact sales
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
