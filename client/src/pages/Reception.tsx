import { useState } from 'react';
import { useClinic, Patient } from '@/lib/store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Search, UserPlus, Clock, Activity } from 'lucide-react';

// Schema for New Patient
const newPatientSchema = z.object({
  name: z.string().min(2, "Nama wajib diisi"),
  age: z.coerce.number().min(0, "Umur tidak valid"),
  phone: z.string().min(10, "Nomor HP minimal 10 digit"),
  address: z.string().min(5, "Alamat wajib diisi"),
  complaint: z.string().min(5, "Keluhan wajib diisi"),
});

// Schema for Existing Patient
const existingPatientSchema = z.object({
  patientId: z.string().min(1, "Pilih pasien"),
  complaint: z.string().min(5, "Keluhan wajib diisi"),
});

export default function ReceptionPage() {
  const { patients, registerPatient, createVisit } = useClinic();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const newPatientForm = useForm<z.infer<typeof newPatientSchema>>({
    resolver: zodResolver(newPatientSchema),
    defaultValues: { name: '', age: 0, phone: '', address: '', complaint: '' }
  });

  const existingPatientForm = useForm<z.infer<typeof existingPatientSchema>>({
    resolver: zodResolver(existingPatientSchema),
    defaultValues: { patientId: '', complaint: '' }
  });

  const onNewSubmit = (data: z.infer<typeof newPatientSchema>) => {
    const { complaint, ...patientData } = data;
    const id = registerPatient(patientData, true);
    createVisit(id, complaint);
    
    toast({
      title: "Pendaftaran Berhasil",
      description: `Pasien ${data.name} telah ditambahkan ke antrian dokter.`,
    });
    newPatientForm.reset();
  };

  const onExistingSubmit = (data: z.infer<typeof existingPatientSchema>) => {
    createVisit(data.patientId, data.complaint);
    const patient = patients.find(p => p.id === data.patientId);
    
    toast({
      title: "Pendaftaran Berhasil",
      description: `Pasien ${patient?.name} telah ditambahkan ke antrian dokter.`,
    });
    existingPatientForm.reset();
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.mrNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Pendaftaran Pasien</h2>
          <p className="text-muted-foreground">Kelola pendaftaran pasien baru dan lama.</p>
        </div>
        <div className="bg-white p-2 rounded-full shadow-sm border border-border">
          <Activity className="text-primary w-6 h-6" />
        </div>
      </div>

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 h-14 bg-muted/50 p-1">
          <TabsTrigger value="new" className="text-base data-[state=active]:bg-white data-[state=active]:shadow-sm h-full rounded-lg">Pasien Baru</TabsTrigger>
          <TabsTrigger value="existing" className="text-base data-[state=active]:bg-white data-[state=active]:shadow-sm h-full rounded-lg">Pasien Lama</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="animate-in slide-in-from-bottom-4 duration-500">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Formulir Pasien Baru</CardTitle>
              <CardDescription>Isi data diri lengkap untuk pasien yang baru pertama kali berkunjung.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...newPatientForm}>
                <form onSubmit={newPatientForm.handleSubmit(onNewSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={newPatientForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Lengkap</FormLabel>
                          <FormControl><Input placeholder="Masukan nama lengkap" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={newPatientForm.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Umur</FormLabel>
                          <FormControl><Input type="number" placeholder="Umur" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={newPatientForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor Telepon</FormLabel>
                          <FormControl><Input placeholder="08..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={newPatientForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alamat</FormLabel>
                          <FormControl><Input placeholder="Alamat domisili" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={newPatientForm.control}
                    name="complaint"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Keluhan Utama</FormLabel>
                        <FormControl><Textarea placeholder="Jelaskan keluhan yang dirasakan..." className="min-h-[100px]" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" size="lg" className="w-full md:w-auto">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Daftarkan Pasien
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="existing" className="animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="border-none shadow-md h-fit">
              <CardHeader>
                <CardTitle>Cari Pasien</CardTitle>
                <CardDescription>Cari berdasarkan nama atau No. RM</CardDescription>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Ketik nama pasien..." 
                    className="pl-9 bg-muted/30"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {filteredPatients.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Pasien tidak ditemukan</p>
                  )}
                  {filteredPatients.map((patient) => (
                    <div 
                      key={patient.id}
                      className={`p-4 rounded-lg border transition-all cursor-pointer hover:border-primary hover:bg-primary/5
                        ${existingPatientForm.watch('patientId') === patient.id ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-border'}
                      `}
                      onClick={() => existingPatientForm.setValue('patientId', patient.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-foreground">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">{patient.mrNumber}</p>
                        </div>
                        <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">{patient.age} th</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg h-fit">
              <CardHeader>
                <CardTitle>Formulir Kunjungan</CardTitle>
                <CardDescription>Daftarkan kunjungan baru untuk pasien terpilih.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...existingPatientForm}>
                  <form onSubmit={existingPatientForm.handleSubmit(onExistingSubmit)} className="space-y-6">
                    <FormField
                      control={existingPatientForm.control}
                      name="patientId"
                      render={({ field }) => (
                        <FormItem className="hidden">
                          <FormControl><Input {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="p-4 bg-muted/30 rounded-lg border border-dashed border-border">
                      <p className="text-sm text-muted-foreground mb-1">Pasien Terpilih:</p>
                      {existingPatientForm.watch('patientId') ? (
                        <p className="font-medium text-primary text-lg">
                          {patients.find(p => p.id === existingPatientForm.watch('patientId'))?.name}
                        </p>
                      ) : (
                        <p className="text-muted-foreground italic">Belum ada pasien dipilih dari daftar</p>
                      )}
                    </div>

                    <FormField
                      control={existingPatientForm.control}
                      name="complaint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Keluhan Saat Ini</FormLabel>
                          <FormControl><Textarea placeholder="Jelaskan keluhan yang dirasakan..." className="min-h-[120px]" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" size="lg" className="w-full" disabled={!existingPatientForm.watch('patientId')}>
                      <Clock className="w-4 h-4 mr-2" />
                      Masuk Antrian
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
