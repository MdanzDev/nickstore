import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import AdminLayout from "./AdminLayout";
import {
  Loader2, Plus, Pencil, Trash2, X, Upload, Search, RefreshCw, Gamepad2, Package, Check, Layers
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const getImageUrl = (url: string): string => {
  if (!url) return "";
  if (url.includes("api.kryz-net.space")) {
    return url.replace("https://api.kryz-net.space", "");
  }
  return url;
};

const renderGameIcon = (iconUrl?: string) => {
  if (!iconUrl) return <Gamepad2 className="h-6 w-6 text-white/20" />;
  const trimmed = iconUrl.trim();
  if (trimmed.length <= 4 && !trimmed.startsWith("http") && !trimmed.startsWith("/")) {
    return <span className="text-2xl select-none">{trimmed}</span>;
  }
  return (
    <img
      src={getImageUrl(trimmed)}
      alt="Game Icon"
      className="w-full h-full object-cover"
      onError={(e) => {
        (e.target as HTMLElement).style.display = "none";
      }}
    />
  );
};

export default function AdminProducts() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"products" | "games">("products");

  // Products Tab State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Games Tab State
  const [gameSearch, setGameSearch] = useState("");
  const [selectedGameSlug, setSelectedGameSlug] = useState<string | null>(null);
  const gameFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // Denominations Modal State
  const [selectedGameForDenoms, setSelectedGameForDenoms] = useState<any | null>(null);
  const [editingDenomId, setEditingDenomId] = useState<string | null>(null);
  const [editPriceMyr, setEditPriceMyr] = useState("");
  const [newDenomName, setNewDenomName] = useState("");
  const [newDenomPrice, setNewDenomPrice] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Queries
  const { data: productsData, isLoading: isLoadingProducts, refetch: refetchProducts } = trpc.products.list.useQuery({
    page,
    limit: 20,
    search: debouncedSearch || undefined
  });

  const { data: gamesData, isLoading: isLoadingGames, refetch: refetchGames } = trpc.products.list.useQuery({
    limit: 100,
    search: gameSearch || undefined,
  });

  // Denominations Query for selected game
  const { data: denomsData, isLoading: isLoadingDenoms, refetch: refetchDenoms } = trpc.denominations.listByProduct.useQuery(
    { productId: selectedGameForDenoms?.slug || selectedGameForDenoms?.id || "" },
    { enabled: !!selectedGameForDenoms }
  );

  // Mutations for Denominations
  const updateDenomMutation = trpc.denominations.update.useMutation({
    onSuccess: () => {
      toast.success("Harga denominasi dikemas kini!");
      setEditingDenomId(null);
      refetchDenoms();
    },
    onError: (err) => toast.error(err.message || "Gagal mengemas kini harga"),
  });

  const createDenomMutation = trpc.denominations.create.useMutation({
    onSuccess: () => {
      toast.success("Denominasi baru berjaya ditambah!");
      setNewDenomName("");
      setNewDenomPrice("");
      refetchDenoms();
    },
    onError: (err) => toast.error(err.message || "Gagal menambah denominasi"),
  });

  const deleteDenomMutation = trpc.denominations.delete.useMutation({
    onSuccess: () => {
      toast.success("Denominasi dihapus!");
      refetchDenoms();
    },
    onError: (err) => toast.error(err.message || "Gagal menghapus denominasi"),
  });

  const compressImage = (f: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const max_size = 512;

          if (width > height) {
            if (width > max_size) {
              height = Math.round(height * (max_size / width));
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width = Math.round(width * (max_size / height));
              height = max_size;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], f.name.replace(/\.[^/.]+$/, "") + ".webp", { type: "image/webp" }));
              } else {
                reject(new Error("Compression failed"));
              }
            },
            "image/webp",
            0.85
          );
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const uploadGameImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file || !selectedGameSlug) return;
    if (file.size > 200 * 1024 || file.type !== "image/webp") {
      try { file = await compressImage(file); } catch { /* use original */ }
    }
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
          if (xhr.status >= 200 && xhr.status < 300) { toast.success("Gambar game berjaya diupload ke Supabase CDN!"); refetchGames(); resolve(); }
          else { try { reject(new Error(JSON.parse(xhr.responseText).error || "Upload failed")); } catch { reject(new Error(`Upload failed (${xhr.status})`)); } }
        };
        xhr.onerror = () => { setUploadProgress(prev => { const n = { ...prev }; delete n[slug]; return n; }); reject(new Error("Network error")); };
        xhr.send(form);
      });
    } catch (error: any) {
      toast.error(`Gagal upload: ${error.message}`);
    } finally {
      if (gameFileInputRef.current) gameFileInputRef.current.value = "";
    }
  };

  const handleSavePrice = (denomId: string) => {
    if (!editPriceMyr || isNaN(Number(editPriceMyr))) {
      toast.error("Sila masukkan harga yang sah.");
      return;
    }
    updateDenomMutation.mutate({
      id: denomId,
      price: Number(editPriceMyr)
    });
  };

  const handleAddDenom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDenomName || !newDenomPrice || isNaN(Number(newDenomPrice))) {
      toast.error("Lengkapkan nama dan harga denominasi.");
      return;
    }
    createDenomMutation.mutate({
      productId: selectedGameForDenoms?.slug || selectedGameForDenoms?.id || "",
      name: newDenomName,
      price: Number(newDenomPrice)
    });
  };

  const products = productsData?.data || [];
  const games = gamesData?.data || [];
  const denoms = denomsData?.data || [];

  return (
    <AdminLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        
        {/* HEADER & HUB TAB SWITCHER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Katalog Produk & Game</h1>
            <p className="text-sm text-white/50 mt-1">Pengurusan senarai game, ikon CDN Supabase & penetapan denominasi harga</p>
          </div>

          {/* TAB BUTTONS */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#14192B] border border-white/10 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "products"
                  ? "bg-[#34D399] text-black shadow-md shadow-emerald-500/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Package className="h-4 w-4" /> Produk & Denominasi
            </button>
            <button
              onClick={() => setActiveTab("games")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "games"
                  ? "bg-pink-500 text-white shadow-md shadow-pink-500/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Gamepad2 className="h-4 w-4" /> Senarai Game & Banners
            </button>
          </div>
        </div>

        {/* TAB 1: PRODUK & DENOMINASI */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama produk / game..."
                  className="w-full h-10 pl-10 pr-10 rounded-xl bg-[#14192B] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#34D399]"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <button
                onClick={() => refetchProducts()}
                disabled={isLoadingProducts}
                className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#14192B] border border-white/10 text-sm text-white/70 hover:text-white hover:border-white/20 transition-all"
              >
                <RefreshCw className={`h-4 w-4 text-white/40 ${isLoadingProducts ? 'animate-spin' : ''}`} />
                Muat Semula
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((p: any) => (
                <div key={p.id} className="p-4 rounded-2xl bg-[#14192B] border border-white/5 space-y-3 flex flex-col justify-between hover:border-white/10 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                      {renderGameIcon(p.icon || (p.images && p.images[0]))}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-white truncate">{p.name}</h3>
                      <p className="text-xs text-white/40 capitalize">{p.category || "Game Topup"}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#34D399]">
                      {p.denominationsCount || 0} Item Denominasi
                    </span>
                    <button
                      onClick={() => setSelectedGameForDenoms(p)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#34D399] font-bold text-xs hover:bg-emerald-500/20 transition-all"
                    >
                      Urus Denominasi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: SENARAI GAME & BANNERS */}
        {activeTab === "games" && (
          <div className="space-y-6">
            <input
              type="file"
              ref={gameFileInputRef}
              onChange={uploadGameImage}
              accept="image/*"
              className="hidden"
            />

            <div className="flex items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  value={gameSearch}
                  onChange={(e) => setGameSearch(e.target.value)}
                  placeholder="Cari nama game..."
                  className="w-full h-10 pl-10 pr-10 rounded-xl bg-[#14192B] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500"
                />
              </div>
              <button
                onClick={() => refetchGames()}
                disabled={isLoadingGames}
                className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#14192B] border border-white/10 text-sm text-white/70 hover:text-white"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingGames ? 'animate-spin' : ''}`} />
                Muat Semula
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {games.map((g: any) => {
                const slug = g.slug || g.id;
                const prog = uploadProgress[slug];
                const icon = g.icon || (g.images && g.images[0]);
                return (
                  <div key={g.id || g.slug} className="p-4 rounded-2xl bg-[#14192B] border border-white/5 flex flex-col items-center text-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 relative">
                      {renderGameIcon(icon)}
                    </div>
                    <div className="w-full truncate">
                      <h3 className="font-bold text-xs text-white truncate">{g.name}</h3>
                      <p className="text-[10px] text-white/30 truncate">{slug}</p>
                    </div>
                    <div className="flex items-center gap-2 w-full">
                      <button
                        onClick={() => setSelectedGameForDenoms(g)}
                        className="flex-1 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#34D399] text-xs font-bold hover:bg-emerald-500/20 transition-all"
                      >
                        Denominasi
                      </button>
                      <button
                        onClick={() => { setSelectedGameSlug(slug); gameFileInputRef.current?.click(); }}
                        disabled={prog !== undefined}
                        className="p-1.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500/20 transition-all"
                        title="Upload Ikon CDN"
                      >
                        <Upload className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DENOMINATIONS MANAGEMENT MODAL */}
        <Dialog open={!!selectedGameForDenoms} onOpenChange={() => setSelectedGameForDenoms(null)}>
          <DialogContent className="bg-[#14192B] border border-white/10 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white font-bold text-lg">
                <Layers className="h-5 w-5 text-[#34D399]" /> Urus Denominasi & Harga — {selectedGameForDenoms?.name}
              </DialogTitle>
            </DialogHeader>

            {selectedGameForDenoms && (
              <div className="space-y-6 pt-2">
                
                {/* Form to Add New Denomination */}
                <form onSubmit={handleAddDenom} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                  <p className="text-xs font-bold text-white flex items-center gap-1">
                    <Plus className="h-3.5 w-3.5 text-[#34D399]" /> Tambah Item / Denominasi Baru
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Nama Item (contoh: 100 Diamonds)"
                      value={newDenomName}
                      onChange={(e) => setNewDenomName(e.target.value)}
                      className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#34D399]"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Harga (MYR)"
                        value={newDenomPrice}
                        onChange={(e) => setNewDenomPrice(e.target.value)}
                        className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-[#34D399] w-full"
                      />
                      <button
                        type="submit"
                        disabled={createDenomMutation.isPending}
                        className="px-4 h-10 rounded-xl bg-[#34D399] text-black font-bold text-xs shrink-0 hover:bg-emerald-400 transition-all"
                      >
                        {createDenomMutation.isPending ? "Menambah..." : "Tambah"}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Denominations List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                    Senarai Item Denominasi Terdaftar ({denoms.length} Item)
                  </h4>
                  
                  {isLoadingDenoms ? (
                    <div className="py-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#34D399]" />
                    </div>
                  ) : denoms.length === 0 ? (
                    <div className="py-8 text-center text-white/40 text-xs">
                      Tiada item denominasi ditemui untuk game ini
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {denoms.map((d: any) => {
                        const priceMyr = Number(d.price_myr || d.price || 0);
                        const isEditing = editingDenomId === d.id;

                        return (
                          <div key={d.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 text-xs">
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-white truncate">{d.name}</p>
                              <p className="text-[10px] text-white/40 font-mono">ID: {d.id}</p>
                            </div>

                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editPriceMyr}
                                  onChange={(e) => setEditPriceMyr(e.target.value)}
                                  className="h-8 w-24 px-2 rounded-lg bg-black/40 border border-emerald-500 font-mono text-xs text-emerald-400"
                                />
                                <button
                                  onClick={() => handleSavePrice(d.id)}
                                  className="p-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingDenomId(null)}
                                  className="p-1.5 rounded-lg bg-white/10 text-white/70"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <span className="font-mono font-bold text-emerald-400 text-sm">
                                  RM {priceMyr.toFixed(2)}
                                </span>
                                <button
                                  onClick={() => { setEditingDenomId(d.id); setEditPriceMyr(String(priceMyr)); }}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sky-400"
                                  title="Edit Harga"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("Hapus item denominasi ini?")) {
                                      deleteDenomMutation.mutate({ id: d.id });
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                                  title="Hapus Denominasi"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </AdminLayout>
  );
}