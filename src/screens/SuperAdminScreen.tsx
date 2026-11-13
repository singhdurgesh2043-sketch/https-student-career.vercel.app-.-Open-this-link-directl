import React, { useState } from 'react';
import {
  ShieldCheck,
  Building,
  KeyRound,
  RotateCcw,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Smartphone,
  ArrowLeft,
  DollarSign,
  Users,
  Copy,
  Check,
} from 'lucide-react';
import { LicenceInfo, ActiveScreen } from '../types';
import { AppStorage } from '../lib/storage';

interface SuperAdminScreenProps {
  onBack: () => void;
}

export const SuperAdminScreen: React.FC<SuperAdminScreenProps> = ({ onBack }) => {
  const [licences, setLicences] = useState<LicenceInfo[]>([
    {
      id: 'lic-1',
      license_key: 'SC-2026-APEX-9921',
      activation_code: 'ACT-7842',
      centre_id: 'centre-sc-101',
      centre_name: 'Apex Career Academy',
      owner_name: 'Prof. Rajesh Sharma',
      owner_phone: '9876543210',
      plan_type: 'LIFETIME_ONE_TIME',
      amount_paid: 14999,
      status: 'active',
      max_devices: 1,
      device_count: 1,
      activated_at: '2026-01-10T10:00:00Z',
      device_uuid: 'ANDROID-DEV-SM-A546B',
    },
    {
      id: 'lic-2',
      license_key: 'SC-2026-SCHOLAR-4412',
      activation_code: 'ACT-3190',
      centre_id: 'centre-sc-102',
      centre_name: 'Scholars Point Institute',
      owner_name: 'Er. Vivek Saxena',
      owner_phone: '9811223344',
      plan_type: 'LIFETIME_ONE_TIME',
      amount_paid: 14999,
      status: 'active',
      max_devices: 1,
      device_count: 1,
      activated_at: '2026-02-14T11:20:00Z',
      device_uuid: 'ANDROID-DEV-ONEPLUS-11',
    },
    {
      id: 'lic-3',
      license_key: 'SC-2026-BRIGHT-8821',
      activation_code: 'ACT-9081',
      centre_id: 'centre-sc-103',
      centre_name: 'Bright Future Tuition',
      owner_name: 'Mrs. Kavita Rao',
      owner_phone: '9822334455',
      plan_type: 'LIFETIME_ONE_TIME',
      amount_paid: 14999,
      status: 'inactive',
      max_devices: 1,
      device_count: 0,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [newCentreName, setNewCentreName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');
  const [newPrice, setNewPrice] = useState(14999);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const totalSales = licences.reduce((acc, l) => acc + (l.amount_paid || 0), 0);
  const activeCount = licences.filter((l) => l.status === 'active').length;

  const handleGenerateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const generatedKey = `SC-2026-${newCentreName.substring(0, 4).toUpperCase().replace(/\s+/g, '') || 'CENT'}-${randomDigits}`;
    const generatedCode = `ACT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newLicence: LicenceInfo = {
      id: 'lic-' + Math.random().toString(36).substring(2, 9),
      license_key: generatedKey,
      activation_code: generatedCode,
      centre_id: 'centre-' + Math.random().toString(36).substring(2, 9),
      centre_name: newCentreName.trim(),
      owner_name: newOwnerName.trim(),
      owner_phone: newOwnerPhone.trim(),
      plan_type: 'LIFETIME_ONE_TIME',
      amount_paid: Number(newPrice),
      status: 'inactive',
      max_devices: 1,
      device_count: 0,
    };

    setLicences([newLicence, ...licences]);
    setIsGenerateOpen(false);
    setNewCentreName('');
    setNewOwnerName('');
    setNewOwnerPhone('');
  };

  const handleToggleStatus = (id: string) => {
    setLicences((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const nextStatus = l.status === 'active' ? 'inactive' : 'active';
          return { ...l, status: nextStatus };
        }
        return l;
      })
    );
  };

  const handleResetDevice = (l: LicenceInfo) => {
    if (
      confirm(
        `Authorized Device Replacement: Reset hardware pairing for "${l.centre_name}"? The customer will be able to activate their new smartphone.`
      )
    ) {
      setLicences((prev) =>
        prev.map((item) =>
          item.id === l.id
            ? { ...item, device_count: 0, device_uuid: undefined }
            : item
        )
      );
      alert('Device binding successfully reset! Customer can now activate on replacement phone.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredLicences = licences.filter((l) =>
    l.centre_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.license_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.owner_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Super Admin</span>
        </button>

        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Super Admin Access</span>
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-3 rounded-2xl">
          <p className="text-[9px] uppercase font-bold text-blue-200">Total Centres</p>
          <p className="text-xl font-black mt-0.5">{licences.length}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-700 to-teal-800 text-white p-3 rounded-2xl">
          <p className="text-[9px] uppercase font-bold text-emerald-200">Active Licences</p>
          <p className="text-xl font-black mt-0.5">{activeCount}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-600 to-amber-700 text-white p-3 rounded-2xl">
          <p className="text-[9px] uppercase font-bold text-amber-100">Total Sales (INR)</p>
          <p className="text-xl font-black mt-0.5">₹{(totalSales / 1000).toFixed(1)}k</p>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search licence or centre..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <button
          onClick={() => setIsGenerateOpen(true)}
          className="py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 shrink-0 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Licence</span>
        </button>
      </div>

      {/* Licences List */}
      <div className="space-y-3">
        {filteredLicences.map((l) => (
          <div
            key={l.id}
            className="bg-white rounded-3xl p-4 border border-slate-200 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">{l.centre_name}</h4>
                <p className="text-[11px] text-slate-500">
                  {l.owner_name} • {l.owner_phone}
                </p>
              </div>

              <button
                onClick={() => handleToggleStatus(l.id)}
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full transition ${
                  l.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {l.status}
              </button>
            </div>

            {/* Keys box */}
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[10px]">License Key:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono font-bold text-blue-900">{l.license_key}</span>
                  <button
                    onClick={() => copyToClipboard(l.license_key)}
                    className="p-1 hover:text-blue-700 text-slate-400"
                  >
                    {copiedKey === l.license_key ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[10px]">Activation Code:</span>
                <span className="font-mono font-bold text-slate-700">{l.activation_code}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px]">
                <span className="text-slate-500">Device Pairing:</span>
                <span className="text-slate-700 font-medium">
                  {l.device_uuid ? (
                    <span className="text-emerald-700 font-mono">Bound ({l.device_uuid.substring(0, 12)}...)</span>
                  ) : (
                    <span className="text-amber-600">Pending First Activation</span>
                  )}
                </span>
              </div>
            </div>

            {/* Super Admin Actions */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
              <span className="font-bold text-slate-700">₹{l.amount_paid} Paid</span>

              <button
                onClick={() => handleResetDevice(l)}
                className="py-1 px-2.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 font-semibold rounded-lg text-[11px] flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3 text-amber-600" />
                <span>Reset Device Binding</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Generate New License Modal */}
      {isGenerateOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-3">
            <h3 className="text-base font-bold text-slate-900">Generate Customer Licence</h3>
            <p className="text-xs text-slate-500">
              Create a unique one-time lifetime license key for a tuition centre.
            </p>

            <form onSubmit={handleGenerateLicense} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tuition Centre Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCentreName}
                  onChange={(e) => setNewCentreName(e.target.value)}
                  placeholder="e.g. Master Minds Academy"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Owner Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    placeholder="Prof. Gupta"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    WhatsApp Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={newOwnerPhone}
                    onChange={(e) => setNewOwnerPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  One-Time Sale Price (₹)
                </label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGenerateOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl"
                >
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
