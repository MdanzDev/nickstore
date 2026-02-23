import { Diamond, MessageCircle } from 'lucide-react';

const footerLinks = {
  store: [
    { label: 'All Games', href: '#' },
    { label: 'Popular', href: '#' },
    { label: 'New Arrivals', href: '#' },
    { label: 'Vouchers', href: '#' },
  ],
  support: [
    { label: 'How to Buy', href: '#' },
    { label: 'FAQ', href: '#' },
    { label: 'Contact Us', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
  partner: [
    { label: 'Reseller Program', href: '#' },
    { label: 'API Documentation', href: '#' },
    { label: 'Become a Partner', href: '#' },
  ],
};

const WHATSAPP_NUMBER = '60197661697';

export function Footer() {
  const handleWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank');
  };

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <Diamond className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black">
                NICK<span className="text-primary">STORE</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              The fastest & easiest way to buy game credits. Licensed reseller
              with instant processing.
            </p>
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <MessageCircle className="w-4 h-4" />
              +60 19-766 1697
            </button>
          </div>

          {/* Store Links */}
          <div>
            <h4 className="font-bold mb-4">Store</h4>
            <ul className="space-y-2">
              {footerLinks.store.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Partner Links */}
          <div>
            <h4 className="font-bold mb-4">Partner</h4>
            <ul className="space-y-2">
              {footerLinks.partner.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} NickStore. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">
              Licensed Game Reseller
            </span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-5 bg-muted rounded flex items-center justify-center text-[8px] font-bold">
                VISA
              </div>
              <div className="w-8 h-5 bg-muted rounded flex items-center justify-center text-[8px] font-bold">
                MC
              </div>
              <div className="w-8 h-5 bg-muted rounded flex items-center justify-center text-[8px] font-bold">
                TNG
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
