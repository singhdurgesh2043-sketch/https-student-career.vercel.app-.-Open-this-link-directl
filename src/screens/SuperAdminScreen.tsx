import React, { useState, useEffect } from 'react';
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
  LogOut,
  Eye,
  Filter,
  Calendar,
  Phone,
  Layers,
  Sparkles,
} from 'lucide-react';
import { LicenceInfo, CentreProfile, Student, Batch } from '../types';
import { AppStorage } from '../lib/storage';
import { AdminAuthService } from '../services/adminAuthService';
import { SuperAdminLoginScreen } from './SuperAdminLoginScreen';

interface SuperAdminScreenProps {
  onBack: () => void;
}

export const SuperAdminScreen: React.FC<SuperAdminScreenProps> = ({ onBack }) => {
  // Gatekeeper: verify if authenticated session exists
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    AdminAuthService.isAuthenticated()
  );

  // Storage State
  const [licences, setLicences] = useState<LicenceInfo[]>([]);
  const [centres, setCentres] = useState<CentreProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'real' | 'demo' | 'active' | 'inactive'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Inspector Modal State
  const [inspectCentre, setInspectCentre] = useState<{
    centre: CentreProfile;
    students: Student[];
    batches: Batch[];
    totalRevenue: number;
    licence?: LicenceInfo;
  } | null>(null);

  // Generate New Licence Modal
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [newCentreName, setNewCentreName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');
  const [newPrice, setNewPrice] = useState(14999);

  // Load real data from storage
  const loadAdminData = () => {
    const allCentres = AppStorage.getAllCentres();
    const allLicences = AppStorage.getAllLicences();
    setCentres(allCentres);
    setLicences(allLicences);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    AdminAuthService.logout();
    setIsAuthenticated(false);
    onBack();
  };

  // If not authenticated, show dedicated Secret Access Code login screen
  if (!isAuthenticated) {
    return (
      <SuperAdminLoginScreen
        onAuthenticated={() => {
          setIsAuthenticated(true);
        }}
        onBack={onBack}
      />
    );
  }

  // Real Multi-Tenant Stats
  const stats = AppStorage.getSuperAdminStats();
  const realLicences = licences.filter((l) => !l.is_demo);
  const demoLicences = licences.filter((l) => l.is_demo);

  const handleGenerateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const cleanName = newCentreName.trim();
    const nameCode =
      cleanName.substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '') || 'CENT';
    const generatedKey = `SC-2026-${nameCode}-${randomDigits}`;
    const generatedCode = `ACT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newLicence: LicenceInfo = {
      id: 'lic-' + Math.random().toString(36).substring(2, 9),
      license_key: generatedKey,
      activation_code: generatedCode,
      centre_id: 'centre-' + Math.random().toString(36).substring(2, 9),
      centre_name: cleanName,
      owner_name: newOwnerName.trim(),
      owner_phone: newOwnerPhone.trim(),
      plan_type: 'LIFETIME_ONE_TIME',
      amount_paid: Number(newPrice),
      status: 'inactive',
      max_devices: 1,
      device_count: 0,
      is_demo: false,
    };

    AppStorage.setLicence(newLicence);
    loadAdminData();
    setIsGenerateOpen(false);
    setNewCentreName('');
    setNewOwnerName('');
    setNewOwnerPhone('');
  };

  const handleToggleStatus = (centreId: string) => {
    const centre = centres.find((c) => c.id === centreId);
    if (!centre) return;
    const nextStatus = centre.status === 'active' ? 'inactive' : 'active';
    AppStorage.updateCentreStatus(centreId, nextStatus);
    loadAdminData();
  };

  const handleResetDevice = (l: LicenceInfo) => {
    if (
      confirm(
        `Authorized Device Replacement: Reset hardware pairing for "${l.centre_name}"?\nThe customer will be able to activate on their replacement smartphone.`
      )
    ) {
      const updatedLicence: LicenceInfo = {
        ...l,
        device_count: 0,
        device_uuid: undefined,
      };
      AppStorage.setLicence(updatedLicence);
      loadAdminData();
      alert('Device binding successfully reset! Customer can now activate on replacement phone.');
    }
  };

  const handleInspect = (centre: CentreProfile) => {
    const isolatedStudents = AppStorage.getStudents(centre.id);
    const isolatedBatches = AppStorage.getBatches(centre.id);
    const isolatedPayments = AppStorage.getPayments(centre.id);
    const matchedLicence = licences.find((l) => l.centre_id === centre.id);
    const revenue = isolatedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    setInspectCentre({
      centre,
      students: isolatedStudents,
      batches: isolatedBatches,
      totalRevenue: revenue,
      licence: matchedLicence,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filter centres
  const filteredCentres = centres.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.owner_phone.includes(searchQuery) ||
      (c.code && c.code.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'real') return !c.is_demo;
    if (filterType === 'demo') return !!c.is_demo;
    if (filterType === 'active') return c.status === 'active';
    if (filterType === 'inactive') return c.status === 'inactive';
    return true;
  });

  return (
    <div className="space-y-4 pb-8">
      {/* Top Header with Logout */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-800 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Super Admin (Active Session)</span>
          </span>

          <button
            onClick={handleLogout}
            className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-1 rounded-xl flex items-center gap-1 transition cursor-pointer"
            title="Terminate secure admin session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-3.5 rounded-2xl shadow-sm">
          <p className="text-[10px] uppercase font-bold text-blue-200">Real Registered</p>
          <p className="text-2xl font-black mt-0.5">{stats.realCentresCount}</p>
          <p className="text-[10px] text-blue-300 mt-1">
            + {stats.demoCentresCount} sample demo
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-700 to-teal-800 text-white p-3.5 rounded-2xl shadow-sm">
          <p className="text-[10px] uppercase font-bold text-emerald-200">Active Licences</p>
          <p className="text-2xl font-black mt-0.5">{stats.activeLicencesCount}</p>
          <p className="text-[10px] text-emerald-200 mt-1">
            {stats.inactiveLicencesCount} inactive
          </p>
        </div>

        <div className="bg-gradient-to-br from-violet-700 to-purple-900 text-white p-3.5 rounded-2xl shadow-sm">
          <p className="text-[10px] uppercase font-bold text-violet-200">Real Students</p>
          <p className="text-2xl font-black mt-0.5">{stats.realStudentsCount}</p>
          <p className="text-[10px] text-violet-200 mt-1">Enrolled across centres</p>
        </div>

        <div className="bg-gradient-to-br from-amber-600 to-amber-700 text-white p-3.5 rounded-2xl shadow-sm">
          <p className="text-[10px] uppercase font-bold text-amber-100">Total Licence Sales</p>
          <p className="text-2xl font-black mt-0.5">₹{(stats.totalSalesRevenue / 1000).toFixed(1)}k</p>
          <p className="text-[10px] text-amber-100 mt-1">Direct lifetime licenses</p>
        </div>
      </div>

      {/* Action & Filter Row */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by centre name, director, phone..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <button
            onClick={() => setIsGenerateOpen(true)}
            className="py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 shrink-0 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Licence</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto text-[11px] pb-1">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({centres.length})
          </button>
          <button
            onClick={() => setFilterType('real')}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              filterType === 'real'
                ? 'bg-blue-700 text-white font-semibold'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            Real Accounts ({stats.realCentresCount})
          </button>
          <button
            onClick={() => setFilterType('demo')}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              filterType === 'demo'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Demo ({stats.demoCentresCount})
          </button>
          <button
            onClick={() => setFilterType('active')}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              filterType === 'active'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Active ({centres.filter((c) => c.status === 'active').length})
          </button>
          <button
            onClick={() => setFilterType('inactive')}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              filterType === 'inactive'
                ? 'bg-rose-700 text-white font-semibold'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Inactive ({centres.filter((c) => c.status === 'inactive').length})
          </button>
        </div>
      </div>

      {/* Organizations List */}
      <div className="space-y-3">
        {filteredCentres.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-slate-500 text-xs">
            No registered tuition centres match your current filter.
          </div>
        ) : (
          filteredCentres.map((c) => {
            const matchedLicence = licences.find((l) => l.centre_id === c.id);
            const studentCount = AppStorage.getStudents(c.id).length;
            const batchCount = AppStorage.getBatches(c.id).length;

            return (
              <div
                key={c.id}
                className={`bg-white rounded-3xl p-4 border transition shadow-2xs space-y-3 ${
                  c.is_demo ? 'border-amber-200/90 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{c.name}</h4>
                      {c.is_demo ? (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-md border border-amber-200">
                          Demo Sample
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-md border border-blue-200">
                          Real Customer
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Director: <span className="font-semibold text-slate-700">{c.owner_name}</span> •{' '}
                      <span className="font-mono">{c.owner_phone}</span>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {c.city ? `${c.city}, ` : ''}{c.state || 'India'} • Code: {c.code || c.id}
                    </p>
                  </div>

                  {/* Status Toggle Button */}
                  <button
                    onClick={() => handleToggleStatus(c.id)}
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition cursor-pointer ${
                      c.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
                    }`}
                  >
                    {c.status || 'active'}
                  </button>
                </div>

                {/* Metrics Pill */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-2xl text-center text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[9px]">Students</span>
                    <span className="font-bold text-slate-800">{studentCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Batches</span>
                    <span className="font-bold text-slate-800">{batchCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Registered On</span>
                    <span className="font-medium text-slate-700">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Initial'}
                    </span>
                  </div>
                </div>

                {/* Licence & Hardware Pairing Box */}
                {matchedLicence ? (
                  <div className="bg-slate-50/80 p-2.5 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[10px]">License Key:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-bold text-blue-900">
                          {matchedLicence.license_key}
                        </span>
                        <button
                          onClick={() => copyToClipboard(matchedLicence.license_key)}
                          className="p-1 hover:text-blue-700 text-slate-400 cursor-pointer"
                        >
                          {copiedKey === matchedLicence.license_key ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[10px]">Activation Code:</span>
                      <span className="font-mono font-bold text-slate-700">
                        {matchedLicence.activation_code}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px]">
                      <span className="text-slate-500">Hardware Pairing:</span>
                      <span className="text-slate-700 font-medium">
                        {matchedLicence.device_uuid ? (
                          <span className="text-emerald-700 font-mono">
                            Bound ({matchedLicence.device_uuid.substring(0, 16)}...)
                          </span>
                        ) : (
                          <span className="text-amber-600">Pending Device Pairing</span>
                        )}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200">
                    No license linked to this centre ID.
                  </div>
                )}

                {/* Footer Controls: Inspect Data & Hardware Reset */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => handleInspect(c)}
                    className="py-1 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-[11px] flex items-center gap-1 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Records ({studentCount})</span>
                  </button>

                  {matchedLicence && (
                    <button
                      onClick={() => handleResetDevice(matchedLicence)}
                      className="py-1 px-2.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 font-semibold rounded-lg text-[11px] flex items-center gap-1 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-amber-600" />
                      <span>Reset Hardware Pairing</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Organization Records Inspector Modal */}
      {inspectCentre && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{inspectCentre.centre.name}</h3>
                  {inspectCentre.centre.is_demo ? (
                    <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                      Demo
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                      Real Customer
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Director: {inspectCentre.centre.owner_name} • {inspectCentre.centre.owner_phone}
                </p>
              </div>
              <button
                onClick={() => setInspectCentre(null)}
                className="p-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Isolated Summary */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Enrolled Students</span>
                <span className="text-lg font-bold text-slate-800">{inspectCentre.students.length}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Batches</span>
                <span className="text-lg font-bold text-slate-800">{inspectCentre.batches.length}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Fee Revenue</span>
                <span className="text-lg font-bold text-emerald-700">₹{inspectCentre.totalRevenue.toLocaleString()}</span>
              </div>
            </div>

            {/* Students List in this tenant */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Isolated Student Roster
              </h4>
              {inspectCentre.students.length === 0 ? (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl text-center">
                  This tuition centre is completely fresh. No students have been enrolled yet.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                  {inspectCentre.students.map((std) => (
                    <div key={std.id} className="p-2.5 bg-slate-50/50 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-800">{std.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {std.class} • Parent: {std.parent_contact}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          std.payment_status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {std.payment_status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Batches in this tenant */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Active Batches
              </h4>
              {inspectCentre.batches.length === 0 ? (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl text-center">
                  No batches created yet.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                  {inspectCentre.batches.map((b) => (
                    <div key={b.id} className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <p className="font-bold text-slate-800 text-[11px] truncate">{b.name}</p>
                      <p className="text-[10px] text-slate-500">{b.subject}</p>
                      <p className="text-[9px] text-slate-400">{b.start_time} - {b.end_time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setInspectCentre(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}

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
                    Director / Owner Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    placeholder="Full Name"
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
                    onChange={(e) => setNewOwnerPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="10-digit mobile"
                    maxLength={10}
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
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl cursor-pointer"
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
