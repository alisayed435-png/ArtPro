/**
 * Landing Page for Calyx Command
 * 
 * This is the public-facing marketing page with hero section,
 * features, and clear CTAs for Login and Try Demo.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Palette,
  ShoppingCart,
  BarChart3,
  Zap,
  Lock,
  Loader2,
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { useAuth } from '@/app/auth-context';

// ============================================================================
// Feature Cards Data
// ============================================================================

const features = [
  {
    icon: ShoppingCart,
    title: 'Order Management',
    description: 'Track orders from placement to delivery with real-time status updates and detailed timelines.',
  },
  {
    icon: Palette,
    title: 'Artwork Approval',
    description: 'Streamlined artwork submission and approval workflow with version control and feedback.',
  },
  {
    icon: Shield,
    title: 'METRC Compliance',
    description: 'Seamless integration with state compliance systems. Stay audit-ready at all times.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description: 'Comprehensive dashboards and reports to understand your packaging operations.',
  },
  {
    icon: Zap,
    title: 'Real-time Updates',
    description: 'Live system status monitoring with instant notifications for critical events.',
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description: 'Bank-level encryption and role-based access control to protect your data.',
  },
];

// ============================================================================
// Stats Data
// ============================================================================

const stats = [
  { value: '500+', label: 'Active Customers' },
  { value: '2M+', label: 'Packages Tracked' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '24/7', label: 'Support' },
];

// ============================================================================
// Landing Page Component
// ============================================================================

export function LandingPage() {
  const navigate = useNavigate();
  const { startDemoMode, isAuthenticated } = useAuth();
  const [isStartingDemo, setIsStartingDemo] = useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleTryDemo = async () => {
    setIsStartingDemo(true);
    try {
      await startDemoMode();
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to start demo:', error);
    } finally {
      setIsStartingDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6M12 12l-4 4M12 12l4 4M12 12l-3-3M12 12l3-3" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-xl">Calyx Command</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Button onClick={handleTryDemo} disabled={isStartingDemo} className="hidden sm:flex">
              {isStartingDemo ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  Try Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <Zap className="h-4 w-4" />
          Trusted by leading cannabis brands
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mx-auto mb-6">
          The Complete Packaging
          <span className="text-primary block">Operations Platform</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Streamline your cannabis packaging operations with Calyx Command. 
          Manage orders, artwork approvals, and stay compliant—all in one place.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Button size="lg" onClick={handleTryDemo} disabled={isStartingDemo} className="w-full sm:w-auto">
            {isStartingDemo ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Starting Demo...
              </>
            ) : (
              <>
                Try Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
          <Link to="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Log in to Your Account
            </Button>
          </Link>
        </div>
        
        <p className="text-sm text-muted-foreground">
          No signup required • Explore dashboards, orders, artwork approvals, uploads
        </p>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="container mx-auto px-4 pb-24">
        <div className="relative max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" style={{ top: '60%' }} />
          <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
            <div className="h-8 bg-muted flex items-center gap-2 px-4 border-b">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <div className="flex-1 text-center text-xs text-muted-foreground">
                app.calyxcommand.com
              </div>
            </div>
            <div className="p-4 bg-muted/30">
              <img
                src="https://placehold.co/1200x700/f8fafc/94a3b8?text=Dashboard+Preview"
                alt="Calyx Command Dashboard Preview"
                className="rounded-lg border shadow-sm w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A complete suite of tools designed specifically for cannabis packaging operations.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="bg-card/50 backdrop-blur border-muted">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Trust Section */}
      <section className="container mx-auto px-4 pb-24">
        <div className="bg-card rounded-2xl border p-8 md:p-12 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Built for Compliance</h2>
            <p className="text-muted-foreground">
              Calyx Command is designed with cannabis industry regulations in mind.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'METRC API Integration',
              'Audit Trail Logging',
              'Role-Based Permissions',
              'SOC 2 Compliant Infrastructure',
              'Automated Compliance Checks',
              'Real-time Sync Status',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 pb-24">
        <div className="bg-primary rounded-2xl p-8 md:p-12 text-center text-primary-foreground max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Streamline Your Operations?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Join hundreds of cannabis brands who trust Calyx Command for their packaging operations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              onClick={handleTryDemo}
              disabled={isStartingDemo}
            >
              {isStartingDemo ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  Try Demo Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-primary-foreground/20 hover:bg-primary-foreground/10"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6M12 12l-4 4M12 12l4 4M12 12l-3-3M12 12l3-3" />
                </svg>
              </div>
              <span className="font-semibold">Calyx Command</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Calyx Command. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
