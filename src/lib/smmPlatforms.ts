const SMM_PLATFORMS: { name: string; match: RegExp }[] = [
  { name: "TikTok", match: /tiktok|tik\s*tok/i },
  { name: "Instagram", match: /instagram\b|instagram\s/i },
  { name: "Facebook", match: /facebook|fb\s/i },
  { name: "YouTube", match: /youtube|yt\s/i },
  { name: "Twitch", match: /twitch/i },
  { name: "Telegram", match: /telegram/i },
  { name: "Twitter / X", match: /twitter\b|^x\s/i },
  { name: "Threads", match: /threads/i },
  { name: "Likee", match: /likee/i },
  { name: "Shopee", match: /shopee/i },
];

export function getSmmPlatform(productName: string): string {
  for (const p of SMM_PLATFORMS) {
    if (p.match.test(productName)) return p.name;
  }
  // Fallback: first word or first two words if they look like a brand
  const words = productName.trim().split(/\s+/);
  if (words.length >= 2 && /^[A-Z]/.test(words[0]) && /^[A-Z]/.test(words[1])) {
    return `${words[0]} ${words[1]}`;
  }
  return words[0] || "Other";
}

export interface SmmPlatformGroup {
  platform: string;
  products: any[];
  totalServices: number;
}

export interface GroupedProducts {
  smmPlatforms: SmmPlatformGroup[];
  others: any[];
}

export function groupSmmProducts(products: any[]): GroupedProducts {
  const smmProducts = products.filter((p: any) => p.category === "smm");
  const others = products.filter((p: any) => p.category !== "smm");

  const platformMap = new Map<string, any[]>();
  for (const p of smmProducts) {
    const platform = getSmmPlatform(p.name);
    if (!platformMap.has(platform)) platformMap.set(platform, []);
    platformMap.get(platform)!.push(p);
  }

  const smmPlatforms: SmmPlatformGroup[] = [];
  for (const [platform, prods] of platformMap) {
    smmPlatforms.push({
      platform,
      products: prods,
      totalServices: prods.reduce((sum: number, p: any) => sum + (p.denominationsCount || p.total_services || 0), 0),
    });
  }
  smmPlatforms.sort((a, b) => a.platform.localeCompare(b.platform));

  return { smmPlatforms, others };
}