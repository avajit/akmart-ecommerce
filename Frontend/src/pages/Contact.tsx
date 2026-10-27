import React, { useState } from 'react';
import Title from '../components/Title';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../api/client';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      return toast.error('Please complete all required fields.');
    }
    setIsSubmitting(true);
    try {
      await api.post('/contact', formData);
      toast.success('Your message was sent to AkMart Customer Support! We will reply within 4 hours.');
      setIsSent(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-poppins text-white min-h-screen">
      <div className="text-center py-6 text-3xl">
        <Title text1="CONTACT" text2="SUPPORT" />
        <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto mt-2">
          We&apos;re here to assist you 7 days a week. Reach out via phone, email, or send us a message below.
        </p>
      </div>

      <div className="my-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-6 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mb-3">
              <FiMapPin className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Headquarters</h3>
            <p className="text-xs text-gray-300 mt-2 leading-relaxed">
              AkMart Tower, New Baneshwor, Ward 10<br />
              Kathmandu, Bagmati Province, Nepal
            </p>
          </div>

          <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-6 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mb-3">
              <FiPhone className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Direct Hotline</h3>
            <p className="text-xs text-gray-300 font-mono mt-2">
              +977 1-5970000 (Helpline)<br />
              +977-9801234567 (WhatsApp / Viber Support)
            </p>
          </div>

          <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-6 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mb-3">
              <FiMail className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Email Enquiries</h3>
            <p className="text-xs text-gray-300 mt-2">
              Support: <span className="text-orange-400">support@akmart.com.np</span><br />
              Seller Hub: <span className="text-orange-400">merchant@akmart.com.np</span>
            </p>
          </div>

          <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-6 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mb-3">
              <FiClock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Working Hours</h3>
            <p className="text-xs text-gray-300 mt-2">
              Sunday – Friday: 9:00 AM – 8:00 PM NPT<br />
              Saturday: 10:00 AM – 5:00 PM NPT
            </p>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-2">
          <div className="bg-[#141414] border border-gray-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl">
            <h3 className="text-xl font-extrabold text-white mb-2">Send Us a Direct Message</h3>
            <p className="text-xs text-gray-400 mb-6">
              Have a question regarding order tracking, product specifications, or seller registration? Fill out the form and our team will get back to you promptly.
            </p>

            {isSent && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4 shrink-0" />
                <span>Thank you! Your message was submitted successfully. Our support desk will reach out within 4 business hours.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Your Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Aarav Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="e.g. aarav@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Mobile Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9801234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500 font-mono transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Inquiry regarding Order #1234"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Your Message *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tell us how we can assist you..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-8 py-3.5 rounded-xl transition shadow-lg shadow-orange-500/20 text-xs uppercase tracking-wider active:scale-[0.99]"
              >
                <FiSend /> {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
