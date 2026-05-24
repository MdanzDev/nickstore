import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Clock, Gamepad2, Sparkles, Trophy, Rocket } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { GameCard } from '@/components/public/GameCard';
import { useGames } from '@/hooks/useGames';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';

const Home: React.FC = () => {
  const { games, loading } = useGames();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => ({
        id: index,
        left: `${(index * 37) % 100}%`,
        top: `${(index * 53) % 100}%`,
        size: `${2 + (index % 4)}px`,
        delay: `${(index % 8) * 0.45}s`,
        duration: `${4 + (index % 5) * 0.55}s`,
      })),
    []
  );

  const testimonials = [
    { name: 'Ahmad R.', text: 'Fast delivery! Got my diamonds within minutes.', rating: 5 },
    { name: 'Siti N.', text: 'Best top up store in Malaysia. Highly recommended!', rating: 5 },
    { name: 'Kevin T.', text: 'Great customer service. Will buy again.', rating: 5 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Instant Delivery',
      description: 'Get your game credits delivered instantly after payment confirmation.',
      gradient: 'from-violet-500 to-fuchsia-500',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure Payment',
      description: 'Multiple secure payment options including TNG QR and bank transfer.',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: '24/7 Support',
      description: 'Our support team is always ready to help you with any issues.',
      gradient: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.18),transparent_32rem),linear-gradient(180deg,#020617_0%,#0f172a_58%,#020617_100%)]">
      <Navbar />

      <main>
        {/* Hero Section with animated gradient background */}
        <section className="relative overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/20 to-slate-950 animate-gradient-xy" />
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute rounded-full bg-violet-500/30 animate-float"
                style={{
                  left: particle.left,
                  top: particle.top,
                  width: particle.size,
                  height: particle.size,
                  animationDelay: particle.delay,
                  animationDuration: particle.duration,
                }}
              />
            ))}
          </div>

          {/* Animated circles */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />

          <div className={`container relative mx-auto px-4 py-16 sm:py-20 lg:py-28 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="max-w-3xl mx-auto text-center">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-2 shadow-[0_0_40px_rgba(139,92,246,0.12)] backdrop-blur animate-bounce-in">
                <Sparkles className="w-4 h-4 text-violet-400 animate-spin-slow" />
                <span className="text-sm text-violet-300">Fast & Secure Game Top-ups</span>
              </div>

              <h1 className="text-balance text-4xl font-bold leading-[1.05] text-white sm:text-5xl md:text-6xl animate-slide-up">
                Top Up Your{' '}
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent animate-gradient-x">
                  Favorite Games
                </span>{' '}
                Instantly
              </h1>

              <p className="mx-auto mb-9 mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg animate-fade-in-up animation-delay-200">
                Get the best deals on game credits with instant delivery. Support for all major games with secure payment options.
              </p>

              <div className="mx-auto flex max-w-sm flex-col justify-center gap-3 sm:max-w-none sm:flex-row sm:gap-4 animate-fade-in-up animation-delay-300">
                <Link to="/games" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="group h-12 w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 text-white shadow-lg shadow-violet-950/40 transition-all duration-300 hover:scale-[1.02] hover:from-violet-600 hover:to-fuchsia-600 sm:w-auto"
                  >
                    <Gamepad2 className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                    Browse Games
                  </Button>
                </Link>
                <Link to="/track-order" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="group h-12 w-full border-slate-700 bg-slate-950/45 text-slate-200 transition-all duration-300 hover:scale-[1.02] hover:bg-slate-800 hover:text-white sm:w-auto"
                  >
                    Track Order
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>

              {/* Stats with animations */}
              <div className="mt-12 grid grid-cols-3 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/45 shadow-2xl shadow-slate-950/40 backdrop-blur sm:mt-16">
                {[
                  { value: '50K+', label: 'Happy Customers' },
                  { value: '100+', label: 'Games Available' },
                  { value: '5 mins', label: 'Avg Delivery' },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="border-r border-slate-800/70 px-2 py-4 text-center last:border-r-0 sm:px-4 animate-fade-in-up"
                    style={{ animationDelay: `${(index + 4) * 100}ms` }}
                  >
                    <div className="text-xl font-bold text-white sm:text-2xl md:text-3xl animate-pulse-slow">{stat.value}</div>
                    <div className="mt-1 text-[11px] text-slate-500 sm:text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section with staggered animations */}
        <section className="border-y border-slate-800/50 bg-slate-900/35 py-16 sm:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fade-in-up">
                Why Choose <span className="text-violet-400">NickStore</span>?
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
                We provide the best top-up experience with unmatched speed and reliability.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group rounded-2xl border border-slate-700/80 bg-slate-800/50 p-6 text-center shadow-lg shadow-slate-950/20 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/50 hover:bg-slate-800/80 hover:shadow-xl animate-fade-in-up"
                  style={{ animationDelay: `${(index + 1) * 150}ms` }}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Games Section with scroll animation */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
              <div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl animate-fade-in-up">Popular Games</h2>
                <p className="text-slate-400 mt-2 animate-fade-in-up animation-delay-200">Choose from our selection of supported games</p>
              </div>
              <Link to="/games" className="hidden sm:flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-all duration-300 group animate-fade-in-up animation-delay-300">
                View All
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="relative">
                  <LoadingSpinner size="lg" className="text-violet-500" />
                  <div className="absolute inset-0 animate-ping rounded-full bg-violet-500/20" />
                </div>
              </div>
            ) : games.length === 0 ? (
              <EmptyState
                title="No games available"
                description="Check back later for new games!"
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                {games.slice(0, 8).map((game, index) => (
                  <div
                    key={game.$id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${(index % 4) * 100}ms` }}
                  >
                    <GameCard game={game} />
                  </div>
                ))}
              </div>
            )}

            {games.length > 8 && (
              <div className="text-center mt-10 sm:hidden animate-fade-in-up">
                <Link to="/games">
                  <Button variant="outline" className="border-slate-700 text-slate-300 transition-all duration-300 hover:scale-105 group">
                    View All Games
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Testimonials Section with carousel animation */}
        <section className="bg-slate-900/35 py-16 sm:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fade-in-up">
                What Our <span className="text-violet-400">Customers Say</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
                Join thousands of satisfied customers who trust NickStore.
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="relative overflow-hidden">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className={`transition-all duration-700 ease-in-out ${
                      currentTestimonial === index
                        ? 'opacity-100 translate-x-0'
                        : 'opacity-0 absolute inset-0 translate-x-full'
                    }`}
                  >
                    <div className="rounded-2xl border border-slate-700/80 bg-slate-800/55 p-6 text-center shadow-xl shadow-slate-950/20 sm:p-8">
                      <div className="flex justify-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Trophy
                            key={i}
                            className={`w-5 h-5 ${
                              i < testimonial.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-600'
                            } animate-pulse-slow`}
                            style={{ animationDelay: `${i * 100}ms` }}
                          />
                        ))}
                      </div>
                      <p className="text-white text-lg mb-4 italic">"{testimonial.text}"</p>
                      <p className="text-violet-400 font-semibold">{testimonial.name}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dots indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentTestimonial === index
                        ? 'w-6 bg-violet-500'
                        : 'bg-slate-600 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section with floating animation */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4">
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 shadow-2xl shadow-violet-950/35 sm:p-10 lg:p-16">
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse-slow" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-pulse-slow animation-delay-1000" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 animate-shimmer" />

              <div className="relative max-w-2xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6 animate-bounce-in">
                  <Rocket className="w-4 h-4 text-white" />
                  <span className="text-sm text-white">Limited Time Offer</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 animate-slide-up">
                  Ready to Top Up?
                </h2>
                <p className="text-violet-100 mb-8 animate-fade-in-up animation-delay-200">
                  Get instant game credits with our secure and fast payment system. Support available 24/7.
                </p>
                <Link to="/games" className="inline-flex w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="group w-full bg-white text-violet-600 transition-all duration-300 hover:scale-[1.02] hover:bg-violet-50 sm:w-auto"
                  >
                    Start Shopping
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
