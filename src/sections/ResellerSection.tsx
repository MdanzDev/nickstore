import { Check, Star, Zap, Shield, MessageCircle, Crown, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const WHATSAPP_NUMBER = '60197661697';

const plans = [
  {
    id: 'grey',
    name: 'Grey Partner',
    price: 15,
    period: 'Lifetime',
    description: 'Perfect for beginners starting their reseller journey',
    icon: Gem,
    color: 'from-slate-500 to-slate-600',
    features: [
      'Access to Reseller Prices',
      'Dedicated Telegram Bot',
      'Manual Processing Support',
      'Basic Analytics Dashboard',
      'Email Support',
    ],
    notIncluded: [
      'Automated Ordering System',
      'API Integration',
      'Priority Support',
    ],
    popular: false,
  },
  {
    id: 'slate',
    name: 'Slate Pro',
    price: 35,
    period: 'Lifetime',
    description: 'Best value for serious resellers maximizing profits',
    icon: Crown,
    color: 'from-primary to-accent',
    features: [
      'Best Tier Pricing (Max Profit)',
      'Automated Ordering System',
      'API Integration Available',
      'Advanced Analytics Dashboard',
      'Priority 24/7 Support',
      'Custom Branding Options',
      'Early Access to New Games',
    ],
    notIncluded: [],
    popular: true,
  },
];

const stats = [
  { value: '500+', label: 'Active Resellers' },
  { value: '50K+', label: 'Orders Processed' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' },
];

export function ResellerSection() {
  const handleContact = (planName: string) => {
    const message = `Hi NickStore, I am interested in joining the *${planName} Program*. Please provide more details.`;
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  return (
    <section className="pt-20 lg:pt-24 pb-16 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge className="mb-4 px-4 py-1.5 bg-primary/20 text-primary border-primary/30">
            <Star className="w-3 h-3 mr-1" />
            Partner Program
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
            Become a <span className="text-primary">Reseller</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Join our network of successful resellers and start earning from every
            transaction today. Get access to exclusive pricing and tools.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <p className="text-2xl sm:text-3xl font-black text-primary mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            {
              icon: Zap,
              title: 'Instant Activation',
              desc: 'Get started within minutes of approval',
            },
            {
              icon: Shield,
              title: 'Secure Platform',
              desc: 'Enterprise-grade security for all transactions',
            },
            {
              icon: Star,
              title: 'Best Margins',
              desc: 'Industry-leading profit margins on all products',
            },
          ].map((benefit) => (
            <div
              key={benefit.title}
              className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold mb-1">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl overflow-hidden ${
                plan.popular ? 'ring-2 ring-primary' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-bl-xl">
                  MOST POPULAR
                </div>
              )}

              <div className={`bg-gradient-to-br ${plan.color} p-8`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <plan.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-white/70 text-sm">{plan.description}</p>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-white">
                    RM{plan.price}
                  </span>
                  <span className="text-white/70">/{plan.period}</span>
                </div>

                <Button
                  onClick={() => handleContact(plan.name)}
                  className={`w-full py-4 font-bold rounded-xl ${
                    plan.popular
                      ? 'bg-white text-primary hover:bg-white/90'
                      : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur'
                  }`}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Apply Now
                </Button>
              </div>

              <div className="bg-card p-6">
                <p className="font-bold text-sm mb-4">What&apos;s included:</p>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-500" />
                      </div>
                      {feature}
                    </li>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-muted-foreground"
                    >
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="w-2 h-0.5 bg-muted-foreground rounded-full" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Have Questions?</h2>
          <p className="text-muted-foreground mb-6">
            Contact us on WhatsApp for more information about the reseller program
          </p>
          <Button
            onClick={() => handleContact('Reseller')}
            variant="outline"
            className="rounded-xl"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Contact Support
          </Button>
        </div>
      </div>
    </section>
  );
}
