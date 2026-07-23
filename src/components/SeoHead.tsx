import { useEffect } from "react";

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export default function SeoHead({
  title = "Topup Kryz-Net - Platform Top Up Game & Voucher Murah #1 Malaysia",
  description = "Topup game murah, pantas & automatik 24/7. Beli Diamonds Mobile Legends, Free Fire, Honor of Kings, Magic Chess, voucher & pulsa dengan harga termurah di Malaysia.",
  image = "https://yfkcuzvslnjrdwkdlkwe.supabase.co/storage/v1/object/public/game-images/mobile-legends-id-promo.webp",
  url = typeof window !== "undefined" ? window.location.href : "https://topup.kryz-net.space",
  type = "website"
}: SeoProps) {
  useEffect(() => {
    // 1. Update Title
    const fullTitle = title.includes("Kryz-Net") ? title : `${title} | Topup Kryz-Net`;
    document.title = fullTitle;

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 3. Update OG Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', fullTitle);

    // 4. Update OG Description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    // 5. Update OG Image
    if (image) {
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) ogImage.setAttribute('content', image);
    }

    // 6. Update Canonical
    if (url) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute('href', url);
    }
  }, [title, description, image, url, type]);

  return null;
}
