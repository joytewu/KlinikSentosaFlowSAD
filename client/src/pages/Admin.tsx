import { useClinic } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users, CreditCard, Banknote, DollarSign, Activity } from 'lucide-react';

export default function AdminPage() {
  const { getRevenue, visits, patients } = useClinic();
  const revenue = getRevenue();

  // Prepare dummy chart data based on real interactions + some mock history
  const chartData = [
    { name: 'Senin', total: 1500000 },
    { name: 'Selasa', total: 2300000 },
    { name: 'Rabu', total: 1800000 },
    { name: 'Kamis', total: 3200000 },
    { name: 'Jumat', total: 2100000 },
    { name: 'Sabtu', total: 4500000 },
    { name: 'Minggu', total: revenue.today }, // Real data for today
  ];

  const StatCard = ({ title, value, sub, icon: Icon, colorClass }: any) => (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-full ${colorClass} bg-opacity-10`}>
          <Icon className={`h-4 w-4 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Pemilik</h2>
          <p className="text-muted-foreground">Ringkasan performa dan pendapatan Klinik Sentosa.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Pendapatan" 
          value={`Rp ${revenue.total.toLocaleString()}`} 
          sub="+20.1% dari bulan lalu"
          icon={DollarSign}
          colorClass="bg-emerald-500"
        />
        <StatCard 
          title="Pendapatan Hari Ini" 
          value={`Rp ${revenue.today.toLocaleString()}`} 
          sub="Update real-time"
          icon={TrendingUp}
          colorClass="bg-blue-500"
        />
        <StatCard 
          title="Kunjungan Pasien" 
          value={visits.length} 
          sub="Total pasien terlayani"
          icon={Users}
          colorClass="bg-orange-500"
        />
        <StatCard 
          title="Metode Transfer" 
          value={`Rp ${revenue.byMethod.transfer.toLocaleString()}`} 
          sub={`${Math.round((revenue.byMethod.transfer / (revenue.total || 1)) * 100)}% dari total transaksi`}
          icon={CreditCard}
          colorClass="bg-purple-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-lg">
          <CardHeader>
            <CardTitle>Grafik Pendapatan Mingguan</CardTitle>
            <CardDescription>Tren pendapatan klinik selama 7 hari terakhir</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748B" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#64748B" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `Rp${value/1000}k`} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#F1F5F9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#0EA5E9' : '#94A3B8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none shadow-lg">
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>Log transaksi dan kunjungan</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-6">
                {visits.slice(-5).reverse().map((visit, i) => {
                  const patient = patients.find(p => p.id === visit.patientId);
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div className={`mt-1 p-2 rounded-full ${
                        visit.status === 'completed' ? 'bg-green-100 text-green-600' :
                        visit.status === 'payment-pending' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <Activity className="w-4 h-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {visit.status === 'completed' ? 'Pembayaran Selesai' :
                           visit.status === 'payment-pending' ? 'Menunggu Pembayaran' :
                           'Pemeriksaan Dokter'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Pasien: {patient?.name || 'Unknown'} - {patient?.mrNumber}
                        </p>
                      </div>
                      <div className="text-xs font-medium text-muted-foreground">
                        {new Date(visit.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  );
                })}
                {visits.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm">Belum ada aktivitas hari ini</p>
                )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
