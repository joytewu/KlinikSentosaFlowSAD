import { useClinic, UserRole } from '@/lib/store';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  UserPlus, 
  Stethoscope, 
  CreditCard, 
  LogOut, 
  Activity,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import logoImage from '@assets/generated_images/modern_minimalist_medical_cross_logo_with_leaf_element.png';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { currentUser, logout } = useClinic();
  const [location, setLocation] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Redirect to login if not authenticated
  if (!currentUser) {
    // Use a small timeout or effect to avoid render-loop if immediate
    // But simpler: just render a redirect or use effect
    // Since we are in the render body, we should use useEffect for side effects like navigation
    // However, to prevent flashing content, we can return null here.
    
    // We'll let the effect handle it.
    setTimeout(() => setLocation('/'), 0);
    return null;
  }

  const navItems = [
    { role: 'receptionist', label: 'Pendaftaran', icon: UserPlus, href: '/reception' },
    { role: 'doctor', label: 'Pemeriksaan', icon: Stethoscope, href: '/doctor' },
    { role: 'cashier', label: 'Pembayaran', icon: CreditCard, href: '/payment' },
    { role: 'admin', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  ];

  const filteredNav = navItems.filter(item => item.role === currentUser);

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 flex items-center gap-3 border-b border-border/50">
        <img src={logoImage} alt="Logo" className="w-8 h-8 object-contain" />
        <span className="font-bold text-xl tracking-tight text-primary">Klinik Sentosa</span>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-2">
        {filteredNav.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div 
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border/50">
        <div className="bg-muted/50 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground capitalize">{currentUser}</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-card border-r border-border/50 fixed inset-y-0 z-50">
        <NavContent />
      </aside>

      {/* Mobile Sheet */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="bg-card">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 animate-in fade-in duration-500">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
