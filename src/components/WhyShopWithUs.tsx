import React from 'react';
import { Award, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';

export const WhyShopWithUs: React.FC = () => {
  const perks = [
    {
      id: 'perk-quality',
      icon: Award,
      title: 'Artisanal Purity',
      description: 'Certified 100% pure Mulberry and Katan silks with hallmarked antique gold zari weaves.',
    },
    {
      id: 'perk-styles',
      icon: Sparkles,
      title: 'Curated Silhouettes',
      description: 'Contemporary royal cuts tailored for bridal grandeur, festive celebrations, and modern galas.',
    },
    {
      id: 'perk-payments',
      icon: ShieldCheck,
      title: 'Cash on Delivery',
      description: 'Zero-risk shopping. Inspect your garments and pay conveniently upon doorstep arrival.',
    },
    {
      id: 'perk-returns',
      icon: RotateCcw,
      title: '7-Day Easy Returns',
      description: 'Hassle-free doorstep return pickups arranged digitally through your Fashinery account.',
    },
  ];

  return (
    <section id="why-shop-with-us" className="py-14 sm:py-18 bg-white border-y border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6">
          {perks.map((perk) => {
            const Icon = perk.icon;
            return (
              <div
                key={perk.id}
                className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-stone-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-amber-100/70 text-amber-900 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-stone-900 mb-1.5">
                  {perk.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed max-w-xs">
                  {perk.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
