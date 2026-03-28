import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Phone, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  const whatsappNumber = '60197661697';
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">NickStore</span>
            </Link>
            <p className="text-slate-400 text-sm max-w-sm">
              Your trusted source for instant game top-ups. We provide fast, secure, and reliable service for all your gaming needs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-slate-400 hover:text-violet-400 text-sm transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/games" className="text-slate-400 hover:text-violet-400 text-sm transition-colors">
                  Games
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="text-slate-400 hover:text-violet-400 text-sm transition-colors">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-400 hover:text-green-400 text-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2 text-slate-400 text-sm">
                <Phone className="w-4 h-4" />
                +60 19-7661 697
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} NickStore. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
