// components/shared/InstallPrompt.tsx
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <Download className="w-5 h-5 text-violet-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-medium">Install NickStore App</h4>
            <p className="text-slate-400 text-sm mt-1">
              Install our app for a better experience! Quick access, offline support, and more.
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                onClick={handleInstall}
                className="bg-violet-500 hover:bg-violet-600 text-white text-sm"
              >
                Install
              </Button>
              <Button
                onClick={() => setShowPrompt(false)}
                variant="ghost"
                className="text-slate-400 hover:text-white text-sm"
              >
                Not Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
