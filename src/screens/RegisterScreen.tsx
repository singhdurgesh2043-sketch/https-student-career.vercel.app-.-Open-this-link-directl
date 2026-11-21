import React, { useState } from 'react';
import {
  Building2,
  User,
  Phone,
  MapPin,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Sparkles,
} from 'lucide-react';
import { CentreProfile } from '../types';
import { AppStorage } from '../lib/storage';

interface RegisterScreenProps {
  onRegisterSuccess: (newCentre: CentreProfile) => void;
  onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
}) => {
  // Completely fresh and blank form fields by default - No pre-filled demo data
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = name.trim();
    const cleanOwner = ownerName.trim();
    const cleanPhone = phone.trim();

    if (!cleanName || !cleanOwner || !cleanPhone) {
      setErrorMsg('Please fill in all required fields marked with *');
      return;
    }

    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSubmitting(true);

    const centreCode =
      'SC-' +
      (cleanName.substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '') || 'CENT') +
      '-' +
      Math.floor(100 + Math.random() * 900);

    try {
      // Registers an isolated organization in multi-tenant storage
      const newCentre = AppStorage.registerNewCentre({
        code: centreCode,
        name: cleanName,
        tagline: tagline.trim(),
        owner_name: cleanOwner,
        owner_phone: cleanPhone,
        owner_email: email.trim(),
        whatsapp_number: cleanPhone,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        upi_id: upiId.trim(),
      });

      setTimeout(() => {
        setIsSubmitting(false);
        setSuccess(true);
        setTimeout(() => {
          onRegisterSuccess(newCentre);
        }, 600);
      }, 400);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('Failed to register centre. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-4 py-8">
      <div className="max-w-md w-full mx-auto space-y-4">
        <button
          onClick={onNavigateToLogin}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </button>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-100 text-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Register Tuition Centre</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Create an isolated organization profile for your coaching institute
            </p>
          </div>

          {/* Privacy & Isolation Guarantee Badge */}
          <div className="mb-4 p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-blue-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Completely Fresh & Isolated Workspace</p>
              <p className="text-blue-700/90 text-[10px]">
                Your tuition centre will start completely empty. No demo students, batches, or records from any other institute will be visible.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
              {errorMsg}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Centre registered successfully! Redirecting to your workspace...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tuition / Coaching Centre Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Tuition / Coaching Name"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tagline / Motto <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Enter tagline (e.g. Excellence in Education)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                autoComplete="off"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Director / Owner Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp Mobile <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="10-digit mobile"
                    maxLength={10}
                    className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    required
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Official Email Address <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@example.com"
                  className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  autoComplete="off"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Premises Address <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Building, Street, Area"
                  className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  City <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  State <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  autoComplete="off"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                UPI ID for Fee Receipts <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourinstitute@upi"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md text-sm flex items-center justify-center gap-2 transition disabled:opacity-70 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering Isolated Profile...' : 'Register Centre Profile'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
