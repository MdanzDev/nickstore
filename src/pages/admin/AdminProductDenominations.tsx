import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import AdminLayout from "./AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/providers/CurrencyProvider";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Loader2,
  Zap,
  GripVertical,
  PackageX,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";

interface Denomination {
  id: string;
  productId: string;
  name: string;
  price: number;
  price_myr?: number;
  price_idr?: number;
  isActive: boolean;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  category: string | null;
  images: string[];
}

const EMPTY_FORM = { name: "", price: "" };

export default function AdminProductDenominations() {
  const { currency, formatPrice } = useCurrency();
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  // tRPC queries
  const productQuery = trpc.products.getById.useQuery(
    { id: productId! },
    { enabled: !!productId }
  );

  const denomsQuery = trpc.denominations.listByProduct.useQuery(
    { productId: productId! },
    { enabled: !!productId }
  );

  // tRPC mutations
  const createMutation = trpc.denominations.create.useMutation({
    onSuccess: () => {
      denomsQuery.refetch();
      setForm(EMPTY_FORM);
      toast.success("Nominal berhasil ditambahkan!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menambah nominal");
    },
  });

  const updateMutation = trpc.denominations.update.useMutation({
    onSuccess: () => {
      denomsQuery.refetch();
      setEditingId(null);
      toast.success("Nominal diperbarui");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal memperbarui nominal");
    },
  });

  const deleteMutation = trpc.denominations.delete.useMutation({
    onSuccess: () => {
      denomsQuery.refetch();
      toast.success("Nominal dihapus");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menghapus nominal");
    },
  });

  const product = productQuery.data as Product | null;
  const denoms = (denomsQuery.data?.data || []) as Denomination[];
  const loading = productQuery.isLoading || denomsQuery.isLoading;

  const handleCreate = () => {
    if (!form.name.trim()) return toast.error("Nama harus diisi");
    if (!form.price || isNaN(Number(form.price))) return toast.error("Harga harus diisi");
    
    const inputPrice = Number(form.price);
    const priceIdr = currency === "MYR" ? Math.round(inputPrice * 4111) : inputPrice;

    createMutation.mutate({
      productId: productId!,
      name: form.name.trim(),
      price: priceIdr,
    });
  };

  const startEdit = (denom: Denomination) => {
    setEditingId(denom.id);
    const initialPrice = currency === "MYR"
      ? (denom.price_myr || (denom.price / 4111)).toFixed(2)
      : String(denom.price_idr || denom.price);
    setEditForm({ name: denom.name, price: initialPrice });
  };

  const handleSaveEdit = (id: string) => {
    if (!editForm.name.trim()) return toast.error("Nama harus diisi");
    if (!editForm.price || isNaN(Number(editForm.price))) return toast.error("Harga harus diisi");

    const inputPrice = Number(editForm.price);
    const priceIdr = currency === "MYR" ? Math.round(inputPrice * 4111) : inputPrice;

    updateMutation.mutate({
      id,
      name: editForm.name.trim(),
      price: priceIdr,
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Hapus nominal ini?")) return;
    deleteMutation.mutate({ id });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="text-center py-24">
          <PackageX className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-lg">Produk tidak ditemukan</p>
          <Button className="mt-4" onClick={() => navigate("/admin/products")}>
            Kembali ke Produk
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Kelola Nominal</h1>
            <p className="text-sm text-muted-foreground">
              {product.name} · {product.category || "Game"}
            </p>
          </div>
        </div>

        {/* Add Form */}
        <Card className="p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Tambah Nominal Baru
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-1">
              <Label className="text-xs text-muted-foreground">Nama Nominal</Label>
              <Input
                placeholder='Contoh: "86 Diamonds (80 + 6 Bonus)"'
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                disabled={createMutation.isLoading}
              />
            </div>
            <div className="w-full sm:w-44 space-y-1">
              <Label className="text-xs text-muted-foreground">Harga ({currency})</Label>
              <Input
                type="number"
                placeholder={currency === "MYR" ? "10.00" : "25000"}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                disabled={createMutation.isLoading}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleCreate} disabled={createMutation.isLoading}>
                {createMutation.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <><Plus className="mr-2 h-4 w-4" />Tambah</>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* List */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Daftar Nominal
            </h2>
            <Badge variant="outline">{denoms.length} item</Badge>
          </div>

          {denoms.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Belum ada nominal.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {denoms.map((denom) => (
                <div key={denom.id} className={`flex items-center gap-3 p-3 rounded-lg border ${editingId === denom.id ? "border-primary bg-primary/5" : "border-border"}`}>
                  <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />

                  {editingId === denom.id ? (
                    <>
                      <div className="flex-1 flex gap-2">
                        <Input className="flex-1 h-8 text-sm" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} autoFocus />
                        <Input className="w-36 h-8 text-sm" type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleSaveEdit(denom.id)} disabled={updateMutation.isLoading} className="p-1.5 rounded bg-primary/10 text-primary">
                          {updateMutation.isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 rounded hover:bg-secondary">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{denom.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(denom.createdAt).toLocaleDateString("id-ID")}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-bold text-primary">{formatPrice(denom.price_myr || denom.price / 4111, denom.price_idr || denom.price)}</p>
                        <div className="flex gap-1">
                          <button onClick={() => startEdit(denom)} className="p-1.5 rounded hover:bg-secondary"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handleDelete(denom.id)} disabled={deleteMutation.isLoading} className="p-1.5 rounded hover:bg-destructive/10">
                            {deleteMutation.isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 text-destructive" />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}