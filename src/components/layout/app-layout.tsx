/**
 * Main App Layout with Sidebar, Top Bar, and Content Area
 */

import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Palette,
  Shield,
  BarChart3,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  Search,
  LogOut,
  User,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/app/auth-context';
import {
  Button,
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Badge,
} from '@/components/ui';

// ============================================================================
// Navigation Items
// ============================================================================

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/artwork', label: 'Artwork', icon: Palette },
  { path: '/compliance', label: 'Compliance', icon: Shield },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/status', label: 'System Status', icon: Activity },
];

// ============================================================================
// Demo Mode Banner
// ============================================================================

function DemoModeBanner() {
  const { isDemoMode, resetDemo } = useAuth();
  const [isResetting, setIsResetting] = useState(false);

  if (!isDemoMode) return null;

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetDemo();
      window.location.reload();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="bg-primary text-primary-foreground px-4 py-2 text-center text-sm flex items-center justify-center gap-4">
      <span className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
          Demo Mode
        </Badge>
        You're exploring Calyx Command with sample data
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReset}
        disabled={isResetting}
        className="text-white hover:bg-white/20 h-7"
      >
        <RefreshCw className={cn("h-3 w-3 mr-1", isResetting && "animate-spin")} />
        Reset Demo
      </Button>
    </div>
  );
}

// ============================================================================
// Sidebar Component
// ============================================================================

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-6 border-b",
        collapsed ? "justify-center" : ""
      )}>
        <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6M12 12l-4 4M12 12l4 4M12 12l-3-3M12 12l3-3" />
          </svg>
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-semibold text-lg leading-tight">Calyx</span>
            <span className="text-xs text-muted-foreground leading-tight">Command</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <TooltipProvider key={item.path} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    onClick={onMobileClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      collapsed ? "justify-center" : ""
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-3 py-4 border-t hidden lg:block">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            "w-full justify-center",
            !collapsed && "justify-start"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Collapse
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col bg-card border-r transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside className={cn(
        "lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-card transform transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="icon" onClick={onMobileClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}

// ============================================================================
// Top Bar Component
// ============================================================================

interface TopBarProps {
  onMobileMenuClick: () => void;
}

function TopBar({ onMobileMenuClick }: TopBarProps) {
  const { user, organization, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="h-16 border-b bg-card px-4 flex items-center justify-between gap-4">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMobileMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Organization Switcher */}
      <div className="hidden sm:flex items-center gap-2">
        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
          <Building2 className="h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium leading-tight">{organization?.name}</span>
          <span className="text-xs text-muted-foreground leading-tight">
            {organization?.licenseNumber}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders, artwork, compliance..."
            className="pl-9 bg-muted/50 border-0"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-4 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.firstName} {user?.lastName}</span>
                <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// ============================================================================
// Main Layout Component
// ============================================================================

interface AppLayoutProps {
  children?: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DemoModeBanner />
      <div className="flex flex-1">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onMobileMenuClick={() => setMobileMenuOpen(true)} />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
}
