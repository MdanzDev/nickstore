import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, User, Mail, Phone, Gamepad2, Server } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const OrderForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { game, product } = location.state || {};

  const [formData, setFormData] = useState({
    userGameId: '',
    userGameServer: '',
    userNickname: '',
    userEmail: '',
    userPhone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if no game/product selected
  React.useEffect(() => {
    if (!game || !product) {
      navigate('/games');
    }
  }, [game, product, navigate]);

  if (!game || !product) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.userGameId.trim()) {
      newErrors.userGameId = 'Game ID is required';
    }
    
    if (formData.userEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)) {
      newErrors.userEmail = 'Invalid email address';
    }
    
    if (formData.userPhone && !/^\+?[\d\s-]{10,}$/.test(formData.userPhone)) {
      newErrors.userPhone = 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      navigate('/payment', {
        state: {
          game,
          product,
          userDetails: formData,
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <main className="pt-8 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {/* Progress */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white text-sm font-medium">
                1
              </div>
              <span className="text-violet-400 font-medium">Details</span>
            </div>
            <div className="flex-1 h-0.5 bg-slate-800" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 text-sm font-medium">
                2
              </div>
              <span className="text-slate-500">Payment</span>
            </div>
            <div className="flex-1 h-0.5 bg-slate-800" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 text-sm font-medium">
                3
              </div>
              <span className="text-slate-500">Complete</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Enter Your Game Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="userGameId" className="text-slate-300">
                          <Gamepad2 className="w-4 h-4 inline mr-2" />
                          Game ID *
                        </Label>
                        <Input
                          id="userGameId"
                          value={formData.userGameId}
                          onChange={(e) => setFormData({ ...formData, userGameId: e.target.value })}
                          placeholder="Enter your game ID"
                          className={`bg-slate-800 border-slate-700 text-white ${
                            errors.userGameId ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.userGameId && (
                          <p className="text-red-400 text-sm">{errors.userGameId}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="userGameServer" className="text-slate-300">
                          <Server className="w-4 h-4 inline mr-2" />
                          Server (Optional)
                        </Label>
                        <Input
                          id="userGameServer"
                          value={formData.userGameServer}
                          onChange={(e) => setFormData({ ...formData, userGameServer: e.target.value })}
                          placeholder="e.g., Server 1"
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="userNickname" className="text-slate-300">
                        <User className="w-4 h-4 inline mr-2" />
                        In-Game Nickname (Optional)
                      </Label>
                      <Input
                        id="userNickname"
                        value={formData.userNickname}
                        onChange={(e) => setFormData({ ...formData, userNickname: e.target.value })}
                        placeholder="Your in-game name"
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="userEmail" className="text-slate-300">
                          <Mail className="w-4 h-4 inline mr-2" />
                          Email (Optional)
                        </Label>
                        <Input
                          id="userEmail"
                          type="email"
                          value={formData.userEmail}
                          onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                          placeholder="your@email.com"
                          className={`bg-slate-800 border-slate-700 text-white ${
                            errors.userEmail ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.userEmail && (
                          <p className="text-red-400 text-sm">{errors.userEmail}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="userPhone" className="text-slate-300">
                          <Phone className="w-4 h-4 inline mr-2" />
                          Phone (Optional)
                        </Label>
                        <Input
                          id="userPhone"
                          type="tel"
                          value={formData.userPhone}
                          onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })}
                          placeholder="+60 12-345 6789"
                          className={`bg-slate-800 border-slate-700 text-white ${
                            errors.userPhone ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.userPhone && (
                          <p className="text-red-400 text-sm">{errors.userPhone}</p>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-violet-500 hover:bg-violet-600 text-white py-6"
                    >
                      Continue to Payment
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="bg-slate-900/50 border-slate-800 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    {game.image_url ? (
                      <img
                        src={game.image_url}
                        alt={game.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center">
                        <span className="text-xl font-bold text-slate-600">{game.name.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-white font-medium">{game.name}</p>
                      <p className="text-sm text-slate-400">{product.name}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Denomination</span>
                      <span className="text-white">{product.denomination}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Quantity</span>
                      <span className="text-white">1</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Total</span>
                      <span className="text-2xl font-bold text-violet-400">
                        RM {product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderForm;
