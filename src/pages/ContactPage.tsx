import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Clock,
  HelpCircle,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  RotateCcw,
  Send,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ContactPage: React.FC = () => {
  const { settings, submitContact, openGeneralWhatsApp, setCurrentView } = useStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    orderId: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setSubmitting(true);
    await submitContact({
      name: form.name,
      email: form.email,
      phone: form.phone,
      orderId: form.orderId,
      subject: form.subject || 'General Inquiry',
      message: form.message,
    });
    setSubmitting(false);
    setSubmitted(true);
    setForm({ name: '', email: '', phone: '', orderId: '', subject: 'General Inquiry', message: '' });
  };

  const contactFaqs = [
    {
      q: 'How do I initiate a return or size exchange?',
      a: 'You can initiate a return or size exchange directly through your Fashinery Account under My Orders, or reach out to our support team.',
    },
    {
      q: 'What is the shipping dispatch & delivery timeframe?',
      a: 'All orders are dispatched within 24–48 hours from our Mumbai facility. Standard express delivery across India takes 2–5 business days, with real-time SMS & email tracking updates.',
    },
    {
      q: 'How are refunds credited for Cash on Delivery (COD)?',
      a: 'For COD returns, our support team collects your preferred UPI ID or bank account details. Refunds are initiated upon quality check at the warehouse and credited within 5–7 business days.',
    },
    {
      q: 'Can I speak with a personal stylist regarding sizing?',
      a: 'Yes! Connect directly with our Mumbai stylists via WhatsApp (+91 93720 85090) to discuss garment drape, blouse alteration allowances, and festive pairings.',
    },
  ];

  return (
    <div id="contact-page" className="min-h-screen bg-[#faf7f2] py-10 sm:py-16 text-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold tracking-[0.25em] text-amber-800 uppercase block mb-1">
            Client Care Concierge
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Connect With Fashinery
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 font-sans leading-relaxed">
            Whether inquiring about custom sizing, wedding collections, doorstep returns, or order dispatches, our team is at your dedicated service.
          </p>
        </div>

        {/* Return Address Notice Callout */}
        <div
          id="contact-return-notice"
          className="mb-8 p-5 bg-amber-950 text-amber-100 rounded-3xl border border-amber-900 shadow-xs flex items-start gap-4"
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm space-y-1">
            <span className="font-serif font-bold text-white block">
              Important: Physical Return Address Notice
            </span>
            <p className="text-amber-200/90 leading-relaxed font-sans">
              Please <strong>DO NOT</strong> send return parcels to our corporate address. Our registered Mumbai facility serves as an administrative atelier and cannot accept unscheduled deliveries. All returns and exchanges must be scheduled online or via WhatsApp so our reverse logistics team can execute a complimentary doorstep pickup.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 5 Cols: Contact Details & At-a-Glance FAQ */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
              <h3 className="font-serif text-xl font-bold text-stone-900 pb-3 border-b border-stone-100">
                Atelier &amp; Brand Information
              </h3>

              <div className="space-y-4 text-xs sm:text-sm text-stone-700 font-sans">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-900 block">Registered Business Address</span>
                    <p className="text-stone-600 leading-relaxed font-mono text-xs mt-0.5">
                      {settings.address}
                    </p>
                    <span className="text-[11px] text-amber-800 font-medium block mt-1">
                      (Administrative office only. Reverse pickups are coordinated digitally).
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-900 block">Customer Helpline</span>
                    <a
                      href={`tel:${settings.phone}`}
                      className="text-stone-800 hover:text-amber-900 font-semibold transition-colors"
                    >
                      +91 {settings.phone}
                    </a>
                    <span className="block text-[11px] text-stone-400 mt-0.5">
                      {settings.supportHours || 'Monday to Saturday: 10:00 AM – 7:00 PM IST'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-900 block">Official Support Email</span>
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-stone-800 hover:text-amber-900 font-semibold transition-colors"
                    >
                      {settings.email}
                    </a>
                    <span className="block text-[11px] text-stone-400 mt-0.5">
                      Response window: Within 24 hours
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-900 block">WhatsApp Concierge</span>
                    <a
                      href={`https://wa.me/${(settings.whatsapp || '').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 font-bold transition-colors"
                    >
                      {settings.whatsapp}
                    </a>
                    <span className="block text-[11px] text-stone-400 mt-0.5">
                      Fastest response for sizing, returns &amp; orders
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp CTA Button */}
              <div className="pt-2">
                <button
                  id="btn-contact-whatsapp-direct"
                  onClick={openGeneralWhatsApp}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Start WhatsApp Conversation</span>
                </button>
              </div>
            </div>

            {/* Quick Helper Links */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                Self-Service Shortcuts
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCurrentView('track')}
                  className="p-3 bg-stone-50 hover:bg-stone-100 rounded-xl text-left border border-stone-200 text-xs font-semibold text-stone-800 flex items-center gap-2 cursor-pointer"
                >
                  <Package className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>Track Order</span>
                </button>
                <button
                  onClick={() => setCurrentView('faq')}
                  className="p-3 bg-stone-50 hover:bg-stone-100 rounded-xl text-left border border-stone-200 text-xs font-semibold text-stone-800 flex items-center gap-2 cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>View FAQ</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right 7 Cols: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-xs space-y-6">
              <div>
                <span className="text-xs font-bold tracking-widest text-amber-800 uppercase block mb-1">
                  Send an Inquiry
                </span>
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  How May We Assist You?
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Fill in the details below and our Mumbai client relationship team will respond promptly.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="font-serif text-xl font-bold text-emerald-950">
                    Message Dispatched Successfully
                  </h3>
                  <p className="text-xs text-emerald-800 max-w-sm mx-auto leading-relaxed">
                    Thank you for contacting Fashinery. A client care advisor will review your inquiry and get in touch within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs uppercase px-6 py-2.5 rounded-xl font-semibold cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold uppercase text-stone-700 mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Radhika Verma"
                        className="w-full bg-stone-50 p-3 rounded-xl border border-stone-200 focus:bg-white focus:outline-hidden focus:border-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold uppercase text-stone-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="10-digit mobile number"
                        className="w-full bg-stone-50 p-3 rounded-xl border border-stone-200 focus:bg-white focus:outline-hidden focus:border-stone-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold uppercase text-stone-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="name@example.com"
                        className="w-full bg-stone-50 p-3 rounded-xl border border-stone-200 focus:bg-white focus:outline-hidden focus:border-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold uppercase text-stone-700 mb-1">
                        Order ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={form.orderId}
                        onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                        placeholder="e.g. FSH-2026-XXXXX"
                        className="w-full bg-stone-50 p-3 rounded-xl border border-stone-200 focus:bg-white focus:outline-hidden focus:border-stone-900 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">
                      Subject / Topic
                    </label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full bg-stone-50 p-3 rounded-xl border border-stone-200 focus:bg-white focus:outline-hidden focus:border-stone-900 text-xs"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Order Status / Tracking">Order Status / Tracking</option>
                      <option value="Return or Size Exchange Request">Return or Size Exchange Request</option>
                      <option value="Product Sizing & Fabric Inquiries">Product Sizing & Fabric Inquiries</option>
                      <option value="Payment or Refund Assistance">Payment or Refund Assistance</option>
                      <option value="Custom Blouse Tailoring">Custom Blouse Tailoring</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">
                      Your Message *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Please elaborate on your inquiry or specific garment requirement..."
                      className="w-full bg-stone-50 p-3 rounded-xl border border-stone-200 focus:bg-white focus:outline-hidden focus:border-stone-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-stone-950 hover:bg-stone-800 text-white text-xs uppercase tracking-widest font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Sending Message...' : 'Submit Inquiry'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
