import {
  Gamepad2,
  Phone,
  Share2,
  Swords,
  Crown,
  Ticket,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

export type ProductType =
  | "game"
  | "pulsa"
  | "smm"
  | "joki"
  | "vilog"
  | "voucher"
  | "apk";

export interface InputField {
  key: string;
  type: "text" | "tel" | "email" | "url" | "number" | "textarea" | "password";
  required: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface SchemaField {
  key: string;
  label?: string | { ms?: string; id?: string; en?: string };
  type?: "text" | "select" | "number" | "email" | "textarea" | "url" | "tel" | "password";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
}

export function getInputSchemaFromData(
  data?: { input_schema?: unknown } | null
): SchemaField[] | null {
  const schema = (data as { input_schema?: { fields?: unknown } } | null | undefined)?.input_schema;
  if (schema && Array.isArray(schema.fields)) {
    return schema.fields as SchemaField[];
  }
  return null;
}

export function getSchemaFieldLabel(field: SchemaField): string {
  const label = field.label;
  if (!label) return field.key;
  if (typeof label === "string") return label;
  return label.id || label.ms || label.en || field.key;
}

export interface ProductTypeConfig {
  key: ProductType;
  label: string;
  icon: LucideIcon;
  color: string;
  fields: InputField[];
  description: string;
  buildTarget: (values: Record<string, string | number>) => Record<string, string | number>;
  isManual: boolean;
}

export const PRODUCT_TYPES: Record<ProductType, ProductTypeConfig> = {
  game: {
    key: "game",
    label: "Topup Game",
    icon: Gamepad2,
    color: "#38BDF8",
    fields: [
      { key: "userId", type: "text", required: true, placeholder: "Masukkan User ID" },
      { key: "zoneId", type: "text", required: false, placeholder: "Masukkan Zone ID" },
    ],
    description: "Masukkan ID pemain dan zone/server untuk topup.",
    buildTarget: (v) => ({
      user_id: String(v.userId || "").trim(),
      zone_id: String(v.zoneId || "").trim(),
    }),
    isManual: false,
  },
  pulsa: {
    key: "pulsa",
    label: "Pulsa & Data",
    icon: Phone,
    color: "#FF6B00",
    fields: [
      { key: "phone", type: "tel", required: true, placeholder: "08xxxxxxxxxx" },
    ],
    description: "Masukkan nomor telepon penerima.",
    buildTarget: (v) => ({
      phone: String(v.phone || "").trim(),
    }),
    isManual: false,
  },
  smm: {
    key: "smm",
    label: "Sosial Media",
    icon: Share2,
    color: "#A78BFA",
    fields: [
      { key: "target", type: "url", required: true, placeholder: "https://... atau @username" },
      { key: "quantity", type: "number", required: true, min: 1 },
    ],
    description: "Masukkan tautan/username dan jumlah.",
    buildTarget: (v) => ({
      target: String(v.target || "").trim(),
      quantity: Math.max(1, Number(v.quantity) || 1),
    }),
    isManual: false,
  },
  joki: {
    key: "joki",
    label: "Joki",
    icon: Swords,
    color: "#00c864",
    fields: [
      { key: "email", type: "email", required: true, placeholder: "Email Moonton" },
      { key: "password", type: "password", required: true, placeholder: "Password Account" },
      { key: "heroRequest", type: "text", required: true, placeholder: "Minimal 3 hero (Hero1, Hero2, Hero3)" },
      { key: "currentRank", type: "text", required: true, placeholder: "Rank Saat Ini (Epic, Legend, Mythic)" },
      { key: "quantity", type: "number", required: true, min: 1, placeholder: "Jumlah Bintang" },
    ],
    description: "Masukkan email Moonton, password, permintaan hero, dan rank.",
    buildTarget: (v) => ({
      email: String(v.email || "").trim(),
      password: String(v.password || "").trim(),
      heroRequest: String(v.heroRequest || "").trim(),
      currentRank: String(v.currentRank || "").trim(),
      quantity: Math.max(1, Number(v.quantity) || 1),
    }),
    isManual: true,
  },
  vilog: {
    key: "vilog",
    label: "Akun Premium",
    icon: Crown,
    color: "#F472B6",
    fields: [
      { key: "email", type: "email", required: false, placeholder: "email@contoh.com" },
    ],
    description: "Masukkan email untuk pengiriman akun premium.",
    buildTarget: (v) => ({ email: String(v.email || "").trim() }),
    isManual: true,
  },
  voucher: {
    key: "voucher",
    label: "Voucher",
    icon: Ticket,
    color: "#FFB800",
    fields: [
      { key: "email", type: "email", required: false, placeholder: "email@contoh.com" },
    ],
    description: "Masukkan email untuk pengiriman kode voucher.",
    buildTarget: (v) => ({ email: String(v.email || "").trim() }),
    isManual: true,
  },
  apk: {
    key: "apk",
    label: "APK Premium",
    icon: Smartphone,
    color: "#34D399",
    fields: [],
    description: "Tidak perlu input. File unduhan akan disediakan setelah pembayaran.",
    buildTarget: () => ({}),
    isManual: true,
  },
};

export function getProductType(typeOrCategory?: string | null): ProductType {
  const t = (typeOrCategory || "game").toLowerCase();
  if (t in PRODUCT_TYPES) return t as ProductType;
  return "game";
}

export function getProductTypeConfig(typeOrCategory?: string | null): ProductTypeConfig {
  return PRODUCT_TYPES[getProductType(typeOrCategory)];
}

export function getProductTypeFromData(data?: {
  type?: string | null;
  category?: string | null;
}): ProductType {
  return getProductType(data?.type ?? data?.category);
}

export function getTypeLabel(typeOrCategory?: string | null): string {
  return getProductTypeConfig(typeOrCategory).label;
}

export function getTypeDescription(typeOrCategory?: string | null): string {
  return getProductTypeConfig(typeOrCategory).description;
}

export function getTypeColor(typeOrCategory?: string | null): string {
  return getProductTypeConfig(typeOrCategory).color;
}