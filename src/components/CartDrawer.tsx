import { ShoppingCart, Trash2, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { CartItem } from '@/types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  onRemove: (id: number) => void;
  onCheckout: () => void;
  onClear: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  total,
  onRemove,
  onCheckout,
  onClear,
}: CartDrawerProps) {
  const isEmpty = items.length === 0;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md bg-background border-border flex flex-col">
        <SheetHeader className="space-y-2.5 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-xl font-black">
              <ShoppingCart className="w-5 h-5" />
              Shopping Cart
              {!isEmpty && (
                <Badge variant="default" className="ml-2">
                  {items.length}
                </Badge>
              )}
            </SheetTitle>
          </div>
        </SheetHeader>

        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-4">
              <ShoppingCart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Looks like you haven&apos;t added anything yet
            </p>
            <Button onClick={onClose} className="btn-primary">
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 pb-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card border border-border rounded-2xl p-4 group"
                  >
                    <div className="flex gap-4">
                      {/* Game Icon */}
                      <div className="w-16 h-16 rounded-xl bg-secondary flex-shrink-0 p-2">
                        <img
                          src={item.icon}
                          alt={item.game}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              item.game
                            )}&background=7c3aed&color=fff&size=100&length=2`;
                          }}
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">{item.game}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {item.denom}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          ID: {item.userId}
                          {item.zoneId && ` (${item.zoneId})`}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-black text-primary">
                            RM {item.price.toFixed(2)}
                          </span>
                          <button
                            onClick={() => onRemove(item.id)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="pt-4 space-y-4">
              <Separator />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-lg font-black">RM {total.toFixed(2)}</span>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Pricing includes processing & gateway fees
              </p>

              {/* Checkout Button */}
              <Button
                onClick={onCheckout}
                className="w-full py-6 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Order via WhatsApp
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              {/* Clear Cart */}
              <button
                onClick={onClear}
                className="w-full py-3 text-sm text-muted-foreground hover:text-destructive transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
