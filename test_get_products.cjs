require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const KRYZ_NET_API_URL = "https://api.kryz-net.space";
const KRYZ_NET_API_KEY = "kryz_live_c20fabc004eed526bd2b924ee38ab3c861f3ff32";

async function fetchV1(endpoint, options = {}) {
  const url = `${KRYZ_NET_API_URL}${endpoint.startsWith('/api/v1') ? endpoint : `/api/v1${endpoint}`}`;
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${KRYZ_NET_API_KEY}`);
  headers.set("Content-Type", "application/json");

  const response = await fetch(url, { ...options, headers });
  return response.json();
}

async function externalGetProducts() {
  const result = await fetchV1("/public/games");
  const games = result.games || result.data || result || [];
  
  let products = games.map((g) => ({
    id: g.slug || g.id || g.name,
    slug: g.slug || g.id || g.name,
    name: g.name,
    category: g.category || "Games",
    images: [g.icon || g.image || ""],
    icon: g.icon || g.image || "",
    price: 0,
    stock: 9999,
    denominationsCount: g.total_services || (g.services ? g.services.length : 0),
    isActive: true
  }));
  return products;
}

externalGetProducts().then(d => console.log(JSON.stringify(d.slice(0,2), null, 2))).catch(console.error);
