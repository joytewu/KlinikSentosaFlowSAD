import { useState } from 'react';
import { useClinic, Visit } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Pill, CheckCircle2, Package, Beaker } from 'lucide-react';

export default function PharmacyPage() {
  const { getQueue, processPrescription } = useClinic();
  const { toast } = useToast();
  const [selectedVisit, setSelectedVisit] = useState<(Visit & { patient: any }) | null>(null);

  const pharmacyQueue = getQueue('pharmacy-queue');

  const handleProcessPrescription = () => {
    if (!selectedVisit) return;
    processPrescription(selectedVisit.id);
    toast({ 
      title: "Resep Selesai", 
      description: "Obat telah disiapkan dan diteruskan ke kasir." 
    });
    setSelectedVisit(null);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8 h-[calc(100vh-100px)]">
      {/* Queue List */}
      <Card className="lg:col-span-1 border-none shadow-lg flex flex-col h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Beaker className="w-5 h-5 text-primary" />
            Antrian Apotek
          </CardTitle>
          <CardDescription>{pharmacyQueue.length} resep menunggu peracikan</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full px-6 pb-4">
            <div className="space-y-3">
              {pharmacyQueue.length === 0 && (
                <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-lg mt-4 border border-dashed">
                  Tidak ada resep menunggu
                </div>
              )}
              {pharmacyQueue.map((visit) => (
                <div 
                  key={visit.id}
                  onClick={() => setSelectedVisit(visit)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md
                    ${selectedVisit?.id === visit.id 
                      ? 'bg-primary text-primary-foreground border-primary shadow-primary/20 shadow-lg' 
                      : 'bg-card hover:border-primary/50 border-border'
                    }
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg">{visit.patient.name}</h4>
                    <span className={`font-mono font-bold text-sm bg-white/20 px-2 py-1 rounded ${selectedVisit?.id === visit.id ? 'text-white' : 'text-primary'}`}>
                      {visit.patient.mrNumber}
                    </span>
                  </div>
                  <div className={`text-sm ${selectedVisit?.id === visit.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {visit.diagnosis?.prescriptions.length} item obat
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Prescription Detail */}
      <div className="lg:col-span-2 h-full">
        {selectedVisit ? (
          <Card className="h-full border-none shadow-xl flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
            <CardHeader className="bg-muted/10 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Detail Resep</CardTitle>
                  <CardDescription>Pasien: {selectedVisit.patient.name} ({selectedVisit.patient.age} th)</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Dokter Pemeriksa</p>
                  <h3 className="font-semibold text-primary">{selectedVisit.doctorName}</h3>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 p-8 overflow-y-auto">
              <div className="space-y-6">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <h4 className="font-semibold mb-2 text-orange-800 text-sm uppercase tracking-wide">Catatan Dokter</h4>
                  <p className="text-orange-900">{selectedVisit.diagnosis?.notes}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 text-lg flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Daftar Obat Racikan
                  </h4>
                  <div className="space-y-3">
                    {selectedVisit.diagnosis?.prescriptions.map((p, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-white border border-border rounded-lg shadow-sm">
                         <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold">
                             {i + 1}
                           </div>
                           <div>
                             <h5 className="font-bold text-lg">{p.medicineName}</h5>
                             <p className="text-muted-foreground">{p.dosage}</p>
                           </div>
                         </div>
                         <div className="text-right">
                           <p className="text-sm text-muted-foreground">Jumlah</p>
                           <p className="font-bold text-xl">{p.quantity} pcs</p>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="border-t border-border/50 bg-muted/5 p-6">
              <Button 
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90 text-lg shadow-lg shadow-primary/20 h-14"
                onClick={handleProcessPrescription}
              >
                <CheckCircle2 className="w-6 h-6 mr-2" />
                Konfirmasi Resep Selesai & Kirim ke Kasir
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-xl bg-muted/5">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Pill className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Menunggu Pesanan Obat</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              Pilih resep dari daftar antrian untuk melihat detail dan memproses obat.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
