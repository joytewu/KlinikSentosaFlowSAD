import { useState } from 'react';
import { useClinic, Medicine, Diagnosis } from '@/lib/store';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Stethoscope, Plus, Trash2, Pill, CheckCircle2, User, Clock, History, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const diagnosisSchema = z.object({
  notes: z.string().min(10, "Diagnosis harus detail"),
  prescriptions: z.array(z.object({
    medicineId: z.string().min(1, "Pilih obat"),
    dosage: z.string().min(1, "Dosis wajib diisi"),
    quantity: z.coerce.number().min(1, "Jumlah minimal 1"),
  })).min(0)
});

export default function DoctorPage() {
  const { getQueue, updateVisitStatus, submitDiagnosis, medicines, visits } = useClinic();
  const { toast } = useToast();
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);

  const waitingQueue = getQueue('waiting');
  const selectedVisit = waitingQueue.find(v => v.id === selectedVisitId);

  // Get patient history
  const patientHistory = selectedVisit 
    ? visits.filter(v => v.patientId === selectedVisit.patientId && v.status === 'completed' && v.id !== selectedVisit.id)
    : [];

  const form = useForm<z.infer<typeof diagnosisSchema>>({
    resolver: zodResolver(diagnosisSchema),
    defaultValues: { notes: '', prescriptions: [] }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "prescriptions"
  });

  const handleStartConsultation = (visitId: string) => {
    setSelectedVisitId(visitId);
    form.reset({ notes: '', prescriptions: [] });
  };

  const onSubmit = (data: z.infer<typeof diagnosisSchema>) => {
    if (!selectedVisitId) return;

    const enrichedPrescriptions = data.prescriptions.map(p => {
      const med = medicines.find(m => m.id === p.medicineId)!;
      return {
        ...p,
        medicineName: med.name,
        price: med.price
      };
    });

    submitDiagnosis(selectedVisitId, {
      notes: data.notes,
      prescriptions: enrichedPrescriptions
    });

    toast({
      title: "Pemeriksaan Selesai",
      description: "Resep telah dikirim ke bagian pembayaran.",
    });
    setSelectedVisitId(null);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8 h-[calc(100vh-100px)]">
      {/* Sidebar Queue */}
      <Card className="lg:col-span-1 border-none shadow-lg flex flex-col h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Antrian Pasien
          </CardTitle>
          <CardDescription>{waitingQueue.length} pasien menunggu</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full px-6 pb-4">
            <div className="space-y-3">
              {waitingQueue.length === 0 && (
                <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-lg mt-4 border border-dashed">
                  Tidak ada antrian saat ini
                </div>
              )}
              {waitingQueue.map((visit) => (
                <div 
                  key={visit.id}
                  onClick={() => handleStartConsultation(visit.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md
                    ${selectedVisitId === visit.id 
                      ? 'bg-primary text-primary-foreground border-primary shadow-primary/20 shadow-lg' 
                      : 'bg-card hover:border-primary/50 border-border'
                    }
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg">{visit.patient.name}</h4>
                    <Badge variant={selectedVisitId === visit.id ? 'secondary' : 'outline'}>
                      {visit.patient.mrNumber}
                    </Badge>
                  </div>
                  <div className={`text-sm line-clamp-2 ${selectedVisitId === visit.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {visit.complaint}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Consultation Area */}
      <div className="lg:col-span-2 h-full">
        {selectedVisit ? (
          <Card className="h-full border-none shadow-xl flex flex-col animate-in fade-in duration-300">
            <CardHeader className="border-b border-border/50 bg-muted/10 pb-0">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <CardTitle className="text-2xl text-primary flex items-center gap-2">
                    <Stethoscope className="w-6 h-6" />
                    Pemeriksaan Medis
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Pasien: <span className="font-semibold text-foreground">{selectedVisit.patient.name}</span> ({selectedVisit.patient.age} tahun)
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Keluhan Utama</p>
                  <p className="font-medium max-w-md text-sm">{selectedVisit.complaint}</p>
                </div>
              </div>
            </CardHeader>
            
            <Tabs defaultValue="examination" className="flex-1 flex flex-col">
              <div className="px-6 pt-2 bg-muted/10 border-b border-border/50">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="examination">
                    <FileText className="w-4 h-4 mr-2" />
                    Pemeriksaan
                  </TabsTrigger>
                  <TabsTrigger value="history">
                    <History className="w-4 h-4 mr-2" />
                    Riwayat Medis ({patientHistory.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <CardContent className="flex-1 overflow-y-auto p-6">
                <TabsContent value="examination" className="mt-0 space-y-6 h-full">
                   <div>
                     <label className="text-sm font-medium mb-2 block text-foreground/80">Diagnosis & Catatan Dokter</label>
                     <Textarea 
                      className="min-h-[150px] text-base resize-none bg-muted/10 focus:bg-white transition-colors" 
                      placeholder="Tulis hasil pemeriksaan dan diagnosis..." 
                      value={form.watch('notes')}
                      onChange={(e) => form.setValue('notes', e.target.value)}
                     />
                   </div>

                   <Separator />

                   <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Pill className="w-4 h-4 text-indigo-500" />
                          Resep Obat
                        </h3>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => append({ medicineId: '', dosage: '3x1 Sesudah Makan', quantity: 10 })}
                          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Tambah Obat
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {fields.map((field, index) => (
                          <div key={field.id} className="grid grid-cols-12 gap-3 items-end bg-muted/20 p-3 rounded-lg border border-border/50">
                            <div className="col-span-5">
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Nama Obat</label>
                              <Select 
                                onValueChange={(val) => form.setValue(`prescriptions.${index}.medicineId`, val)}
                                defaultValue={field.medicineId}
                              >
                                <SelectTrigger className="bg-white">
                                  <SelectValue placeholder="Pilih Obat" />
                                </SelectTrigger>
                                <SelectContent>
                                  {medicines.map(m => (
                                    <SelectItem key={m.id} value={m.id}>
                                      {m.name} (Stok: {m.stock})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="col-span-4">
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Aturan Pakai</label>
                              <Select 
                                onValueChange={(val) => form.setValue(`prescriptions.${index}.dosage`, val)}
                                defaultValue={field.dosage}
                              >
                                <SelectTrigger className="bg-white">
                                  <SelectValue placeholder="Dosis" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="3x1 Sesudah Makan">3x1 Sesudah Makan</SelectItem>
                                  <SelectItem value="3x1 Sebelum Makan">3x1 Sebelum Makan</SelectItem>
                                  <SelectItem value="2x1 Sesudah Makan">2x1 Sesudah Makan</SelectItem>
                                  <SelectItem value="1x1 Sesudah Makan">1x1 Sesudah Makan</SelectItem>
                                  <SelectItem value="1x1 Malam Hari">1x1 Malam Hari</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="col-span-2">
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Jumlah</label>
                              <Input 
                                type="number" 
                                className="bg-white"
                                {...form.register(`prescriptions.${index}.quantity`)}
                              />
                            </div>

                            <div className="col-span-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:bg-destructive/10 w-full"
                                onClick={() => remove(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {fields.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                            Belum ada resep obat
                          </div>
                        )}
                      </div>
                   </div>
                </TabsContent>

                <TabsContent value="history" className="mt-0 h-full">
                  <ScrollArea className="h-full pr-4">
                    <div className="space-y-4">
                      {patientHistory.length === 0 && (
                         <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                           <History className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                           <p>Belum ada riwayat pemeriksaan sebelumnya</p>
                         </div>
                      )}
                      {patientHistory.map((history) => (
                        <Card key={history.id} className="bg-muted/10">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between">
                              <CardTitle className="text-base font-medium">
                                {new Date(history.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                              </CardTitle>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Selesai</Badge>
                            </div>
                            <CardDescription>Dr. Sentosa</CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm space-y-2">
                            <div>
                              <span className="font-semibold">Keluhan:</span> {history.complaint}
                            </div>
                            <div>
                              <span className="font-semibold">Diagnosis/Catatan:</span>
                              <p className="mt-1 text-muted-foreground bg-white p-2 rounded border border-border/50">
                                {history.diagnosis?.notes || '-'}
                              </p>
                            </div>
                            <div>
                              <span className="font-semibold">Resep:</span>
                              <ul className="list-disc list-inside mt-1 text-muted-foreground">
                                {history.diagnosis?.prescriptions.map((p, idx) => (
                                  <li key={idx}>{p.medicineName} ({p.quantity} pcs) - {p.dosage}</li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </CardContent>

              <TabsContent value="examination">
                <CardFooter className="border-t border-border/50 bg-muted/5 p-6 mt-auto">
                  <Button 
                    size="lg" 
                    className="w-full bg-primary hover:bg-primary/90 text-lg shadow-lg shadow-primary/20"
                    onClick={form.handleSubmit(onSubmit)}
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Selesaikan Pemeriksaan & Buat Resep
                  </Button>
                </CardFooter>
              </TabsContent>
            </Tabs>
          </Card>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-xl bg-muted/5">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Mode Menunggu</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              Pilih pasien dari daftar antrian di sebelah kiri untuk memulai pemeriksaan medis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}