import { useState, useMemo, useCallback, memo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import SeoHead from "@/components/SeoHead";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/providers/CurrencyProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Gamepad2,
  Zap,
  Star,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  MessageCircle,
  ArrowRight,
  Loader2,
  Shield,
  Tag,
  X,
  RefreshCw,
  Info,
  Clock,
  TrendingUp,
  Gift,
  Users,
  ThumbsUp,
  Copy,
  Eye,
  EyeOff,
  Sparkles,
  Crown,
  Flame,
  AlertTriangle,
  ShoppingCart,
  ArrowLeft,
  Wallet,
  QrCode,
  Phone
} from "lucide-react";
import { toast } from "sonner";


// ─── Types ──────────────────────────────────────────────────────────

interface Denomination {
  id: string;
  productId: string;
  name: string;
  price: number;
  price_myr?: number;
  price_idr?: number;
  isActive: boolean;
  popular?: boolean;
  discount?: number;
}

interface VoucherResult {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  discountAmount: number;
  maxDiscount: number;
  minOrder: number;
  validUntil?: string;
}

interface Product {
  id: string;
  name: string;
  category?: string;
  images?: string[];
  description?: string;
  rating?: number;
  totalOrders?: number;
  minOrder?: number;
  maxOrder?: number;
}

// ─── Utilities ──────────────────────────────────────────────────────

const getImageUrl = (url: string): string => {
  if (!url) return "";
  if (url.includes("api.kryz-net.space")) {
    return url.replace("https://api.kryz-net.space", "");
  }
  return url;
};

const formatNumber = (num: number): string => {
  return num.toLocaleString("id-ID");
};

// ─── Components ─────────────────────────────────────────────────────

const ProductSkeleton = memo(() => (
  <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in-50">
    {/* Header Skeleton */}
    <div className="flex items-start gap-4">
      <Skeleton className="h-24 w-24 rounded-xl shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
    
    {/* Content Skeleton */}
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
));

ProductSkeleton.displayName = "ProductSkeleton";

const ErrorState = memo(({ onRetry }: { onRetry: () => void }) => (
  <div className="container mx-auto px-4 py-16 text-center" role="alert">
    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-destructive/10 mb-6">
      <AlertCircle className="h-12 w-12 text-destructive/50" aria-hidden="true" />
    </div>
    <h2 className="text-xl font-semibold mb-2">Gagal memuat produk</h2>
    <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
      Terjadi kesalahan saat mengambil data produk. Silakan coba lagi dalam beberapa saat.
    </p>
    <Button onClick={onRetry} variant="outline" size="lg" className="hover:border-primary/50">
      <RefreshCw className="mr-2 h-4 w-4" />
      Coba Lagi
    </Button>
  </div>
));

ErrorState.displayName = "ErrorState";

