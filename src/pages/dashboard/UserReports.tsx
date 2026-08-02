import UserDashboardLayout from "./UserDashboardLayout";
import { BarChart3 } from "lucide-react";

export default function UserReports() {
  return (
    <UserDashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto relative z-10">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-foreground">Laporan</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/90 mt-1">
            Menampilkan laporan total penjualan per hari
          </p>
        </div>

        <div className="rounded-[1.5rem] overflow-hidden bg-secondary/60 border border-border/80 shadow-[0_0_30px_rgba(249,115,22,0.08)] backdrop-blur-xl">
          <div className="p-16 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-secondary/60 mb-6 shadow-inner">
              <BarChart3 className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">Data tidak ditemukan!</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/90">
              Tidak ada aktivitas data saat ini.
            </p>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
}
