import React, { useEffect, useState } from 'react';
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
    <div className="min-h-screen bg-slate-950 overflow-x-hidden">
      <Navbar />

      <main>
        {/* Hero Section with animated gradient background */}
        <section className="relative overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/20 to-slate-950 animate-gradient-xy" />
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-violet-500/30 animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${2 + Math.random() * 4}px`,
                  height: `${2 + Math.random() * 4}px`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                }}
              />
            ))}
          </div>

          {/* Animated circles */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />

          <div className={`relative container mx-auto px-4 py-20 lg:py-32 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full mb-8 animate-bounce-in">
                <Sparkles className="w-4 h-4 text-violet-400 animate-spin-slow" />
                <span className="text-sm text-violet-300">Fast & Secure Game Top-ups</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight animate-slide-up">
                Top Up Your{' '}
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent animate-gradient-x">
                  Favorite Games
                </span>{' '}
                Instantly
              </h1>

              <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
                Get the best deals on game credits with instant delivery. Support for all major games with secure payment options.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-300">
                <Link to="/games">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white px-8 transition-all duration-300 hover:scale-105 group"
                  >
                    <Gamepad2 className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                    Browse Games
                  </Button>
                </Link>
                <Link to="/track-order">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-300 hover:scale-105 group"
                  >
                    Track Order
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>

              {/* Stats with animations */}
              <div className="grid grid-cols-3 gap-4 mt-16">
                {[
                  { value: '50K+', label: 'Happy Customers' },
                  { value: '100+', label: 'Games Available' },
                  { value: '5 mins', label: 'Avg Delivery' },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="text-center animate-fade-in-up"
                    style={{ animationDelay: `${(index + 4) * 100}ms` }}
                  >
                    <div className="text-2xl md:text-3xl font-bold text-white animate-pulse-slow">{stat.value}</div>
                    <div className="text-slate-500 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section with staggered animations */}
        <section className="py-20 border-t border-slate-800/50 bg-slate-900/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fade-in-up">
                Why Choose <span className="text-violet-400">NickStore</span>?
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
                We provide the best top-up experience with unmatched speed and reliability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center hover:border-violet-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl animate-fade-in-up"
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
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-white animate-fade-in-up">Popular Games</h2>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <section className="py-20 bg-slate-900/30">
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
                    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
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
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="relative bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl p-10 lg:p-16 overflow-hidden group">
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
                <Link to="/games">
                  <Button
                    size="lg"
                    className="bg-white text-violet-600 hover:bg-violet-50 transition-all duration-300 hover:scale-105 group"
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

      {/* Add these styles to your index.css or tailwind config */}
      <style>{`
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
        }
        .animate-gradient-xy {
          background-size: 200% 200%;
          animation: gradient-xy 10s ease infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
