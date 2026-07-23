import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminLayout from "./AdminLayout";
import { useCurrency } from "@/providers/CurrencyProvider";
import {
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  Trash2,
  Pencil,
  Ban,
  UserCheck,
  DollarSign,
  AlertTriangle,
  Wallet,
  UserCog,
  RefreshCw,
  UserX,
  Clock,
  Mail,
  Phone,
  Hash,
  Plus,
  Minus,
  Edit2,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  accountBalance: number;
  balanceMyr?: number;
  balanceIdr?: number;
  roles: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

type TabType = "edit" | "balance" | "deactivate" | "delete";

export default function AdminUsers() {
  const { currency, formatPrice } = useCurrency();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("edit");

  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", role: "customer" });
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceType, setBalanceType] = useState<"add" | "subtract" | "set">("add");
  const [balanceNote, setBalanceNote] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, refetch } = trpc.users.list.useQuery({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
  });

  const utils = trpc.useUtils();

  const updateMutation = trpc.users.update.useMutation({
    onMutate: async ({ id, data: updateData }) => {
      await utils.users.list.cancel();
      const previousData = utils.users.list.getData({
        page,
        limit: 20,
        search: search || undefined,
      });
      if (previousData) {
        utils.users.list.setData(
          { page, limit: 20, search: search || undefined },
          {
            ...previousData,
            data: (previousData.data || []).map((user: any) =>
              user.id === id ? { ...user, ...updateData } : user
            ),
          }
        );
      }
      return { previousData };
    },
    onSuccess: () => {
      toast.success("User berhasil diperbarui!");
      setSelectedUser(null);
      refetch();
    },
    onError: (error: any, _variables, context) => {
      if (context?.previousData) {
        utils.users.list.setData(
          { page, limit: 20, search: search || undefined },
          context.previousData
        );
      }
      toast.error(error.message || "Gagal memperbarui user");
    },
  });

  const deleteMutation = trpc.users.delete.useMutation({
    onMutate: async ({ id }) => {
      await utils.users.list.cancel();
      const previousData = utils.users.list.getData({
        page,
        limit: 20,
        search: search || undefined,
      });
      if (previousData) {
        utils.users.list.setData(
          { page, limit: 20, search: search || undefined },
          {
            ...previousData,
            data: (previousData.data || []).filter((user: any) => user.id !== id),
          }
        );
      }
      return { previousData };
    },
    onSuccess: (data: any) => {
      toast.success(data?.message || "User berhasil dihapus!");
      setSelectedUser(null);
      refetch();
    },
    onError: (error: any, _variables, context) => {
      if (context?.previousData) {
        utils.users.list.setData(
          { page, limit: 20, search: search || undefined },
          context.previousData
        );
      }
      toast.error(error.message || "Gagal menghapus user");
    },
  });

  const adjustBalanceMutation = trpc.users.adjustBalance.useMutation({
    onSuccess: () => {
      toast.success("Saldo berhasil disesuaikan!");
      setSelectedUser(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Gagal menyesuaikan saldo");
    },
  });

  const blockMutation = trpc.users.block.useMutation({
    onSuccess: (data) => {
      toast.success(data?.message || "Status user berhasil diperbarui!");
      setSelectedUser(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Gagal memperbarui status");
    },
  });

  const users = (data?.data || []) as User[];
  const meta = data?.meta;
  const isMutating =
    updateMutation.isLoading ||
    deleteMutation.isLoading ||
    adjustBalanceMutation.isLoading ||
    blockMutation.isLoading;

  const openDialog = (user: User, tab: TabType = "edit") => {
    setSelectedUser(user);
    setActiveTab(tab);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.roles?.[0] || "customer",
    });
    setBalanceAmount("");
    setBalanceType("add");
    setBalanceNote("");
  };

  const handleUpdate = () => {
    if (!selectedUser) return;
    const updateData: Record<string, unknown> = {};

    if (editForm.role !== (selectedUser.roles?.[0] || "customer")) {
      updateData.role = editForm.role;
    }
    if (editForm.name !== (selectedUser.name || "")) {
      updateData.name = editForm.name;
    }
    if (editForm.email !== (selectedUser.email || "")) {
      updateData.email = editForm.email;
    }
    if (editForm.phone !== (selectedUser.phone || "")) {
      updateData.phone = editForm.phone;
    }

    if (Object.keys(updateData).length === 0) {
      toast.error("Tidak ada perubahan");
      return;
    }

    updateMutation.mutate({
      id: selectedUser.id,
      data: updateData,
    });
  };

  const handleBalanceUpdate = () => {
    if (!selectedUser) return;
    const amount = Number(balanceAmount);
    if (!balanceAmount || isNaN(amount) || amount <= 0) {
      toast.error("Masukkan jumlah yang valid");
      return;
    }

    let deltaMyr = 0;
    if (balanceType === "add") {
      deltaMyr = currency === "MYR" ? amount : amount / 4111;
    } else if (balanceType === "subtract") {
      deltaMyr = currency === "MYR" ? -amount : -amount / 4111;
    } else if (balanceType === "set") {
      const targetMyr = currency === "MYR" ? amount : amount / 4111;
      const currentMyr = selectedUser.balanceMyr || 0;
      deltaMyr = targetMyr - currentMyr;
    }

    adjustBalanceMutation.mutate({
      userId: selectedUser.id,
      amount: parseFloat(deltaMyr.toFixed(4)),
      reason: balanceNote || "Penyesuaian saldo admin",
    });
  };

  const handleToggleActive = (user: User) => {
    blockMutation.mutate({
      userId: user.id,
      isBlocked: user.isActive,
    });
  };

  const handleDeactivate = () => {
    if (!selectedUser) return;
    blockMutation.mutate({
      userId: selectedUser.id,
      isBlocked: true,
    });
  };

  const handlePermanentDelete = () => {
    if (!selectedUser) return;
    if (
      !confirm(
        `HAPUS PERMANEN "${selectedUser.name}"?\n\nSemua data user (pesanan, transaksi, deposit, pesan) akan dihapus. Tindakan ini TIDAK BISA dibatalkan!`
      )
    )
      return;
    deleteMutation.mutate({ id: selectedUser.id });
  };

  const renderRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return (
          <Badge className="bg-gradient-to-r from-rose-500 to-red-600 text-white border-none shadow-[0_0_10px_rgba(239,68,68,0.5)] font-semibold px-2 py-0.5 text-[10px] uppercase tracking-wider">
            Admin
          </Badge>
        );
      case "business":
        return (
          <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-none shadow-[0_0_10px_rgba(124,58,237,0.5)] font-semibold px-2 py-0.5 text-[10px] uppercase tracking-wider">
            Business Partner
          </Badge>
        );
      case "platinum":
        return (
          <Badge className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white border-none shadow-[0_0_10px_rgba(6,182,212,0.5)] font-semibold px-2 py-0.5 text-[10px] uppercase tracking-wider">
            Platinum Partner
          </Badge>
        );
      case "gold":
        return (
          <Badge className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 border-none shadow-[0_0_15px_rgba(251,191,36,0.6)] font-black px-2.5 py-1 text-[10px] uppercase tracking-wider">
            Gold Partner
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30 text-[10px] px-2 py-0.5 uppercase tracking-wider">
            Customer
          </Badge>
        );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <AdminLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-white">Users</h1>
            <p className="text-sm text-white/40 mt-1">Kelola semua pengguna platform</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
              {meta?.total || 0} total users
            </span>
            <button onClick={() => refetch()} disabled={isLoading}
              className="lg-btn-ghost flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold">
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
          <input
            className="lg-input w-full h-10 pl-10 pr-10 rounded-xl text-sm"
            placeholder="Cari nama, email, Telegram ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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

        {/* Table */}
        <motion.div variants={itemVariants}>
          <div className="lg-card rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#FF6B00]" />
              <p className="text-sm text-white/40 mt-3 font-bold">Memuat data users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-3 text-white/10" />
              <p className="text-sm text-white/40">Tidak ada user ditemukan</p>
              {search && (
                <button onClick={() => setSearch("")} className="mt-4 lg-btn-ghost px-4 py-2 rounded-xl text-xs font-bold">
                  Reset pencarian
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto relative z-10">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}>
                    {["User", "Email", "Role", "Saldo", "Status", "Aksi"].map(h => (
                      <th key={h} className={`p-3 text-[10px] font-black uppercase tracking-widest text-white/30 ${
                        h === "Email" ? "text-left hidden md:table-cell" :
                        h === "Role" ? "text-center hidden lg:table-cell" :
                        h === "Saldo" ? "text-right" :
                        h === "Status" ? "text-center hidden sm:table-cell" :
                        h === "Aksi" ? "text-center" : "text-left"
                      }`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {users.map((u, i) => (
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: Math.min(i * 0.05, 0.5) }}
                        key={u.id}
                        className={`lg-table-row transition-all duration-300 group ${
                          !u.isActive ? "opacity-50 grayscale" : ""
                        }`}
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                      >
                        <td className="p-4 relative">
                          {/* Highlight indicator */}
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                              u.isActive
                                ? "text-[#FF6B00]"
                                : "text-white/30"
                            }`}
                            style={{ background: u.isActive ? "rgba(255,107,0,0.1)" : "rgba(255,255,255,0.05)", border: `1px solid ${u.isActive ? "rgba(255,107,0,0.2)" : "rgba(255,255,255,0.1)"}` }}
                          >
                            {u.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium truncate block">{u.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {(u as any).telegramId ? `TG: ${(u as any).telegramId}` : (u.id?.slice(0, 12) + "...")}
                            </span>
                            {(u as any).totalOrders > 0 && (
                              <span className="text-[10px] text-primary/70">
                                {(u as any).totalOrders} pesanan
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-white/60 text-xs hidden md:table-cell font-bold">
                          <div className="flex items-center text-sm text-white/50 gap-1.5 mt-0.5">
                            <Mail className="h-3.5 w-3.5" />
                            {u.email ? (
                              <span className="truncate max-w-[180px]">{u.email}</span>
                            ) : (
                              <span className="text-white/30 italic text-xs">Tiada Emel</span>
                            )}
                          </div>
                      </td>
                      <td className="p-4 text-center hidden lg:table-cell">
                        {renderRoleBadge(u.roles?.[0] || "customer")}
                      </td>
                      <td className="p-4 text-right font-medium text-xs">
                        <span className={(u.balanceMyr || 0) > 0 ? "text-primary font-bold drop-shadow-[0_0_8px_rgba(255,102,0,0.5)] tracking-wide" : ""}>
                          {formatPrice(u.balanceMyr || 0, u.balanceIdr || 0)}
                        </span>
                      </td>
                      <td className="p-4 text-center hidden sm:table-cell">
                        {u.isActive ? (
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full"
                            style={{ background: "rgba(0,200,100,0.1)", color: "#00c864", border: "1px solid rgba(0,200,100,0.2)" }}>
                            Aktif
                          </span>
                        ) : (
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full"
                            style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          {/* Edit */}
                          <button
                            onClick={() => openDialog(u, "edit")}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-primary transition-all hover:scale-110 active:scale-95"
                            title="Edit user"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
  
                          {/* Balance */}
                          <button
                            onClick={() => openDialog(u, "balance")}
                            className="p-2 rounded-lg bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 transition-all hover:scale-110 active:scale-95"
                            title="Adjust saldo"
                          >
                            <DollarSign className="h-3.5 w-3.5" />
                          </button>
  
                          {/* Toggle Active/Inactive */}
                          <button
                            onClick={() => handleToggleActive(u)}
                            className={`p-2 rounded-lg bg-white/5 transition-all hover:scale-110 active:scale-95 ${
                              u.isActive ? "hover:bg-red-500/20 hover:text-red-400" : "hover:bg-emerald-500/20 hover:text-emerald-400"
                            }`}
                            title={u.isActive ? "Nonaktifkan user" : "Aktifkan user"}
                          >
                            {u.isActive ? (
                              <Ban className="h-3.5 w-3.5" />
                            ) : (
                              <UserCheck className="h-3.5 w-3.5" />
                            )}
                          </button>
  
                          {/* Delete permanently */}
                          <button
                            onClick={() => openDialog(u, "delete")}
                            className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-500 transition-all hover:scale-110 active:scale-95"
                            title="Hapus permanen"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta && meta.pages > 1 && (
            <div className="flex items-center justify-between p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-xs text-white/30 font-bold">
                Halaman {page} dari {meta.pages} · {meta.total} users
              </p>
              <div className="flex gap-2">
                <button
                  className="lg-btn-ghost px-3 py-1.5 rounded-xl text-xs font-bold disabled:opacity-30 flex items-center"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-3 w-3 mr-1" /> Prev
                </button>
                <button
                  className="lg-btn-ghost px-3 py-1.5 rounded-xl text-xs font-bold disabled:opacity-30 flex items-center"
                  onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                  disabled={page >= meta.pages}
                >
                  Next <ChevronRight className="h-3 w-3 ml-1" />
                </button>
              </div>
            </div>
          )}
          </div>
        </motion.div>
      </motion.div>

      {/* Dialog */}
      <Dialog
        open={!!selectedUser}
        onOpenChange={(open) => {
          if (!open && !isMutating) {
            setSelectedUser(null);
            refetch();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeTab === "edit" && <UserCog className="h-5 w-5 text-primary" />}
              {activeTab === "balance" && <Wallet className="h-5 w-5 text-amber-500" />}
              {activeTab === "deactivate" && <Ban className="h-5 w-5 text-orange-500" />}
              {activeTab === "delete" && <AlertTriangle className="h-5 w-5 text-destructive" />}
              {activeTab === "edit" && "Edit User"}
              {activeTab === "balance" && "Adjust Saldo"}
              {activeTab === "deactivate" && "Nonaktifkan User"}
              {activeTab === "delete" && "Hapus User Permanen"}
            </DialogTitle>
            {selectedUser && (
              <DialogDescription>
                {selectedUser.name} · {selectedUser.email}
              </DialogDescription>
            )}
          </DialogHeader>

          {selectedUser && (
            <>
              {/* Tabs */}
              <div className="flex border-b border-border mb-4 overflow-x-auto">
                {([
                  { key: "edit", label: "Edit", icon: UserCog },
                  { key: "balance", label: "Saldo", icon: Wallet },
                  { key: "deactivate", label: "Nonaktifkan", icon: Ban },
                  { key: "delete", label: "Hapus", icon: Trash2 },
                ] as { key: TabType; label: string; icon: any }[]).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.key
                        ? "border-primary text-primary font-medium"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="h-3 w-3" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* EDIT TAB */}
              {activeTab === "edit" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {selectedUser.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Hash className="h-3 w-3" /> ID
                      </p>
                      <p className="text-sm font-mono truncate">{selectedUser.id}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Nama (Read-only)</Label>
                    <Input
                      value={editForm.name}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email (Read-only)</Label>
                    <Input
                      type="email"
                      value={editForm.email}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone (Read-only)</Label>
                    <Input
                      value={editForm.phone || "-"}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select
                      value={editForm.role}
                      onValueChange={(v) => setEditForm({ ...editForm, role: v })}
                      disabled={isMutating}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="gold">Gold Partner</SelectItem>
                        <SelectItem value="platinum">Platinum Partner</SelectItem>
                        <SelectItem value="business">Business Partner</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded bg-secondary/50 text-center flex flex-col items-center justify-center">
                      <p className="text-muted-foreground mb-1">Role</p>
                      {renderRoleBadge(selectedUser.roles?.[0] || "customer")}
                    </div>
                    <div className="p-2 rounded bg-secondary/50 text-center flex flex-col items-center justify-center">
                      <p className="text-muted-foreground mb-1">Status</p>
                      <p className={`font-medium ${selectedUser.isActive ? "text-emerald-500" : "text-destructive"}`}>
                        {selectedUser.isActive ? "Aktif" : "Nonaktif"}
                      </p>
                    </div>
                    <div className="p-2 rounded bg-secondary/50 text-center flex flex-col items-center justify-center">
                      <p className="text-muted-foreground mb-1">Saldo</p>
                      <p className="font-medium text-primary">
                        {formatPrice(selectedUser.balanceMyr || 0, selectedUser.balanceIdr || 0)}
                      </p>
                    </div>
                  </div>

                  {selectedUser.lastLogin && (
                    <div className="p-2 rounded bg-secondary/50 text-xs text-center">
                      <Clock className="h-3 w-3 inline mr-1 text-muted-foreground" />
                      <span className="text-muted-foreground">Last login: </span>
                      <span className="font-medium">
                        {new Date(selectedUser.lastLogin).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedUser(null)}
                      disabled={isMutating}
                    >
                      Batal
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleUpdate}
                      disabled={isMutating}
                    >
                      {updateMutation.isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Simpan Perubahan"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* BALANCE TAB */}
              {activeTab === "balance" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-secondary/50 text-center">
                    <p className="text-xs text-muted-foreground">Saldo Saat Ini</p>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {formatPrice(selectedUser.balanceMyr || 0, selectedUser.balanceIdr || 0)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Tipe Penyesuaian</Label>
                    <Select
                      value={balanceType}
                      onValueChange={(v) => setBalanceType(v as "add" | "subtract" | "set")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="add"><div className="flex items-center gap-2"><Plus className="w-4 h-4" /> Tambah Saldo</div></SelectItem>
                        <SelectItem value="subtract"><div className="flex items-center gap-2"><Minus className="w-4 h-4" /> Kurangi Saldo</div></SelectItem>
                        <SelectItem value="set"><div className="flex items-center gap-2"><Edit2 className="w-4 h-4" /> Set Saldo (Replace)</div></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Jumlah ({currency})</Label>
                    <Input
                      type="number"
                      placeholder={currency === "MYR" ? "10.00" : "50000"}
                      value={balanceAmount}
                      onChange={(e) => setBalanceAmount(e.target.value)}
                      disabled={isMutating}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Catatan (Opsional)</Label>
                    <Input
                      placeholder="Contoh: Refund, Bonus, Penyesuaian"
                      value={balanceNote}
                      onChange={(e) => setBalanceNote(e.target.value)}
                      disabled={isMutating}
                    />
                  </div>

                  {balanceAmount && !isNaN(Number(balanceAmount)) && (
                    <div className="p-3 rounded-lg bg-secondary/50 text-center">
                      <p className="text-xs text-muted-foreground">Hasil Perubahan</p>
                      <p className={`text-sm font-bold mt-0.5 ${
                        balanceType === "add"
                          ? "text-emerald-500"
                          : balanceType === "subtract"
                          ? "text-destructive"
                          : "text-primary"
                      }`}>
                        {balanceType === "add" && (() => {
                          const amount = Number(balanceAmount) || 0;
                          const originalMyr = selectedUser.balanceMyr || 0;
                          const originalIdr = selectedUser.balanceIdr || 0;
                          const addedMyr = currency === "MYR" ? amount : amount / 4111;
                          const addedIdr = currency === "IDR" ? amount : amount * 4111;
                          return `${formatPrice(originalMyr, originalIdr)} → ${formatPrice(originalMyr + addedMyr, originalIdr + addedIdr)}`;
                        })()}
                        {balanceType === "subtract" && (() => {
                          const amount = Number(balanceAmount) || 0;
                          const originalMyr = selectedUser.balanceMyr || 0;
                          const originalIdr = selectedUser.balanceIdr || 0;
                          const subMyr = currency === "MYR" ? amount : amount / 4111;
                          const subIdr = currency === "IDR" ? amount : amount * 4111;
                          return `${formatPrice(originalMyr, originalIdr)} → ${formatPrice(Math.max(0, originalMyr - subMyr), Math.max(0, originalIdr - subIdr))}`;
                        })()}
                        {balanceType === "set" && (() => {
                          const amount = Number(balanceAmount) || 0;
                          const targetMyr = currency === "MYR" ? amount : amount / 4111;
                          const targetIdr = currency === "IDR" ? amount : amount * 4111;
                          return `${formatPrice(selectedUser.balanceMyr || 0, selectedUser.balanceIdr || 0)} → ${formatPrice(targetMyr, targetIdr)}`;
                        })()}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedUser(null)}
                      disabled={isMutating}
                    >
                      Batal
                    </Button>
                    <Button
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                      onClick={handleBalanceUpdate}
                      disabled={isMutating || !balanceAmount}
                    >
                      {adjustBalanceMutation.isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Simpan Saldo"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* DEACTIVATE TAB */}
              {activeTab === "deactivate" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-center">
                    <Ban className="h-12 w-12 mx-auto mb-2 text-orange-500" />
                    <p className="font-semibold text-orange-500">Nonaktifkan User?</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      User tidak akan bisa login, namun semua data tetap tersimpan.
                      Bisa diaktifkan kembali kapan saja.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-secondary/50 text-sm space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nama</span>
                      <span className="font-medium">{selectedUser.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium">{selectedUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Saldo</span>
                      <span className="font-medium text-primary">
                        {formatPrice(selectedUser.balanceMyr || 0, selectedUser.balanceIdr || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bergabung</span>
                      <span className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString("id-ID")}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedUser(null)}
                      disabled={isMutating}
                    >
                      Batal
                    </Button>
                    <Button
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={handleDeactivate}
                      disabled={isMutating}
                    >
                      {blockMutation.isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Ban className="h-4 w-4 mr-2" />
                      )}
                      Nonaktifkan User
                    </Button>
                  </div>
                </div>
              )}

              {/* DELETE TAB */}
              {activeTab === "delete" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-destructive" />
                    <p className="font-semibold text-destructive">Hapus User Permanen?</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Semua data yang terkait (pesanan, transaksi, deposit, pesan) akan dihapus selamanya.
                      <br />
                      <strong>Tindakan ini TIDAK DAPAT dibatalkan!</strong>
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10 text-sm space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nama</span>
                      <span className="font-medium">{selectedUser.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium">{selectedUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Saldo</span>
                      <span className="font-medium text-primary">
                        {formatPrice(selectedUser.balanceMyr || 0, selectedUser.balanceIdr || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Role</span>
                      <span className="font-medium">{selectedUser.roles?.includes("admin") ? "Admin" : "User"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bergabung</span>
                      <span className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString("id-ID")}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedUser(null)}
                      disabled={isMutating}
                    >
                      Batal
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={handlePermanentDelete}
                      disabled={isMutating}
                    >
                      {deleteMutation.isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Hapus Permanen
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}