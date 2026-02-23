import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const banners = [
  {
    id: 1,
    title: 'Power Up Your Gaming',
    subtitle: 'Fast, secure, and reliable game credits',
    description: 'Licensed reseller with instant processing for over 60+ games',
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=400&fit=crop',
  },
  {
    id: 2,
    title: 'Mobile Legends Diamonds',
    subtitle: 'Up to 2x Bonus Diamonds',
    description: 'Get extra diamonds on your first recharge. Limited time offer!',
    gradient: 'from-blue-600 via-cyan-600 to-teal-600',
    image: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=1200&h=400&fit=crop',
  },
  {
    id: 3,
    title: 'Genshin Impact Genesis',
    subtitle: 'Welkin Moon Available',
    description: 'Get 90 Primogems daily for 30 days. Best value for travelers!',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=400&fit=crop',
  },
];

const features = [
  { icon: Zap, label: 'Instant Delivery', desc: 'Credits in seconds' },
  { icon: Shield, label: '100% Secure', desc: 'Safe transactions' },
  { icon: Sparkles, label: 'Best Prices', desc: 'Competitive rates' },
];

interface HeroSectionProps {
  onSearchFocus: () => void;
}

export function HeroSection({ onSearchFocus }: HeroSectionProps) {
  const [currentBanner, setCurrentBanner] = useState(0);

  const nextBanner = useCallback(() => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  }, []);

  const prevBanner = useCallback(() => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextBanner, 5000);
    return () => clearInterval(timer);
  }, [nextBanner]);

  return (
    <section className="relative pt-20 lg:pt-24">
      {/* Main Banner */}
      <div className="relative mx-4 sm:mx-6 lg:mx-8 rounded-3xl overflow-hidden">
        <div className="relative h-[280px] sm:h-[320px] lg:h-[400px]">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-all duration-700 ${
                index === currentBanner
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-105'
              }`}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${banner.image})` }}
              />
              {/* Gradient Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} opacity-90`}
              />
              {/* Content */}
              <div className="relative h-full flex flex-col justify-center px-6 sm:px-10 lg:px-16">
                <div className="max-w-xl space-y-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    {banner.subtitle}
                  </span>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                    {banner.title}
                  </h1>
                  <p className="text-white/80 text-sm sm:text-base max-w-md">
                    {banner.description}
                  </p>
                  <Button
                    onClick={onSearchFocus}
                    className="mt-4 bg-white text-foreground hover:bg-white/90 font-bold px-6 py-3 rounded-xl w-fit"
                  >
                    Start Shopping
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevBanner}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 flex items-center justify-center text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextBanner}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 flex items-center justify-center text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentBanner
                  ? 'w-6 bg-white'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Features Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-3 gap-3 sm:gap-6">
          {features.map((feature) => (
            <div
              key={feature.label}
              className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-card border border-border/50"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-center sm:text-left">
                <p className="font-bold text-xs sm:text-sm">{feature.label}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
