import { useState } from 'react';
import { useClinic, Visit } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CreditCard, Banknote, QrCode, Wallet, CheckCircle, Receipt } from 'lucide-react';

// Simulated QR Code for styling
const QRCodeMock = () => (
  <div className="bg-white p-4 rounded-xl border-2 border-foreground/10 inline-block">
    <div className="w-48 h-48 bg-foreground/5 grid grid-cols-6 grid-rows-6 gap-1">
      {Array.from({ length: 36 }).map((_, i) => (
        <div 
          key={i} 
          className={`rounded-sm ${Math.random() > 0.5 ? 'bg-foreground' : 'bg-transparent'}`} 
        />
      ))}
    </div>
  </div>
);

export default function PaymentPage() {
  const { getQueue, processPayment } = useClinic();
  const { toast } = useToast();
  const [selectedVisit, setSelectedVisit] = useState<(Visit & { patient: any }) | null>(null);
  const [showQR, setShowQR] = useState(false);

  const paymentQueue = getQueue('payment-pending');

  const handleCashPayment = () => {
    if (!selectedVisit) return;
    processPayment(selectedVisit.id, 'cash');
    toast({ title: "Pembayaran Berhasil", description: "Transaksi tunai telah dicatat." });
    setSelectedVisit(null);
  };

  const handleTransferPayment = () => {
    setShowQR(true);
  };

  const confirmTransfer = () => {
    if (!selectedVisit) return;
    processPayment(selectedVisit.id, 'transfer');
    setShowQR(false);
    toast({ title: "Pembayaran Berhasil", description: "Transaksi QRIS berhasil diverifikasi." });
    setSelectedVisit(null);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8 h-[calc(100vh-100px)]">
      {/* Queue List */}
      <Card className="lg:col-span-1 border-none shadow-lg flex flex-col h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Antrian Kasir
          </CardTitle>
          <CardDescription>{paymentQueue.length} tagihan belum dibayar</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full px-6 pb-4">
            <div className="space-y-3">
              {paymentQueue.length === 0 && (
                <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-lg mt-4 border border-dashed">
                  Tidak ada tagihan pending
                </div>
              )}
              {paymentQueue.map((visit) => (
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
                    <span className={`font-mono font-bold ${selectedVisit?.id === visit.id ? 'text-white' : 'text-primary'}`}>
                      Rp {visit.totalCost.toLocaleString()}
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

      {/* Payment Detail */}
      <div className="lg:col-span-2 h-full">
        {selectedVisit ? (
          <Card className="h-full border-none shadow-xl flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
            <CardHeader className="bg-muted/10 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Rincian Tagihan</CardTitle>
                  <CardDescription>No. Invoice: INV-{selectedVisit.id.substring(0,8).toUpperCase()}</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Tagihan</p>
                  <h2 className="text-3xl font-bold text-primary">Rp {selectedVisit.totalCost.toLocaleString()}</h2>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 p-8">
              <div className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 text-lg">Item Layanan & Obat</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-dashed border-border/50">
                       <span className="text-foreground/80">Jasa Konsultasi Dokter</span>
                       <span className="font-medium">Rp 50,000</span>
                    </div>
                    {selectedVisit.diagnosis?.prescriptions.map((p, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                         <span className="text-muted-foreground">
                           {p.medicineName} <span className="text-xs bg-muted px-1 rounded">x{p.quantity}</span>
                         </span>
                         <span className="font-medium">Rp {(p.price * p.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 text-lg">Metode Pembayaran</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="h-24 flex flex-col gap-2 border-2 hover:border-primary hover:bg-primary/5 transition-all"
                      onClick={handleCashPayment}
                    >
                      <Banknote className="w-8 h-8 text-green-600" />
                      <span className="font-semibold text-lg">Tunai / Cash</span>
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="h-24 flex flex-col gap-2 border-2 hover:border-primary hover:bg-primary/5 transition-all"
                      onClick={handleTransferPayment}
                    >
                      <QrCode className="w-8 h-8 text-blue-600" />
                      <span className="font-semibold text-lg">QRIS / Transfer</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-xl bg-muted/5">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Receipt className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Menunggu Pembayaran</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              Pilih tagihan dari daftar antrian untuk memproses pembayaran.
            </p>
          </div>
        )}
      </div>

      {/* QR Modal */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle>Scan QRIS</DialogTitle>
            <DialogDescription>Scan kode QR di bawah ini untuk membayar</DialogDescription>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center justify-center">
            <QRCodeMock />
            <p className="mt-4 font-bold text-xl text-primary">Rp {selectedVisit?.totalCost.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">a.n Klinik Sentosa</p>
          </div>
          <div className="flex gap-3 w-full">
            <Button variant="secondary" className="flex-1" onClick={() => setShowQR(false)}>Batal</Button>
            <Button className="flex-1" onClick={confirmTransfer}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Konfirmasi Bayar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
