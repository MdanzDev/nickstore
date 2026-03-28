import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Clock, Gamepad2 } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { GameCard } from '@/components/public/GameCard';
import { useGames } from '@/hooks/useGames';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';

const Home: React.FC = () => {
  const { games, loading } = useGames();

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Instant Delivery',
      description: 'Get your game credits delivered instantly after payment confirmation.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure Payment',
      description: 'Multiple secure payment options including TNG QR and bank transfer.',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: '24/7 Support',
      description: 'Our support team is always ready to help you with any issues.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/10 to-slate-950" />
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-fuchsia-500/10 rounded-full blur-3xl" />

          <div className="relative container mx-auto px-4 py-20 lg:py-32">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full mb-8">
                <Zap className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-violet-300">Fast & Secure Game Top-ups</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Top Up Your{' '}
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Favorite Games
                </span>{' '}
                Instantly
              </h1>

              <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
                Get the best deals on game credits with instant delivery. Support for all major games with secure payment options.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/games">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white px-8"
                  >
                    <Gamepad2 className="w-5 h-5 mr-2" />
                    Browse Games
                  </Button>
                </Link>
                <Link to="/track-order">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    Track Order
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 border-t border-slate-800/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-violet-500/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Games Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-white">Popular Games</h2>
                <p className="text-slate-400 mt-2">Choose from our selection of supported games</p>
              </div>
              <Link to="/games" className="hidden sm:flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" className="text-violet-500" />
              </div>
            ) : games.length === 0 ? (
              <EmptyState
                title="No games available"
                description="Check back later for new games!"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {games.slice(0, 8).map((game) => (
                  <GameCard key={game.$id} game={game} />
                ))}
              </div>
            )}

            {games.length > 8 && (
              <div className="text-center mt-10 sm:hidden">
                <Link to="/games">
                  <Button variant="outline" className="border-slate-700 text-slate-300">
                    View All Games
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="relative bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl p-10 lg:p-16 overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

              <div className="relative max-w-2xl mx-auto text-center">
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                  Ready to Top Up?
                </h2>
                <p className="text-violet-100 mb-8">
                  Get instant game credits with our secure and fast payment system. Support available 24/7.
                </p>
                <Link to="/games">
                  <Button
                    size="lg"
                    className="bg-white text-violet-600 hover:bg-violet-50"
                  >
                    Start Shopping
                    <ArrowRight className="w-5 h-5 ml-2" />
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
