import { useState, useRef } from "react";
import { trpc } from "@/providers/trpc";
import { Input } from "@/components/ui/input";
import AdminLayout from "./AdminLayout";
import { Loader2, Search, Upload, Image as ImageIcon, Gamepad2, X } from "lucide-react";
import { toast } from "sonner";

export default function AdminGames() {
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedGameSlug, setSelectedGameSlug] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const { data, isLoading, refetch } = trpc.products.list.useQuery({
    limit: 100,
    search: search || undefined,
  });

  const compressImage = (file: File): Promise<File> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          const max_size = 512;
          if (width > height) { if (width > max_size) { height = Math.round(height * (max_size / width)); width = max_size; } }
          else { if (height > max_size) { width = Math.round(width * (max_size / height)); height = max_size; } }
          canvas.width = width; canvas.height = height;
          canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: "image/webp", lastModified: Date.now() }));
            else reject(new Error("Compression failed"));
          }, "image/webp", 0.85);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file || !selectedGameSlug) return;
    if (file.size > 200 * 1024 || file.type !== "image/webp") {
      try { file = await compressImage(file); } catch { /* use original */ }
    }
    if (file.size > 4.5 * 1024 * 1024) { toast.error("File terlalu besar."); return; }
    const slug = selectedGameSlug;
    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const form = new FormData();
        form.append("image", file!);
        xhr.open("POST", `/api/games/${slug}/images`);
        xhr.withCredentials = true;
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) setUploadProgress(prev => ({ ...prev, [slug]: Math.round((event.loaded / event.total) * 100) }));
        };
        xhr.onload = () => {
          setUploadProgress(prev => { const n = { ...prev }; delete n[slug]; return n; });
          if (xhr.status >= 200 && xhr.status < 300) { toast.success("Gambar berhasil diupload!"); refetch(); resolve(); }
          else { try { reject(new Error(JSON.parse(xhr.responseText).error || "Upload failed")); } catch { reject(new Error(`Upload failed (${xhr.status})`)); } }
        };
        xhr.onerror = () => { setUploadProgress(prev => { const n = { ...prev }; delete n[slug]; return n; }); reject(new Error("Network error")); };
        xhr.send(form);
      });
    } catch (error: any) {
      toast.error(`Gagal upload: ${error.message}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerUpload = (slug: string) => { setSelectedGameSlug(slug); fileInputRef.current?.click(); };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">Manage Games</h1>
            <p className="text-sm text-white/40 mt-1">Upload custom icons ke Supabase CDN</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
          <input
            className="lg-input w-full h-10 pl-10 pr-10 rounded-xl text-sm"
            placeholder="Cari nama game atau slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF6B00]" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {data?.data.map((game: any) => {
              const progKey = game.slug || game.id;
              const prog = uploadProgress[progKey];
              return (
                <div key={game.slug} className="lg-card rounded-2xl p-4 flex flex-col items-center text-center gap-3">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 relative"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {prog !== undefined && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10 rounded-2xl">
                        <span className="text-xs font-black text-white">{prog}%</span>
                        <div className="w-10 h-1 bg-white/20 mt-1 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${prog}%`, background: "linear-gradient(90deg, #FF6B00, #FFB800)" }} />
                        </div>
                      </div>
                    )}
                    {game.images?.[0] || game.icon ? (
                      <img src={game.icon || game.images?.[0]} alt={game.name} className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/64?text=Game"; }} />
                    ) : (
                      <Gamepad2 className="h-7 w-7 text-white/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <h3 className="font-black text-sm text-white truncate">{game.name}</h3>
                    <p className="text-[10px] text-white/30 mt-0.5 font-bold truncate">{game.slug || game.id}</p>
                  </div>
                  <button
                    disabled={prog !== undefined}
                    onClick={() => triggerUpload(game.slug || game.id)}
                    className="w-full lg-btn-ghost py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {prog !== undefined ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    Upload
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/webp, image/gif" onChange={handleFileChange} />
    </AdminLayout>
  );
}
