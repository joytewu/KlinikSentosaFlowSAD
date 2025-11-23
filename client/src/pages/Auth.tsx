import { useClinic } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCog, Stethoscope, CreditCard, LayoutDashboard } from 'lucide-react';
import { useLocation } from 'wouter';
import logoImage from '@assets/generated_images/modern_minimalist_medical_cross_logo_with_leaf_element.png';
import bgImage from '@assets/generated_images/abstract_medical_technology_background.png';

export default function AuthPage() {
  const { login } = useClinic();
  const [, setLocation] = useLocation();

  const handleLogin = (role: any, path: string) => {
    login(role);
    setLocation(path);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img src={bgImage} alt="Background" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/90 to-background" />
      </div>

      <div className="relative z-10 w-full max-w-4xl p-4 grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6 text-center md:text-left">
          <div className="flex justify-center md:justify-start">
             <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center p-4">
                <img src={logoImage} alt="Logo" className="w-full h-full object-contain" />
             </div>
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-2">
              Klinik Sentosa
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Sistem Informasi Manajemen Klinik Terpadu. Cepat, Tepat, dan Terpercaya.
            </p>
          </div>
        </div>

        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Login Portal</CardTitle>
            <CardDescription>Pilih peran anda untuk masuk ke sistem</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button 
              size="lg" 
              className="w-full h-14 text-lg justify-start gap-4 transition-transform hover:scale-[1.02]"
              onClick={() => handleLogin('receptionist', '/reception')}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <UserCog className="w-5 h-5" />
              </div>
              Resepsionis / Pendaftaran
            </Button>

            <Button 
              size="lg" 
              variant="outline"
              className="w-full h-14 text-lg justify-start gap-4 transition-transform hover:scale-[1.02] bg-white hover:bg-slate-50"
              onClick={() => handleLogin('doctor', '/doctor')}
            >
              <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              Dokter Pemeriksa
            </Button>

            <Button 
              size="lg" 
              variant="outline"
              className="w-full h-14 text-lg justify-start gap-4 transition-transform hover:scale-[1.02] bg-white hover:bg-slate-50"
              onClick={() => handleLogin('cashier', '/payment')}
            >
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              Kasir / Pembayaran
            </Button>

            <Button 
              size="lg" 
              variant="outline"
              className="w-full h-14 text-lg justify-start gap-4 transition-transform hover:scale-[1.02] bg-white hover:bg-slate-50"
              onClick={() => handleLogin('admin', '/admin')}
            >
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              Admin / Pemilik
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
