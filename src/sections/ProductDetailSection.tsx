import { useState, useMemo } from 'react';
import { ArrowLeft, HelpCircle, Check, Star, ShoppingCart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Game, Product, CartItem } from '@/types';

interface ProductDetailSectionProps {
  game: Game;
  onBack: () => void;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onViewCart: () => void;
}

export function ProductDetailSection({
  game,
  onBack,
  onAddToCart,
  onViewCart,
}: ProductDetailSectionProps) {
  const [userId, setUserId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showSuccess, setShowSuccess] = useState(false);

  // Group products by type
  const productTypes = useMemo(() => {
    const types = new Set(game.products.map((p) => p.type));
    return ['all', ...Array.from(types)];
  }, [game.products]);

  const filteredProducts = useMemo(() => {
    if (activeTab === 'all') return game.products;
    return game.products.filter((p) => p.type === activeTab);
  }, [game.products, activeTab]);

  const bestSellers = useMemo(
    () => game.products.filter((p) => p.isBestSeller),
    [game.products]
  );

  const handleAddToCart = () => {
    if (!selectedProduct || !userId.trim()) return;

    onAddToCart({
      game: game.name,
      gameSlug: game.slug,
      denom: selectedProduct.label,
      price: selectedProduct.price,
      userId: userId.trim(),
      zoneId: zoneId.trim() || undefined,
      icon: game.logo,
      productId: selectedProduct.id,
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const isValid = userId.trim().length > 0 && selectedProduct !== null;

  return (
    <section className="pt-20 lg:pt-24 pb-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Store</span>
        </button>

        <div className="grid lg:grid-cols-[1fr,400px] gap-8">
          {/* Left Column - Game Info & Products */}
          <div className="space-y-6">
            {/* Game Header */}
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-card border border-border p-3 flex-shrink-0">
                <img
                  src={game.logo}
                  alt={game.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      game.name
                    )}&background=7c3aed&color=fff&size=200&length=2`;
                  }}
                />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-black mb-2">{game.name}</h1>
                <p className="text-muted-foreground text-sm lg:text-base max-w-xl">
                  {game.description}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="secondary" className="capitalize">
                    {game.category}
                  </Badge>
                  {game.isPopular && (
                    <Badge className="bg-orange-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Best Sellers */}
            {bestSellers.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  Best Sellers
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {bestSellers.slice(0, 3).map((product) => (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className={`denom-card best-seller text-left ${
                        selectedProduct?.id === product.id ? 'selected' : ''
                      }`}
                    >
                      <p className="font-bold text-sm mb-1 line-clamp-2">
                        {product.label}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="price-current">
                          RM {product.price.toFixed(2)}
                        </span>
                      </div>
                      {product.originalPrice && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="price-original">
                            RM {product.originalPrice.toFixed(2)}
                          </span>
                          <span className="discount-badge">
                            -{product.discount}%
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product Tabs */}
            <div className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-card border border-border p-1 flex-wrap h-auto gap-1">
                  {productTypes.map((type) => (
                    <TabsTrigger
                      key={type}
                      value={type}
                      className="capitalize px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {type === 'all' ? 'All Items' : type}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* Products Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`denom-card text-left ${
                      selectedProduct?.id === product.id ? 'selected' : ''
                    } ${product.isBestSeller ? 'best-seller' : ''}`}
                  >
                    <p className="font-bold text-sm mb-2 line-clamp-2">
                      {product.label}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="price-current">
                        RM {product.price.toFixed(2)}
                      </span>
                    </div>
                    {product.originalPrice && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="price-original">
                          RM {product.originalPrice.toFixed(2)}
                        </span>
                        <span className="discount-badge">-{product.discount}%</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Purchase Form */}
          <div className="space-y-4">
            {/* Step 1: User ID */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="step-number">1</div>
                <h3 className="font-bold text-lg">Enter User ID</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="ml-auto text-muted-foreground hover:text-foreground">
                        <HelpCircle className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        To find your User ID, click on your avatar in the game. Your user ID
                        is shown below your nickname.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">User ID</label>
                  <Input
                    type="text"
                    placeholder="e.g. 12345678"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="input-codashop"
                  />
                </div>
                {game.slug === 'mobile-legends' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Zone ID</label>
                    <Input
                      type="text"
                      placeholder="e.g. 1234"
                      value={zoneId}
                      onChange={(e) => setZoneId(e.target.value)}
                      className="input-codashop"
                    />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Please input the complete user ID here, e.g. 12345678(1234)
                </p>
              </div>
            </div>

            {/* Step 2: Select Recharge */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`step-number ${selectedProduct ? 'completed' : ''}`}>
                  {selectedProduct ? <Check className="w-4 h-4" /> : '2'}
                </div>
                <h3 className="font-bold text-lg">Select Recharge</h3>
              </div>

              {selectedProduct ? (
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
                  <p className="font-bold text-lg mb-1">{selectedProduct.label}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-primary">
                      RM {selectedProduct.price.toFixed(2)}
                    </span>
                    {selectedProduct.originalPrice && (
                      <>
                        <span className="text-muted-foreground line-through">
                          RM {selectedProduct.originalPrice.toFixed(2)}
                        </span>
                        <Badge className="bg-green-500 text-white">
                          -{selectedProduct.discount}%
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>Select a package from the left</p>
                </div>
              )}
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={!isValid}
              className="w-full py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showSuccess ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>

            {/* View Cart Button */}
            {showSuccess && (
              <Button
                onClick={onViewCart}
                variant="outline"
                className="w-full py-6 font-bold rounded-xl animate-slideUp"
              >
                View Cart
              </Button>
            )}

            {/* Payment Methods */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-sm font-medium mb-3">Payment Methods</p>
              <div className="flex flex-wrap gap-2">
                {['Touch N Go', 'DuitNow', 'FPX', 'Card'].map((method) => (
                  <Badge key={method} variant="secondary" className="px-3 py-1">
                    {method}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
