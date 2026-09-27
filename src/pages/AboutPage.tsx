import React from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Heart,
  HelpCircle,
  MessageCircle,
  Package,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const AboutPage: React.FC = () => {
  const { setCurrentView, openGeneralWhatsApp } = useStore();

  const milestones = [
    {
      year: 'The Genesis',
      title: 'Born from a Passion for Everyday Elegance',
      description:
        'Fashinery was envisioned with a single conviction: Indian women deserve timeless wardrobe heirlooms that celebrate cultural richness without sacrificing contemporary ease, breathability, and comfort.',
    },
    {
      year: 'The Atelier',
      title: 'Craftsmanship & Fabric Integrity',
      description:
        'Every textile in our collection—from hand-spun Chanderis and organza silks to plush georgettes and modal cottons—is hand-selected, rigorously tested for tensile drape, and inspected for skin-safe natural dyes.',
    },
    {
      year: 'The Promise',
      title: 'Fair Pricing & Zero Compromise',
      description:
        'By partnering directly with master weaving clusters across Varanasi, Jaipur, and Surat, we eliminate middlemen markups. Every rupee you invest translates directly into superior garment construction and enduring wearability.',
    },
  ];

  const coreValues = [
    {
      icon: Sparkles,
      title: 'Heritage Meets Modern Silhouettes',
      description:
        'We blend age-old zardozi, gota patti, and floral prints with ergonomic cuts, pre-stitched drapes, and thoughtfully placed pockets.',
    },
    {
      icon: ShieldCheck,
      title: 'Uncompromising Quality Standard',
      description:
        'Triple-stage quality checks: stitching tension, seam lining, and color-fastness are verified before any parcel departs our Mumbai facility.',
    },
    {
      icon: Heart,
      title: 'Comfort-First Tailoring',
      description:
        'Fashion should never constrict. Our breathable linings, generous seam margins for alterations, and lightweight flares ensure you feel regal all day.',
    },
    {
      icon: Users,
      title: 'Ethical Artisan Support',
      description:
        'We uphold humane working conditions, fair living wages, and celebrate traditional artisans whose generational mastery keeps our crafts alive.',
    },
  ];

  const highlights = [
    {
      title: 'Free Shipping Across India',
      subtitle: 'Prompt dispatch within 24-48 hours with zero delivery fees on all orders.',
      icon: Truck,
    },
    {
      title: '7-Day Easy Returns & Exchanges',
      subtitle: 'Doorstep pickup arranged digitally with fast, transparent processing.',
      icon: RotateCcw,
    },
    {
      title: 'Hand-Inspected Finishes',
      subtitle: 'Every border, hook, and tassel is meticulously examined prior to boxing.',
      icon: Award,
    },
    {
      title: 'Direct Stylist Support',
      subtitle: 'Personal styling & sizing advice directly via WhatsApp concierge.',
      icon: MessageCircle,
    },
  ];

  return (
    <div id="about-page" className="min-h-screen bg-[#fcfaf7] text-stone-900">
      {/* Editorial Hero Banner */}
      <section className="relative overflow-hidden border-b border-stone-200 bg-[#f9f5ee] py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold tracking-[0.25em] text-amber-800 uppercase block mb-3">
            Our Story &amp; Heritage
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-stone-900 tracking-tight leading-tight">
            Fashion That Feels Like You.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-stone-600 max-w-2xl mx-auto font-sans leading-relaxed">
            Thoughtfully curated women’s fashion crafted for grace, comfort, and timeless presence—from quiet everyday moments to luminous family celebrations.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              id="btn-about-shop-now"
              onClick={() => setCurrentView('shop')}
              className="bg-stone-950 hover:bg-stone-800 text-white text-xs uppercase tracking-widest font-semibold px-8 py-3.5 rounded-full shadow-sm transition-colors cursor-pointer"
            >
              Explore Collection
            </button>
            <button
              id="btn-about-ask-stylist"
              onClick={openGeneralWhatsApp}
              className="bg-white hover:bg-stone-100 text-stone-900 border border-stone-300 text-xs uppercase tracking-widest font-semibold px-8 py-3.5 rounded-full transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Chat with Stylist</span>
            </button>
          </div>
        </div>
      </section>

      {/* Brand Narrative Section */}
      <section className="py-16 sm:py-20 border-b border-stone-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 text-stone-700 font-sans leading-relaxed text-sm sm:text-base">
            <div className="text-center mb-10">
              <span className="text-xs font-semibold tracking-widest text-amber-800 uppercase block">
                The Philosophy
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 mt-1">
                The Heart Behind Fashinery
              </h2>
            </div>

            <p>
              In a world crowded with disposable trends and rushed synthetic garments, <strong>Fashinery</strong> was created to restore intentionality to women’s fashion. We believe that true luxury is not defined by an exorbitant price tag, but by how a garment feels against your skin, how effortlessly it moves with you, and how confident you feel wearing it.
            </p>

            <p>
              Headquartered in Mumbai, Fashinery curates authentic Indian ethnic and contemporary silhouettes designed for the multifaceted lives of modern women. Whether you are stepping into a crucial boardroom presentation in an understated handloom kurti, celebrating an intimate puja with family in a pure georgette saree, or dancing through wedding sangeets in a meticulously flared lehenga, our creations are built to elevate your spirit.
            </p>

            <div className="p-6 sm:p-8 bg-[#faf7f2] rounded-2xl border border-stone-200 my-8">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 mb-2">
                "Fashion should make you feel effortlessly yourself."
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm italic">
                We design with generous seam allowances, soft breathable inner linings, and featherlight fabrics so you never have to choose between looking breathtaking and feeling completely at ease.
              </p>
            </div>

            <p>
              Our artisans and master drapers bring decades of generational knowledge in needlework, hand-block printing, and weaving traditions. By honoring their ancestral techniques and infusing them with contemporary sensibilities, we create pieces destined to be treasured for seasons to come.
            </p>
          </div>
        </div>
      </section>

      {/* Pillars of Craftsmanship */}
      <section className="py-16 sm:py-20 bg-[#faf7f2] border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold tracking-widest text-amber-800 uppercase block mb-1">
              Guiding Standards
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Our Core Commitments
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2">
              Every garment carrying the Fashinery label reflects four foundational principles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coreValues.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">
                      {val.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      {val.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Narrative Timeline */}
      <section className="py-16 sm:py-20 bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-widest text-amber-800 uppercase block mb-1">
              The Journey
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Rooted in Craft, Built for You
            </h2>
          </div>

          <div className="space-y-8">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row gap-4 sm:gap-8 pb-8 border-b border-stone-100 last:border-0"
              >
                <div className="sm:w-36 shrink-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1.5 rounded-full inline-block">
                    {m.year}
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 mb-1">
                    {m.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {m.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Trust Highlights */}
      <section className="py-14 bg-[#f9f6f0] border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((h, idx) => {
              const Icon = h.icon;
              return (
                <div key={idx} className="text-center p-4">
                  <div className="w-10 h-10 mx-auto rounded-full bg-stone-900 text-amber-100 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-bold text-sm text-stone-900 mb-1">
                    {h.title}
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {h.subtitle}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-stone-950 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">
            Start Your Journey
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold">
            Experience the Fashinery Difference
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto leading-relaxed">
            Browse our new season arrivals featuring exquisite Sarees, regal Lehengas, contemporary Anarkalis, and breezy fusion dresses.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setCurrentView('shop')}
              className="bg-white hover:bg-stone-100 text-stone-950 text-xs uppercase tracking-widest font-semibold px-8 py-3.5 rounded-full transition-colors cursor-pointer"
            >
              Shop New Arrivals
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