const DenominationCard = memo(({
  item,
  isSelected,
  onSelect,
  isPopular,
}: {
  item: Denomination;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isPopular?: boolean;
}) => {
  const { formatPrice } = useCurrency();
  const displayPrice = formatPrice(item.price_myr, item.price_idr || item.price);
  const originalPrice = item.discount ? item.price * (1 + item.discount / 100) : null;
  const formattedOriginal = originalPrice ? formatPrice(
    item.price_myr ? item.price_myr * (1 + item.discount! / 100) : undefined,
    item.price_idr ? item.price_idr * (1 + item.discount! / 100) : originalPrice
  ) : null;

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={`relative p-4 rounded-xl border-2 text-left transition-all duration-300 group ${
        isSelected 
          ? "border-primary bg-primary/10 shadow-lg shadow-primary/10 scale-[1.02]" 
          : "border-white/5 glass-panel/80 shadow-2xl backdrop-blur-md hover:border-primary/30 hover:shadow-md hover:scale-[1.01]"
      }`}
      aria-pressed={isSelected}
      aria-label={`${item.name}, harga ${displayPrice}`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-2.5 right-2">
          <Badge className="text-[9px] font-bold px-2 py-0 bg-gradient-to-r from-[#FF6B00] to-[#FFB800] border-0 text-black">
            <Flame className="h-2.5 w-2.5 mr-1" />
            TERLARIS
          </Badge>
        </div>
      )}

      {/* Discount Badge */}
      {item.discount && (
        <div className="absolute -top-2.5 left-2">
          <Badge className="text-[9px] font-bold px-2 py-0 bg-green-500 border-0 text-white">
            -{item.discount}%
          </Badge>
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {item.name}
        </p>
        <Badge 
          variant="outline" 
          className="text-[10px] h-5 shrink-0 border-green-500/30 text-green-500 bg-green-500/10"
        >
          <Zap className="h-2 w-2 mr-1" />
          READY
        </Badge>
      </div>
      
      <div className="mt-2 space-y-1">
        <p className="text-base font-bold text-primary">
          {displayPrice}
        </p>
        {formattedOriginal && (
          <p className="text-xs text-muted-foreground line-through">
            {formattedOriginal}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
        <Clock className="h-2.5 w-2.5" aria-hidden="true" />
        <span>Proses instan</span>
      </div>
      
      {isSelected && (
        <div className="absolute top-2 right-2" aria-hidden="true">
          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
            <Check className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
        </div>
      )}
    </button>
  );
});

DenominationCard.displayName = "DenominationCard";

// ─── Custom Hook ────────────────────────────────────────────────────

function useProductDetail(id: string | undefined) {
  const productQuery = trpc.products.getById.useQuery(
    { id: id || "" }, 
    { 
      enabled: !!id,
      retry: 2,
      staleTime: 5 * 60 * 1000,
    }
  );

  const denominationsQuery = trpc.denominations.listByProduct.useQuery(
    { productId: id || "" }, 
    { 
      enabled: !!id,
      retry: 1,
    }
  );

  const refetch = useCallback(() => {
    productQuery.refetch();
    denominationsQuery.refetch();
  }, [productQuery, denominationsQuery]);

  return {
    product: productQuery.data as Product | undefined,
    denominations: (denominationsQuery.data?.data || []) as Denomination[],
    isLoading: productQuery.isLoading,
    isError: productQuery.isError || denominationsQuery.isError,
    isDenomLoading: denominationsQuery.isLoading,
    isProductLoading: productQuery.isLoading,
    refetch,
  };
}

// ─── Main Component ─────────────────────────────────────────────────

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { currency, formatPrice, exchangeRate } = useCurrency();
  const userIdInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    userId: "",
    zoneId: "",
    robloxPassword: "",
    recovery1: "",
    recovery2: "",
    recovery3: "",
  });
  const [selectedNominal, setSelectedNominal] = useState<string | null>(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherResult, setVoucherResult] = useState<VoucherResult | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [showUserId, setShowUserId] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'qris' | ''>('');
  const [guestPhone, setGuestPhone] = useState('');
  const [qrisData, setQrisData] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Nickname validation states
  const [isValidatingNickname, setIsValidatingNickname] = useState(false);
  const [validatedNickname, setValidatedNickname] = useState<string | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  const { product, denominations, isLoading, isError, isDenomLoading, refetch } = 
    useProductDetail(id);

  // Identify if it's Roblox via Login
  const isRobloxLogin = useMemo(() => {
    if (!product) return false;
    const cat = (product.category || "").toLowerCase();
    const name = (product.name || "").toLowerCase();
    return (cat.includes("roblox") || name.includes("roblox")) && 
           (cat.includes("login") || name.includes("login") || name.includes("via login"));
  }, [product]);

  // Mutations & Queries
  const utils = trpc.useUtils();

  const { data: balanceData } = trpc.rams.balance.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
  });
  
  const validateVoucherMutation = trpc.vouchers.validate.useMutation({
    onSuccess: (data) => {
      const result = data.data || data;
      setVoucherResult(result);
      toast.success("Voucher berhasil diterapkan!", {
        description: `Anda hemat ${formatPrice(result.discountAmount, result.discountAmount * exchangeRate)}`,
        icon: <Gift className="h-4 w-4" />,
      });
    },
    onError: (error) => {
      setVoucherResult(null);
      toast.error(error.message || "Voucher tidak valid");
    },
  });

  const createQrisOrderMutation = trpc.orders.createQrisOrder.useMutation({
    onSuccess: (data: any) => {
      toast.success("Berhasil! Mengalihkan ke invoice...");
      setSubmitError(null);
      setShowConfirm(false);
      const invoiceId = data?.orderId || data?.data?.orderId || data?.depositId || data?.data?.depositId || data?.invoice_number || data?.data?.invoice_number;
      if (invoiceId) {
        navigate(`/order/${invoiceId}`);
      }
    },
    onError: (error) => {
      setSubmitError(error.message || "Gagal membuat pesanan");
      toast.error(error.message || "Gagal membuat pesanan");
    },
  });

  const guestOrderMutation = trpc.orders.guestCreate.useMutation({
    onSuccess: (data: any) => {
      toast.success("Berhasil! Mengalihkan ke invoice...");
      setSubmitError(null);
      setShowConfirm(false);
      const invoiceId = data?.orderId || data?.data?.orderId || data?.depositId || data?.data?.depositId || data?.invoice_number || data?.data?.invoice_number;
      if (invoiceId) {
        navigate(`/order/${invoiceId}`);
      }
    },
    onError: (error) => {
      setSubmitError(error.message || "Gagal membuat pesanan");
      toast.error(error.message || "Gagal membuat pesanan");
    },
  });

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      toast.success("Pesanan berhasil dibuat!", {
        description: "Anda akan dialihkan ke halaman pembayaran",
      });
      setSubmitError(null);
      utils.orders.list.invalidate();
      const orderId = data.id || data.data?.id || (data as any).invoice_number || (data.data as any)?.invoice_number;
      if (orderId) {
        navigate(`/order/${orderId}`);
      }
    },
    onError: (error) => {
      setSubmitError(error.message || "Gagal membuat pesanan");
      toast.error(error.message || "Gagal membuat pesanan");
    },
  });

  // Computed values
  const selectedItem = useMemo(
    () => denominations.find((d) => d.id === selectedNominal),
    [denominations, selectedNominal]
  );

  const subtotalMyr = selectedItem?.price_myr ?? (selectedItem?.price ? selectedItem.price / 4111 : 0);
  const subtotalIdr = selectedItem?.price_idr ?? selectedItem?.price ?? 0;
  
  const discountMyr = voucherResult?.discountAmount || 0;
  const discountIdr = discountMyr * 4111;

  const totalMyr = Math.max(0, subtotalMyr - discountMyr);
  const totalIdr = Math.max(0, subtotalIdr - discountIdr);

  const total = currency === "MYR" ? totalMyr : totalIdr;
  const subtotal = currency === "MYR" ? subtotalMyr : subtotalIdr;
  const discount = currency === "MYR" ? discountMyr : discountIdr;

  const formattedSubtotal = formatPrice(subtotalMyr, subtotalIdr);
  const formattedDiscount = formatPrice(discountMyr, discountIdr);
  const formattedTotal = formatPrice(totalMyr, totalIdr);

  const balanceMyr = balanceData?.data?.balance_myr ?? (user as any)?.balanceMyr ?? 0;
  const balanceIdr = balanceData?.data?.balance_idr ?? (user as any)?.balanceIdr ?? 0;
  const balance = currency === "MYR" ? balanceMyr : balanceIdr;
  const balanceFormatted = formatPrice(balanceMyr, balanceIdr);
  const isBalanceSufficient = balance >= total;

  const isOrderValid = useMemo(() => {
    if (!selectedNominal) return false;
    
    if (isRobloxLogin) {
      if (!formData.userId || !formData.robloxPassword || !formData.recovery1 || !formData.recovery2 || !formData.recovery3) return false;
    } else {
      if (!formData.userId.trim()) return false;
      if (product?.requiresZoneId && !formData.zoneId) return false;
    }
    
    // Check payment method
    if (!paymentMethod) return false;

    if (!isAuthenticated && paymentMethod === 'qris' && guestPhone.length < 10) return false;
    
    if (String(product?.id || "").includes("mobile-legends") && !validatedNickname) return false;
    
    return true;
  }, [formData, selectedNominal, product, isRobloxLogin, isAuthenticated, paymentMethod, guestPhone, validatedNickname]);

  // Get popular denominations
  const popularDenoms = useMemo(
    () => denominations.filter(d => d.popular).slice(0, 2),
    [denominations]
  );

  // Auto-focus userId input
  useEffect(() => {
    if (!isLoading && userIdInputRef.current) {
      userIdInputRef.current.focus();
    }
  }, [isLoading]);

  // Nickname Validation Debounce
  const checkNickname = async (gameSlug: string, userId: string, zoneId: string) => {
    if (!userId || !zoneId) return;
    setIsValidatingNickname(true);
    setNicknameError(null);
    setValidatedNickname(null);
    try {
      const res = await utils.orders.validateNickname.fetch({ gameSlug, userId, zoneId });
      if ((res.success || (res as any).status) && res.data?.nickname) {
        setValidatedNickname(res.data.nickname);
      } else if (res.success && (res as any).nickname) {
        setValidatedNickname((res as any).nickname);
      } else {
        setNicknameError(res.message || "Nickname tidak ditemukan");
        setSelectedNominal(null); // Reset selected nominal if invalid
      }
    } catch (err: any) {
      setNicknameError(err.message || "Gagal mengecek nickname");
      setSelectedNominal(null); // Reset selected nominal if invalid
    } finally {
      setIsValidatingNickname(false);
    }
  };

  useEffect(() => {
    if (String(product?.id || "").includes("mobile-legends")) {
      if (formData.userId && formData.zoneId) {
        const timer = setTimeout(() => {
          checkNickname("mobile-legends", formData.userId, formData.zoneId);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        setValidatedNickname(null);
        setNicknameError(null);
      }
    }
  }, [formData.userId, formData.zoneId, product?.id]);

  const needsValidation = Boolean(String(product?.id || "").includes("mobile-legends"));
  const isValidated = !needsValidation || !!validatedNickname;

  // Reset voucher when nominal changes significantly
  useEffect(() => {
    if (voucherResult && selectedItem) {
      if (subtotalMyr < voucherResult.minOrder) {
        setVoucherResult(null);
        setVoucherCode("");
        toast.info("Voucher dihapus karena nominal tidak memenuhi syarat minimum");
      }
    }
  }, [selectedItem, subtotalMyr, voucherResult]);

  // Reset submit error on dialog close
  useEffect(() => {
    if (!showConfirm) {
      setSubmitError(null);
    }
  }, [showConfirm]);

  // Validation
  const validateForm = useCallback(() => {
    if (!product) return;

    const newErrors: Record<string, string> = {};
    if (!selectedNominal) {
      newErrors.nominal = "Pilih nominal top up terlebih dahulu";
    }

    if (isRobloxLogin) {
      if (!formData.userId) newErrors.userId = "Roblox Username wajib diisi";
      if (!formData.robloxPassword) newErrors.robloxPassword = "Roblox Password wajib diisi";
      if (!formData.recovery1) newErrors.recovery1 = "Recovery Code 1 wajib diisi";
      if (!formData.recovery2) newErrors.recovery2 = "Recovery Code 2 wajib diisi";
      if (!formData.recovery3) newErrors.recovery3 = "Recovery Code 3 wajib diisi";
    } else {
      if (!formData.userId.trim()) {
        newErrors.userId = "User ID wajib diisi";
      }
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = "Sila pilih cara pembayaran";
    }

    if (!isAuthenticated && paymentMethod === 'qris' && !guestPhone) {
      newErrors.guestPhone = "Nomor WhatsApp wajib diisi";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, selectedNominal, product, isAuthenticated, paymentMethod, guestPhone, isRobloxLogin]);

  // Handlers
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [errors]);

  const handleSelectNominal = useCallback((denomId: string) => {
    if (needsValidation && !isValidated) {
      toast.error("Silakan cek nickname Anda terlebih dahulu");
      return;
    }
    setSelectedNominal(prev => prev === denomId ? null : denomId);
  }, [needsValidation, isValidated]);

  const handleApplyVoucher = useCallback(() => {
    if (!voucherCode.trim()) {
      toast.error("Masukkan kode voucher terlebih dahulu");
      return;
    }
    if (!selectedItem) {
      toast.error("Pilih nominal terlebih dahulu");
      return;
    }
    validateVoucherMutation.mutate({ 
      code: voucherCode.trim(), 
      orderAmount: subtotalMyr 
    });
  }, [voucherCode, selectedItem, subtotalMyr, validateVoucherMutation]);

  const handleClearVoucher = useCallback(() => {
    setVoucherCode("");
    setVoucherResult(null);
    toast.info("Voucher dihapus");
  }, []);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      toast.success("Berhasil disalin!");
    } catch {
      toast.error("Gagal menyalin teks");
    }
  };

  const handleOrder = useCallback(() => {
    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      if (firstError) toast.error(firstError);
      return;
    }
    if (!selectedNominal) {
      toast.error("Pilih nominal terlebih dahulu");
      return;
    }
    setShowConfirm(true);
  }, [validateForm, selectedNominal, errors]);

  const handleConfirmOrder = useCallback(() => {
    if (!product || !selectedItem) return;

    let finalUserId = formData.userId;
    let finalZoneId = formData.zoneId;

    if (isRobloxLogin) {
      finalUserId = `${formData.userId}|${formData.robloxPassword}`;
      finalZoneId = `${formData.recovery1}|${formData.recovery2}|${formData.recovery3}`;
    }

    // Use QRIS if selected OR if not enough balance
    if (paymentMethod === 'qris' || !isBalanceSufficient) {
      const payload = {
        service_id: selectedItem.id,
        game_id: finalUserId,
        zone_id: finalZoneId,
        phone: guestPhone || "00000000000",
        ...(voucherResult ? { voucher_code: voucherResult.code } : {})
      };
      
      if (isAuthenticated) {
        createQrisOrderMutation.mutate(payload);
      } else {
        guestOrderMutation.mutate(payload);
      }
      return;
    }
    
    // Build notes
    const notes = [
      `User ID: ${formData.userId}`,
      formData.zoneId && `Zone ID: ${formData.zoneId}`,
      `DenominationId: ${selectedItem.id}`,
      `Item: ${selectedItem.name}`,
    ].filter(Boolean).join(", ");

    createOrderMutation.mutate({
      items: [{ 
        productId: product.id, 
        quantity: 1,
      }],
      notes,
      ...(voucherResult ? { voucher_code: voucherResult.code } : {})
    });
  }, [product, selectedItem, formData, isBalanceSufficient, createOrderMutation, createQrisOrderMutation, guestOrderMutation, isAuthenticated, paymentMethod, isRobloxLogin, voucherResult, guestPhone]);

  // Error state
  if (isError) {
    return <ErrorState onRetry={refetch} />;
  }

  // Loading state
  if (isLoading) {
    return <ProductSkeleton />;
  }

  // Not found state
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center animate-in fade-in-50">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 mb-6">
          <Gamepad2 className="h-12 w-12 text-muted-foreground/30" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Produk tidak ditemukan</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Produk yang Anda cari mungkin telah dihapus atau tidak tersedia
        </p>
        <Button size="lg" onClick={() => navigate("/products")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Lihat Semua Produk
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <SeoHead
        title={`Topup ${product.name} Murah & Instant`}
        description={`Beli item & topup ${product.name} automatik 24/7 dengan harga termurah di Topup Kryz-Net. Proses pantas, telus & selamat.`}
        image={product.images && product.images[0] ? product.images[0] : undefined}
      />
      <div className="container mx-auto px-4 py-8 max-w-[1400px]">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 ml-2">
          <ol className="flex items-center gap-2 text-sm text-white/50 font-medium">
            <li>
              <button onClick={() => navigate("/")} className="hover:text-primary transition-colors flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4" />
                Beranda
              </button>
            </li>
            <li aria-hidden="true" className="text-white/20">/</li>
            <li>
              <button onClick={() => navigate("/products")} className="hover:text-primary transition-colors">
                Produk
              </button>
            </li>
            <li aria-hidden="true" className="text-white/20">/</li>
            <li className="text-white truncate max-w-[200px]" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Product Header - Premium Glassmorphism */}
        <header className="mb-8 relative rounded-[32px] overflow-hidden p-8 sm:p-10" style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)" }}>
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-30"
            style={{ background: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 60%)", transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none opacity-20"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 60%)", transform: "translate(-30%, 30%)" }} />

          <div className="relative z-10 flex flex-col md:flex-row items-start gap-8">
            {/* Image Container */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0 rounded-[28px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] ring-1 ring-white/10 group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-orange-400/20 mix-blend-overlay z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {product.images?.[0] ? (
                <img
                  src={getImageUrl(String(product.images[0]))}
                  alt={String(product.name)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://placehold.co/200x200/1a1a1a/FF8C00?text=${encodeURIComponent(String(product.name).slice(0, 10))}`;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                  <Gamepad2 className="h-16 w-16 text-white/20" aria-hidden="true" />
                </div>
              )}
              {/* Popular indicator */}
              {(product as any).popular && (
                <div className="absolute top-3 left-3 z-20">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black text-black shadow-lg"
                    style={{ background: "linear-gradient(135deg, #FF6B00, #FFB800)" }}>
                    <Flame className="w-3 h-3" /> HOT
                  </span>
                </div>
              )}
            </div>
            
            {/* Info Container */}
            <div className="flex-1 py-2 w-full">
              <p className="text-xs font-bold text-primary tracking-widest uppercase mb-3 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" /> {String(product.category || "Game Top Up")}
              </p>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                {String(product.name)}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00c864]/10 border border-[#00c864]/20 text-[#00c864] text-xs font-bold tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00c864] animate-pulse" />
                  PROSES INSTAN
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold tracking-wide">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  4.99 RATING
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-bold tracking-wide">
                  <Users className="w-3.5 h-3.5" />
                  {formatNumber((product as any).totalOrders || 61234)} TERJUAL
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-bold tracking-wide">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  {denominations.length} PILIHAN
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="hidden lg:grid grid-cols-1 gap-3 shrink-0">
              {[
                { icon: Shield, label: "Aman", value: "100%", color: "#38BDF8" },
                { icon: Clock, label: "Instan", value: "< 1 menit", color: "#FFB800" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white/50 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-[15px] font-black mt-0.5" style={{ color: stat.color }}>{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Data Card */}
            <Card className="animate-in slide-in-from-left-4 fade-in duration-500 rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-orange-400 text-white text-sm font-black flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                      1
                    </div>
                    <CardTitle className="text-lg font-bold text-white tracking-wide">Data Player</CardTitle>
                  </div>
                  {formData.userId && (
                    <Badge variant="outline" className="text-[10px] border-[#00c864]/30 text-[#00c864] bg-[#00c864]/10">
                      <Check className="h-3 w-3 mr-1" />
                      Terisi
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 pt-6">
                {/* Info Toggle */}
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-amber-500 text-sm transition-all hover:bg-amber-500/10"
                  aria-expanded={showInfo}
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    <span className="font-semibold">Informasi Penting Sebelum Mengisi</span>
                  </div>
                  {showInfo ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
                </button>

                {showInfo && (
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-sm text-white/50 space-y-2 animate-in slide-in-from-top-2">
                    <div className="flex gap-2">
                      <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" aria-hidden="true" />
                      <div>
                        <p className="font-semibold text-white/80">Sebelum melanjutkan:</p>
                        <ul className="mt-2 space-y-1.5 list-disc list-inside text-xs">
                          <li>Pastikan <strong className="text-white/80">User ID</strong> dan <strong className="text-white/80">Zone/Server</strong> sudah benar</li>
                          <li>Kesalahan input data bukan tanggung jawab kami</li>
                          <li>Pastikan akun game tidak sedang dalam maintenance</li>
                          <li>Proses top up akan otomatis setelah pembayaran</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

              {isRobloxLogin ? (
                <div className="p-2 sm:p-4 flex flex-col gap-5">
                  <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex items-start gap-3 mb-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-500/90 leading-relaxed">
                      Pastikan <strong>Username</strong>, <strong>Password</strong>, dan <strong>3 Backup Codes</strong> sudah benar. Kegagalan login dapat menyebabkan proses top up gagal.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="relative group">
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1">
                        Roblox Username
                      </label>
                      <input
                        type="text"
                        value={formData.userId}
                        onChange={(e) => handleInputChange("userId", e.target.value)}
                        placeholder="Contoh: myrobloxuser123"
                        className={`w-full bg-[#0c101e]/80 border ${errors.userId ? 'border-red-500/50' : 'border-white/10 group-hover:border-white/20'} rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all backdrop-blur-xl`}
                      />
                      {errors.userId && <p className="text-red-400 text-xs mt-2 ml-1">{errors.userId}</p>}
                    </div>

                    <div className="relative group">
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1">
                        Roblox Password
                      </label>
                      <input
                        type="password"
                        value={formData.robloxPassword}
                        onChange={(e) => handleInputChange("robloxPassword", e.target.value)}
                        placeholder="Masukkan password akun"
                        className={`w-full bg-[#0c101e]/80 border ${errors.robloxPassword ? 'border-red-500/50' : 'border-white/10 group-hover:border-white/20'} rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all backdrop-blur-xl`}
                      />
                      {errors.robloxPassword && <p className="text-red-400 text-xs mt-2 ml-1">{errors.robloxPassword}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
                    {[1, 2, 3].map((num) => {
                      const field = `recovery${num}` as "recovery1" | "recovery2" | "recovery3";
                      return (
                        <div key={num} className="relative group">
                          <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1">
                            Backup Code {num}
                          </label>
                          <input
                            type="text"
                            value={formData[field]}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            placeholder="Contoh: 1234abcd"
                            className={`w-full bg-[#0c101e]/80 border ${errors[field] ? 'border-red-500/50' : 'border-white/10 group-hover:border-white/20'} rounded-2xl px-4 py-3.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all backdrop-blur-xl`}
                          />
                          {errors[field] && <p className="text-red-400 text-xs mt-2 ml-1">{errors[field]}</p>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-2 sm:p-4 flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative group">
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1">
                        {product.userIdLabel || "User ID"}
                      </label>
                      <div className="relative">
                        <input
                          ref={userIdInputRef}
                          type={showUserId ? "text" : "password"}
                          value={formData.userId}
                          onChange={(e) => handleInputChange("userId", e.target.value)}
                          placeholder={product.userIdPlaceholder || `Masukkan ${product.userIdLabel || "User ID"}`}
                          className={`w-full bg-[#0c101e]/80 border ${errors.userId ? 'border-red-500/50' : 'border-white/10 group-hover:border-white/20'} rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all pr-24 backdrop-blur-xl`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          {formData.userId && (
                            <button onClick={() => handleCopy(formData.userId, "userId")} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                              {copiedField === "userId" ? <Check className="h-4 w-4 text-[#00c864]" /> : <Copy className="h-4 w-4 text-white/40 hover:text-white/80" />}
                            </button>
                          )}
                          <button onClick={() => setShowUserId(!showUserId)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                            {showUserId ? <EyeOff className="h-4 w-4 text-white/40 hover:text-white/80" /> : <Eye className="h-4 w-4 text-white/40 hover:text-white/80" />}
                          </button>
                        </div>
                      </div>
                      {errors.userId && <p className="text-red-400 text-xs mt-2 ml-1">{errors.userId}</p>}
                    </div>

                    <div className="relative group">
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1">
                        {product.zoneIdLabel || "Zone ID / Server"} {(!product.requiresZoneId) && <span className="text-white/30 lowercase">(opsional)</span>}
                      </label>
                      <input
                        type="text"
                        value={formData.zoneId}
                        onChange={(e) => handleInputChange("zoneId", e.target.value)}
                        placeholder={product.zoneIdPlaceholder || `Masukkan ${product.zoneIdLabel || "Zone ID"}`}
                        className={`w-full bg-[#0c101e]/80 border ${errors.zoneId ? 'border-red-500/50' : 'border-white/10 group-hover:border-white/20'} rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all backdrop-blur-xl`}
                      />
                      {errors.zoneId && <p className="text-red-400 text-xs mt-2 ml-1">{errors.zoneId}</p>}
                    </div>
                  </div>
                  
                  {/* Nickname Validation Result */}
                  {needsValidation && (formData.userId || formData.zoneId) && (
                    <div className="mt-2">
                      {isValidatingNickname ? (
                        <div className="flex items-center gap-2 text-sm text-primary animate-pulse">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="font-bold">Mengecek nickname...</span>
                        </div>
                      ) : nicknameError ? (
                        <div className="flex items-center gap-3 text-sm text-red-400 bg-red-400/5 p-4 rounded-2xl border border-red-400/10">
                          <AlertCircle className="h-5 w-5" />
                          <span className="font-semibold">{nicknameError}</span>
                        </div>
                      ) : validatedNickname ? (
                        <div className="flex items-center gap-3 text-sm text-[#00c864] bg-[#00c864]/5 p-4 rounded-2xl border border-[#00c864]/10">
                          <Check className="h-5 w-5" />
                          <span className="font-semibold">Nickname: <strong className="text-white">{validatedNickname}</strong></span>
                        </div>
                      ) : (
                        <div className="text-xs font-semibold text-white/30 tracking-wide uppercase">
                          Masukkan User ID dan Zone ID untuk mengecek nickname
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              </CardContent>
            </Card>

            {/* Denominations Card */}
            <Card className="animate-in slide-in-from-left-4 fade-in duration-500 delay-100 rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-orange-400 text-white text-sm font-black flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                      2
                    </div>
                    <CardTitle className="text-lg font-bold text-white tracking-wide">Pilih Nominal</CardTitle>
                  </div>
                  {!isDenomLoading && (
                    <Badge variant="secondary" className="text-xs bg-white/5 border border-white/10 hover:bg-white/10 font-bold tracking-wider">
                      {denominations.length} TERSEDIA
                    </Badge>
                  )}
                </div>
                {selectedNominal && (
                  <p className="text-xs font-bold text-primary tracking-wider uppercase mt-3 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> 1 Nominal Dipilih
                  </p>
                )}
              </CardHeader>
              
              <CardContent className="relative pt-6">
                {isDenomLoading ? (
                  <div className="flex flex-col items-center justify-center py-12" role="status">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
                    <p className="text-sm font-bold text-white/50 tracking-wider uppercase mt-4">Memuat nominal...</p>
                    <span className="sr-only">Memuat daftar nominal...</span>
                  </div>
                ) : denominations.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Gamepad2 className="h-12 w-12 mx-auto mb-3 opacity-20" aria-hidden="true" />
                    <p className="text-sm font-bold text-white/50 tracking-wider uppercase">Belum ada nominal tersedia</p>
                    <p className="text-xs mt-2 text-white/30">Silakan cek kembali nanti</p>
                  </div>
                ) : (
                  <div className={needsValidation && !isValidated ? "pointer-events-none opacity-40 select-none transition-opacity duration-300" : "transition-opacity duration-300"}>
                    {/* Popular denominations highlighted */}
                    {popularDenoms.length > 0 && (
                      <div className="mb-6">
                        <p className="text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500 mb-3 tracking-widest uppercase flex items-center gap-1.5">
                          <Flame className="h-3.5 w-3.5 text-orange-400" />
                          PALING DIMINATI
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {popularDenoms.map((item) => (
                            <DenominationCard
                              key={item.id}
                              item={item}
                              isSelected={selectedNominal === item.id}
                              onSelect={handleSelectNominal}
                              isPopular={true}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* All denominations */}
                    <div 
                      className="grid grid-cols-2 md:grid-cols-3 gap-3" 
                      role="radiogroup" 
                      aria-label="Pilih nominal top up"
                    >
                      {denominations.map((item) => (
                        <DenominationCard
                          key={item.id}
                          item={item}
                          isSelected={selectedNominal === item.id}
                          onSelect={handleSelectNominal}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method Card */}
            <Card className="animate-in slide-in-from-left-4 fade-in duration-500 delay-150 rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-orange-400 text-white text-sm font-black flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                    3
                  </div>
                  <CardTitle className="text-lg font-bold text-white tracking-wide">Pilih Pembayaran</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => isAuthenticated ? setPaymentMethod('balance') : navigate('/login')}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-4 group ${
                      !isAuthenticated 
                        ? "border-white/5 bg-white/[0.01] opacity-70 cursor-not-allowed" 
                        : paymentMethod === 'balance'
                          ? "border-primary bg-primary/10 shadow-[0_15px_30px_-10px_rgba(249,115,22,0.2)] scale-[1.02]"
                          : "border-white/5 bg-white/[0.02] shadow-xl hover:border-primary/30 hover:scale-[1.01]"
                    }`}
                  >
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${!isAuthenticated ? 'bg-white/5 group-hover:bg-white/10' : 'bg-primary/20 group-hover:bg-primary/30'}`}>
                      <Wallet className={`h-6 w-6 ${!isAuthenticated ? 'text-white/40' : 'text-primary'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-bold text-[15px] ${paymentMethod === 'balance' ? 'text-primary' : 'text-white group-hover:text-primary transition-colors'}`}>Saldo Orion</p>
                        {!isAuthenticated && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-white/10 font-bold border-white/10">
                            LOGIN DULU
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs font-medium text-white/40 uppercase tracking-widest">Bayar instan</p>
                    </div>
                    {paymentMethod === 'balance' && isAuthenticated && (
                      <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                        <Check className="h-3.5 w-3.5 text-black font-bold" />
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => setPaymentMethod('qris')}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-4 group ${
                      paymentMethod === 'qris'
                        ? "border-primary bg-primary/10 shadow-[0_15px_30px_-10px_rgba(249,115,22,0.2)] scale-[1.02]"
                        : "border-white/5 bg-white/[0.02] shadow-xl hover:border-primary/30 hover:scale-[1.01]"
                    }`}
                  >
                    <div className="h-12 w-12 rounded-xl bg-[#00c864]/20 group-hover:bg-[#00c864]/30 transition-colors flex items-center justify-center shrink-0">
                      <QrCode className="h-6 w-6 text-[#00c864]" />
                    </div>
                    <div>
                      <p className={`font-bold text-[15px] mb-1 ${paymentMethod === 'qris' ? 'text-primary' : 'text-white group-hover:text-primary transition-colors'}`}>QRIS All Payment</p>
                      <p className="text-xs font-medium text-white/40 uppercase tracking-widest">OVO, DANA, GOPAY</p>
                    </div>
                    {paymentMethod === 'qris' && (
                      <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                        <Check className="h-3.5 w-3.5 text-black font-bold" />
                      </div>
                    )}
                  </button>
                </div>

                {paymentMethod === 'qris' && !isAuthenticated && (
                  <div className="mt-6 pt-6 border-t border-white/5 animate-in slide-in-from-top-2">
                    <Label htmlFor="guestPhone" className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1">
                      Nomor WhatsApp
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                      <Input
                        id="guestPhone"
                        placeholder="Contoh: 081234567890"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className={`w-full bg-[#0c101e]/80 border ${!guestPhone ? 'border-white/10 group-hover:border-white/20' : 'border-primary/50'} rounded-2xl pl-11 pr-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all backdrop-blur-xl h-14`}
                        maxLength={15}
                      />
                    </div>
                    <p className="text-[10px] font-semibold tracking-wider uppercase text-white/30 mt-2 ml-1">
                      * Struk pembelian akan dikirim ke nomor ini
                    </p>
                  </div>
                )}
                
                {paymentMethod === 'qris' && isAuthenticated && !guestPhone && setGuestPhone((user as any)?.phone_number || '080000000000')}
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Summary */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Rating Card */}
            <Card className="p-6 animate-in slide-in-from-right-4 fade-in duration-500 rounded-3xl" style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-white/50 uppercase tracking-widest">
                  Rating & Ulasan
                </p>
                <Badge variant="outline" className="text-[10px] font-bold tracking-wider bg-white/5 border-white/10">
                  <ThumbsUp className="h-3 w-3 mr-1.5 text-primary" />
                  99% PUAS
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500" style={{ fontFamily: "'Syne', sans-serif" }}>
                  4.99
                </span>
                <div>
                  <div className="flex gap-0.5 mb-1" aria-label="Rating 5 dari 5 bintang">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-500 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" aria-hidden="true" />
                    ))}
                  </div>
                  <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
                    DARI {formatNumber(61661)} ULASAN
                  </p>
                </div>
              </div>
            </Card>

            {/* Order Summary Card */}
            <Card className="p-6 animate-in slide-in-from-right-4 fade-in duration-500 delay-100 rounded-3xl overflow-hidden relative" style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)" }}>
              {/* Subtle top glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
              
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-orange-400 text-white text-sm font-black flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                  4
                </div>
                <CardTitle className="text-lg font-bold text-white tracking-wide">Ringkasan Pesanan</CardTitle>
              </div>
              
              <div className="space-y-4 text-sm font-medium">
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-white/50 text-xs font-bold uppercase tracking-widest shrink-0">Game</span>
                  <span className="text-right ml-4 text-white font-bold">{String(product.name)}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-white/50 text-xs font-bold uppercase tracking-widest shrink-0">Item</span>
                  <span className="text-right ml-4 font-bold">
                    {selectedItem ? (
                      <span className="text-primary">{selectedItem.name}</span>
                    ) : (
                      <span className="text-white/30 italic">Belum dipilih</span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-white/50 text-xs font-bold uppercase tracking-widest shrink-0">Target</span>
                  <span className="text-right ml-4 font-bold">
                    {formData.userId ? (
                      <span className="text-white font-mono bg-white/5 px-2 py-1 rounded-md">
                        {formData.userId}
                        {formData.zoneId && ` (${formData.zoneId})`}
                      </span>
                    ) : (
                      <span className="text-white/30 italic">Belum diisi</span>
                    )}
                  </span>
                </div>

                <div className="my-6 border-t border-white/5" />

                {/* Voucher Section */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] text-white/50 mb-3 flex items-center gap-1.5 font-bold uppercase tracking-widest">
                    <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                    KODE VOUCHER
                  </p>
                  
                  {voucherResult ? (
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#00c864]/10 border border-[#00c864]/20 animate-in zoom-in-95">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[15px] font-black text-[#00c864]">
                            {voucherResult.code}
                          </span>
                          <Badge className="text-[9px] bg-[#00c864] text-black font-bold tracking-wider border-0 px-1.5 py-0">
                            AKTIF
                          </Badge>
                        </div>
                        <p className="text-xs font-bold text-[#00c864]/70 uppercase tracking-widest">
                          Hemat {formattedDiscount}
                        </p>
                      </div>
                      <button
                        onClick={handleClearVoucher}
                        className="text-white/40 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                        aria-label="Hapus voucher"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          placeholder="Masukkan kode promo"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === "Enter" && handleApplyVoucher()}
                          className="text-sm font-bold uppercase pr-8 bg-[#0c101e]/80 border-white/10 rounded-xl h-11 focus:border-primary/50"
                          maxLength={20}
                          disabled={!selectedNominal}
                        />
                        {voucherCode && (
                          <button
                            onClick={() => setVoucherCode("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleApplyVoucher}
                        disabled={validateVoucherMutation.isPending || !voucherCode.trim() || !selectedNominal}
                        className="shrink-0 h-11 px-5 rounded-xl border-white/10 hover:border-primary/50 font-bold bg-white/5 hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        {validateVoucherMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          "Pakai"
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="my-6 border-t border-white/5" />

                {/* Pricing Details */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-white/70">
                    <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
                    <span className="font-bold">{selectedItem ? formattedSubtotal : "-"}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-[#00c864] animate-in slide-in-from-right-2">
                      <span className="text-xs font-bold uppercase tracking-widest">Diskon Voucher</span>
                      <span className="font-bold">-{formattedDiscount}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-end pt-4 mt-4 border-t border-white/5">
                    <span className="text-sm font-bold uppercase tracking-widest text-white/50 mb-1">Total Pembayaran</span>
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {selectedItem ? formattedTotal : "-"}
                    </span>
                  </div>
                </div>

                {/* Balance Info */}
                {isAuthenticated && (
                  <div className="flex justify-between items-center p-4 mt-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                    <span className="font-bold text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5" /> Saldo Anda
                    </span>
                    <span className={`font-black text-sm ${isBalanceSufficient ? "text-[#00c864]" : "text-red-500"}`}>
                      {balanceFormatted}
                    </span>
                  </div>
                )}
              </div>

              <Button
                className={`hidden lg:flex w-full mt-6 text-black font-black h-14 rounded-xl text-base tracking-wide transition-all duration-300 ${
                  isOrderValid 
                    ? "bg-gradient-to-r from-[#FF6B00] to-[#FFB800] hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] border-0" 
                    : "bg-white/10 text-white/30 border border-white/5 hover:bg-white/10"
                }`}
                disabled={!isOrderValid}
                onClick={handleOrder}
              >
                {isOrderValid ? (
                  <>
                    <Zap className="mr-2 h-5 w-5" aria-hidden="true" />
                    Lanjutkan Pembayaran
                  </>
                ) : (
                  <>
                    <AlertCircle className="mr-2 h-5 w-5" />
                    Lengkapi Data Terlebih Dahulu
                  </>
                )}
              </Button>
              
              {isOrderValid && !isBalanceSufficient && isAuthenticated && (
                <p className="text-[11px] font-bold uppercase tracking-widest text-red-500 text-center mt-3 flex items-center justify-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Saldo tidak mencukupi
                </p>
              )}
              
              <div className="flex items-center justify-center gap-2 mt-4 text-[10px] font-bold uppercase tracking-widest text-white/30">
                <Shield className="h-3 w-3" aria-hidden="true" />
                <span>Transaksi aman & terenkripsi</span>
              </div>
            </Card>

            {/* Help Card */}
            <Card className="p-6 animate-in slide-in-from-right-4 fade-in duration-500 delay-200 rounded-3xl relative overflow-hidden" style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)" }}>
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "20px 20px" }} />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-5">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#00c864]/20 to-[#00c864]/5 flex items-center justify-center border border-[#00c864]/20 shadow-[0_0_15px_rgba(0,200,100,0.2)]">
                    <MessageCircle className="h-6 w-6 text-[#00c864]" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base tracking-wide">Butuh Bantuan?</h3>
                    <p className="text-xs font-medium text-white/40 mt-0.5">CS kami siap membantu 24/7</p>
                  </div>
                </div>
                <a
                  href="https://wa.me/60137345871"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full text-sm font-bold bg-white/5 border-white/10 hover:bg-[#00c864]/10 hover:border-[#00c864]/30 hover:text-[#00c864] h-12 rounded-xl transition-all">
                    <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                    Chat WhatsApp CS
                  </Button>
                </a>
              </div>
            </Card>
          </aside>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0c101e]/90 backdrop-blur-xl border-t border-white/10 lg:hidden z-40 pb-safe shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-0.5">Total Pembayaran</p>
            <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500 truncate" style={{ fontFamily: "'Syne', sans-serif" }}>
              {selectedItem ? formattedTotal : "-"}
            </p>
          </div>
          <Button
            className={`shrink-0 h-12 px-6 rounded-xl font-black tracking-wide transition-all ${
              isOrderValid
                ? "bg-gradient-to-r from-[#FF6B00] to-[#FFB800] text-black shadow-[0_0_20px_rgba(249,115,22,0.4)] border-0"
                : "bg-white/10 text-white/30 border border-white/5"
            }`}
            disabled={!isOrderValid}
            onClick={handleOrder}
          >
            {isOrderValid ? (
              <>
                Beli Sekarang
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </>
            ) : (
              "Lengkapi Data"
            )}
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-md animate-in zoom-in-95 bg-[#0B0F19] border-white/10 p-0 overflow-hidden rounded-[2rem]">
          {/* Decorative Top Glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-3 text-xl font-black text-white">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                <Shield className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              Konfirmasi Pesanan
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-white/50 uppercase tracking-widest mt-2">
              Pastikan semua data sudah benar
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-6 space-y-0 text-sm mt-2">
            {[
              { 
                label: "Layanan", 
                value: product.name,
                icon: Gamepad2 
              },
              { 
                label: "Item", 
                value: selectedItem?.name,
                icon: Zap,
                highlight: true 
              },
              { 
                label: "Target ID", 
                value: `${formData.userId}${formData.zoneId ? ` (${formData.zoneId})` : ""}`,
                icon: Users,
                mono: true 
              },
              voucherResult && {
                label: "Voucher",
                value: `${voucherResult.code} (-${formattedDiscount})`,
                icon: Tag,
                className: "text-[#00c864]"
              },
              { 
                label: "Pembayaran", 
                value: paymentMethod === 'balance' ? "Saldo Orion" : "QRIS All Payment",
                icon: Wallet
              },
            ].filter(Boolean).map((item: any, idx, arr) => (
              <div
                key={item.label}
                className={`flex items-center justify-between py-3.5 ${
                  idx < arr.length - 1 ? "border-b border-white/5" : ""
                } ${item?.className || ""}`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon && <item.icon className="h-4 w-4 text-white/40" aria-hidden="true" />}
                  <span className="text-white/50 text-[11px] font-bold uppercase tracking-widest">{item.label}</span>
                </div>
                <span className={`font-bold text-right max-w-[60%] ${
                  item?.mono ? "font-mono text-xs bg-white/5 px-2 py-1 rounded-md text-white" : "text-white"
                } ${item?.highlight ? "!text-primary" : ""}`}>
                  {item.value}
                </span>
              </div>
            ))}
            
            <div className="flex items-center justify-between py-5 bg-white/[0.02] border-y border-white/5 -mx-6 px-6 mt-2">
              <span className="font-bold text-xs uppercase tracking-widest text-white/50">Total Bayar</span>
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500" style={{ fontFamily: "'Syne', sans-serif" }}>
                {formattedTotal}
              </span>
            </div>
          </div>

          <div className="px-6 pb-6 mt-4">
            {!isBalanceSufficient && isAuthenticated && paymentMethod === "balance" && (
              <div 
                className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-sm animate-in slide-in-from-bottom-2 mb-4"
                role="alert"
              >
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-amber-500" aria-hidden="true" />
                  <div>
                    <p className="font-bold text-amber-500">Saldo tidak mencukupi</p>
                    <p className="text-xs mt-1 font-medium text-white/50">
                      Saldo Anda: <span className="font-bold text-white">{balanceFormatted}</span>
                      {" "}• Kekurangan: <span className="font-bold text-amber-500">{formatPrice(Math.max(0, totalMyr - balanceMyr), Math.max(0, totalIdr - balanceIdr))}</span>
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full h-11 rounded-xl text-sm bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-[1.02] text-black font-black border-0 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all"
                  onClick={() => { setShowConfirm(false); navigate("/deposit"); }}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Top Up Saldo Sekarang
                </Button>
              </div>
            )}

            {submitError && (
              <div 
                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start gap-3 animate-in slide-in-from-bottom-2 mb-4"
                role="alert"
              >
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-bold">Gagal memproses pesanan</p>
                  <p className="text-xs mt-1 font-medium text-red-400">{submitError}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl font-bold bg-white/5 border-white/10 hover:bg-white/10 transition-all text-white"
                onClick={() => setShowConfirm(false)}
                disabled={createOrderMutation.isPending}
              >
                Batal
              </Button>
              <Button
                className="flex-[2] h-12 rounded-xl font-black bg-gradient-to-r from-primary to-orange-400 text-black border-0 hover:scale-[1.02] shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all"
                onClick={handleConfirmOrder}
                disabled={createOrderMutation.isPending || guestOrderMutation.isPending || !paymentMethod || (paymentMethod === "balance" && !isBalanceSufficient)}
              >
                {createOrderMutation.isPending || guestOrderMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" aria-hidden="true" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" aria-hidden="true" />
                    Konfirmasi & Bayar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
