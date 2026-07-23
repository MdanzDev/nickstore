import { FileText, Key, Code, ShieldAlert, Zap, Box, Server, List } from "lucide-react";

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-[#020817] py-12 text-slate-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-in fade-in duration-500">
        
        {/* Header Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20">
            <Code className="w-4 h-4" /> V1 REST API
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-100 tracking-tight">Kryz-Net API Documentation</h1>
          <p className="text-lg text-slate-400 max-w-2xl">
            Integrasikan layanan top-up otomatis Kryz-Net secara mulus ke platform Anda. Dapatkan profil, daftar produk, dan buat pesanan langsung melalui API V1 kami.
          </p>
        </div>

        {/* Base URL */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm uppercase tracking-wider font-semibold text-slate-500 mb-2">Base URL</h2>
          <code className="text-emerald-400 text-lg bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-500/20 block w-fit">
            https://api.kryz-net.space
          </code>
        </div>

        {/* Important Warning */}
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-5 flex gap-4 text-amber-200">
          <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-400 text-lg">Peringatan Keamanan</p>
            <p className="text-amber-200/80 leading-relaxed">
              Kunci API Anda memberikan akses langsung ke saldo akun Anda. Jaga kerahasiaannya dengan baik. Jangan pernah mempublikasikan kunci API di kode sisi klien (seperti di peramban atau aplikasi seluler). Semua panggilan API harus berasal dari server backend yang aman.
            </p>
          </div>
        </div>

        {/* Authentication */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
            <Key className="w-6 h-6 text-indigo-400" /> Autentikasi
          </h2>
          <p className="text-slate-400">
            Semua permintaan API harus menyertakan Kunci API Anda di header <code className="text-slate-300">Authorization</code>.
          </p>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-sm overflow-x-auto">
            <span className="text-slate-400">Authorization:</span> Bearer <span className="text-emerald-400">kryz_live_YOUR_API_KEY</span>
          </div>
          <p className="text-xs text-slate-500 italic">* Anda juga dapat mengirimkannya melalui header <code className="not-italic">X-API-KEY</code>.</p>
        </section>

        {/* Rate Limits */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" /> Batas Permintaan (Rate Limits)
          </h2>
          <p className="text-slate-400">
            Untuk memastikan stabilitas sistem, batas permintaan berikut berlaku:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-300">
            <li><strong>Endpoint Baca</strong> (Profil, Produk, Status Order): <span className="text-blue-400">60 permintaan / menit</span></li>
            <li><strong>Endpoint Mutasi</strong> (Pembuatan Order): <span className="text-amber-400">10 permintaan / menit</span></li>
          </ul>
        </section>

        <hr className="border-slate-800" />

        {/* Endpoints */}
        <div className="space-y-10">
          <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
            <Server className="w-7 h-7 text-blue-400" /> Endpoints API
          </h2>

          {/* 1. Profile */}
          <div className="bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center gap-3">
              <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-sm font-bold">GET</span>
              <span className="font-mono text-slate-200">/api/v1/profile</span>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-400">Mendapatkan detail akun Anda dan saldo saat ini.</p>
              
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Contoh Respons (200 OK)</h3>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-sm text-emerald-300 font-mono">
{`{
  "user_id": "uuid-here",
  "username": "your_username",
  "balance_myr": 150.50,
  "balance_idr": 200000.00
}`}
              </pre>
            </div>
          </div>

          {/* 2. Products */}
          <div className="bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center gap-3">
              <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-sm font-bold">GET</span>
              <span className="font-mono text-slate-200">/api/v1/products</span>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-400">Mendapatkan daftar produk aktif dan harganya berdasarkan margin profit akun Anda.</p>
              
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Contoh Respons (200 OK)</h3>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-sm text-emerald-300 font-mono">
{`{
  "products": [
    {
      "id": "1",
      "name": "Mobile Legends 86 Diamonds",
      "brand": "Mobile Legends",
      "code": "mlbb_86",
      "price_myr": 10.00,
      "price_idr": 35000.00
    }
  ]
}`}
              </pre>
            </div>
          </div>

          {/* 3. Place Order */}
          <div className="bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center gap-3">
              <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-sm font-bold">POST</span>
              <span className="font-mono text-slate-200">/api/v1/order</span>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-400">Membuat order top-up baru. Saldo akan otomatis terpotong.</p>
              
              <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-4 flex gap-3 text-blue-200 text-sm">
                <Box className="w-5 h-5 text-blue-400 shrink-0" />
                <p>Selalu sertakan header <code className="bg-slate-950 px-1 rounded text-blue-300">Idempotency-Key</code> (UUID unik per transaksi) untuk mencegah tagihan ganda jika terjadi timeout jaringan.</p>
              </div>

              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Body Request (JSON)</h3>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-sm text-slate-300 font-mono">
{`{
  "product_id": "1",
  "player_id": "12345678",
  "server_id": "1234"
}`}
              </pre>

              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Contoh Respons (201 Created)</h3>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-sm text-emerald-300 font-mono">
{`{
  "order_id": "KRYZ-1718889900000-1234",
  "status": "Processing",
  "idempotency_key": "a-unique-uuid-per-request",
  "message": "Processed via API"
}`}
              </pre>
            </div>
          </div>

          {/* 4. Order Status */}
          <div className="bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center gap-3">
              <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-sm font-bold">GET</span>
              <span className="font-mono text-slate-200">/api/v1/order/:id</span>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-400">Mengecek status order spesifik.</p>
              
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Contoh Respons (200 OK)</h3>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-sm text-emerald-300 font-mono">
{`{
  "order_id": "KRYZ-1718889900000-1234",
  "status": "Processing",
  "product_name": "Mobile Legends 86 Diamonds",
  "amount_myr": 10.00,
  "amount_idr": 35000.00,
  "created_at": "2024-06-20T12:00:00Z",
  "updated_at": "2024-06-20T12:01:00Z"
}`}
              </pre>
            </div>
          </div>

          {/* 5. Deposit */}
          <div className="bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center gap-3">
              <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-sm font-bold">POST</span>
              <span className="font-mono text-slate-200">/api/v1/deposit</span>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-400">Request pembuatan deposit otomatis menggunakan QRIS. Saldo akan otomatis bertambah saat pembayaran QRIS berhasil.</p>
              
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Payload Request (JSON)</h3>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-sm text-amber-200 font-mono">
{`{
  "amount": 50.00,
  "method": "qris" // Opsional, default: "qris"
}`}
              </pre>

              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide pt-2">Contoh Respons (201 Created)</h3>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-sm text-emerald-300 font-mono">
{`{
  "deposit_id": "INV-123456789",
  "amount_myr": 50.00,
  "amount_idr": 175000.00,
  "payment_method": "QRIS",
  "qr_string": "00020101021126670016COM.NOBUBANK.WWW...",
  "status": "Pending",
  "expired_at": "2026-07-22T09:00:00Z"
}`}
              </pre>
            </div>
          </div>

          {/* 6. Deposit Status */}
          <div className="bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center gap-3">
              <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-sm font-bold">GET</span>
              <span className="font-mono text-slate-200">/api/v1/deposit/:id</span>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-400">Mengecek status deposit secara real-time berdasarkan Invoice ID. Poll endpoint ini setiap beberapa detik untuk mengetahui apakah pembayaran sudah berhasil.</p>
              
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 space-y-1">
                <p className="font-semibold text-slate-200 mb-2">Nilai Status yang Mungkin:</p>
                <div className="flex gap-2"><span className="font-mono text-amber-400">Pending</span><span className="text-slate-400">— Menunggu pembayaran</span></div>
                <div className="flex gap-2"><span className="font-mono text-emerald-400">PAID</span><span className="text-slate-400">— Pembayaran berhasil, saldo sudah ditambahkan</span></div>
                <div className="flex gap-2"><span className="font-mono text-rose-400">EXPIRED</span><span className="text-slate-400">— Kadaluarsa, tidak dibayar dalam batas waktu</span></div>
              </div>

              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide pt-2">Contoh Respons (200 OK)</h3>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-sm text-emerald-300 font-mono">
{`{
  "deposit_id": "DEPO220726154719546API",
  "status": "PAID",
  "amount_idr": 215000.00,
  "payment_method": "QRIS (Gopay/All Payment)",
  "qr_string": "https://cdn.mytopupku.com/...",
  "created_at": "2026-07-22T08:00:00Z",
  "paid_at": "2026-07-22T08:05:33Z"
}`}
              </pre>
            </div>
          </div>

          {/* 7. Validate Account */}
          <div className="bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center gap-3">
              <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-sm font-bold">POST</span>
              <span className="font-mono text-slate-200">/api/v1/validate-account</span>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-400">Memeriksa nama panggilan (nickname) dalam game (in-game) untuk memastikan Player ID dan Zone ID valid sebelum Anda membuat pesanan.</p>
              
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Payload Request (JSON)</h3>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-sm text-slate-300 font-mono">
{`{
  "game_slug": "mobile-legends",
  "player_id": "12345678",
  "zone_id": "1234"
}`}
              </pre>

              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide pt-2">Contoh Respons (200 OK)</h3>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-sm text-emerald-300 font-mono">
{`{
  "success": true,
  "nickname": "Imanmanzz"
}`}
              </pre>
            </div>
          </div>

          {/* 8. Transaction History */}
          <div className="bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center gap-3">
              <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-sm font-bold">GET</span>
              <span className="font-mono text-slate-200">/api/v1/history</span>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-400">Mendapatkan daftar 50 pesanan terakhir Anda. Berguna untuk sinkronisasi riwayat transaksi atau membuat log pesanan di platform Anda.</p>
              
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 space-y-1">
                <p className="font-semibold text-slate-200 mb-2">Query Parameters (Opsional):</p>
                <div className="flex gap-2"><span className="font-mono text-emerald-400">limit</span><span className="text-slate-400">— Jumlah riwayat (Max: 100, Default: 50)</span></div>
                <div className="flex gap-2"><span className="font-mono text-emerald-400">status</span><span className="text-slate-400">— Filter status pesanan (e.g. <code className="text-emerald-300 bg-slate-900 px-1 rounded">Success</code>, <code className="text-amber-300 bg-slate-900 px-1 rounded">Processing</code>)</span></div>
              </div>

              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide pt-2">Contoh Respons (200 OK)</h3>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-sm text-emerald-300 font-mono">
{`{
  "success": true,
  "orders": [
    {
      "order_id": "KRYZ-123456",
      "service_name": "Mobile Legends 86 Diamonds",
      "target_user_id": "12345678",
      "target_zone_id": "1234",
      "price_myr": 10.00,
      "status": "Success",
      "created_at": "2026-07-23T12:00:00Z"
    }
  ]
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Error Codes */}
        <section className="space-y-6 pt-6">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <List className="w-6 h-6 text-rose-400" /> Kode Error (Error Codes)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { code: "UNAUTHORIZED", desc: "API key tidak valid atau tidak ditemukan." },
              { code: "RATE_LIMITED", desc: "Terlalu banyak permintaan (limit tercapai)." },
              { code: "BAD_REQUEST", desc: "Parameter tidak lengkap (mis. product_id kurang)." },
              { code: "INSUFFICIENT_BALANCE", desc: "Saldo Anda tidak mencukupi untuk order ini." },
              { code: "PRODUCT_NOT_FOUND", desc: "Produk tidak ditemukan atau sedang tidak aktif." },
              { code: "ORDER_NOT_FOUND", desc: "Order ID tidak ditemukan atau bukan milik Anda." },
              { code: "INTERNAL_ERROR", desc: "Kesalahan internal pada server Kryz-Net." },
            ].map((err, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1">
                <p className="font-mono text-rose-400 text-sm font-bold">{err.code}</p>
                <p className="text-slate-400 text-sm">{err.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
