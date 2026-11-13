import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  Users,
  Plus,
  AlertTriangle,
  CheckCircle,
  Building,
  User,
  X,
} from 'lucide-react';
import { Batch, Teacher, CentreProfile } from '../types';

interface TimetableScreenProps {
  batches: Batch[];
  teachers: Teacher[];
  centre: CentreProfile;
  onAddBatch: (batch: Batch) => void;
}

export const TimetableScreen: React.FC<TimetableScreenProps> = ({
  batches,
  teachers,
  centre,
  onAddBatch,
}) => {
  const [activeView, setActiveView] = useState<'daily' | 'batches' | 'weekly'>('daily');
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);

  // New batch state
  const [batchName, setBatchName] = useState('');
  const [batchClass, setBatchClass] = useState('Class 10');
  const [subject, setSubject] = useState('Mathematics');
  const [teacherId, setTeacherId] = useState(teachers[0]?.id || '');
  const [startTime, setStartTime] = useState('04:00 PM');
  const [endTime, setEndTime] = useState('05:30 PM');
  const [roomNumber, setRoomNumber] = useState('Room 101');
  const [capacity, setCapacity] = useState(35);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [clashWarning, setClashWarning] = useState<string | null>(null);

  const daysList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = teachers.find((t) => t.id === teacherId);

    // Simple schedule clash check: same room or teacher with same timing and days
    const clash = batches.find(
      (b) =>
        (b.room_number === roomNumber || b.teacher_id === teacherId) &&
        b.start_time === startTime &&
        b.days.some((d) => selectedDays.includes(d))
    );

    if (clash) {
      setClashWarning(
        `Overlap detected: ${clash.name} is already scheduled in ${roomNumber} or with ${teacher?.name} at ${startTime}.`
      );
      return;
    }

    const newBatch: Batch = {
      id: 'batch-' + Math.random().toString(36).substring(2, 9),
      centre_id: centre.id,
      name: batchName.trim(),
      class: batchClass,
      subject: subject.trim(),
      teacher_id: teacherId,
      teacher_name: teacher?.name || 'Faculty',
      start_time: startTime,
      end_time: endTime,
      days: selectedDays,
      room_number: roomNumber,
      capacity: Number(capacity),
      student_count: 0,
    };

    onAddBatch(newBatch);
    setIsAddBatchOpen(false);
    setClashWarning(null);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Timetable & Batches
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Daily routines, schedule clash detection, classroom allocation
          </p>
        </div>

        <button
          onClick={() => {
            setBatchName('');
            setClashWarning(null);
            setIsAddBatchOpen(true);
          }}
          className="py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Batch</span>
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex bg-slate-200/70 p-1 rounded-2xl text-xs font-semibold">
        <button
          onClick={() => setActiveView('daily')}
          className={`flex-1 py-1.5 rounded-xl transition ${
            activeView === 'daily' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600'
          }`}
        >
          Daily Schedule
        </button>
        <button
          onClick={() => setActiveView('batches')}
          className={`flex-1 py-1.5 rounded-xl transition ${
            activeView === 'batches' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600'
          }`}
        >
          Batches ({batches.length})
        </button>
        <button
          onClick={() => setActiveView('weekly')}
          className={`flex-1 py-1.5 rounded-xl transition ${
            activeView === 'weekly' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600'
          }`}
        >
          Weekly Grid
        </button>
      </div>

      {activeView === 'daily' && (
        <div className="space-y-3">
          {/* Day Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {daysList.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                  selectedDay === day
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Schedule Timeline */}
          <div className="space-y-2.5">
            {batches
              .filter((b) => b.days.includes(selectedDay))
              .map((batch) => (
                <div
                  key={batch.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-start justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{batch.name}</span>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {batch.class}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      📖 {batch.subject || 'All Subjects'} • 👨‍🏫 {batch.teacher_name}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{batch.room_number || 'Room 101'}</span>
                      <span>• Capacity: {batch.capacity || 30} students</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-900">
                      {batch.start_time} - {batch.end_time}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {activeView === 'batches' && (
        <div className="space-y-2.5">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{batch.name}</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Faculty: {batch.teacher_name}
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl">
                  {batch.class}
                </span>
              </div>

              <div className="flex flex-wrap gap-1">
                {batch.days.map((d) => (
                  <span
                    key={d}
                    className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                  >
                    {d}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 pt-1 border-t border-slate-100">
                <span>⏰ {batch.start_time} to {batch.end_time}</span>
                <span>🏛️ {batch.room_number}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeView === 'weekly' && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[340px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2">Batch</th>
                <th className="py-2">Time</th>
                <th className="py-2">Days</th>
                <th className="py-2">Teacher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="py-2.5 font-bold text-slate-800">{b.name}</td>
                  <td className="py-2.5 text-blue-700 font-medium">{b.start_time}</td>
                  <td className="py-2.5 text-[11px]">{b.days.join(', ')}</td>
                  <td className="py-2.5 text-slate-600">{b.teacher_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Batch Modal */}
      {isAddBatchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create New Batch</h3>
              <button
                onClick={() => setIsAddBatchOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {clashWarning && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{clashWarning}</span>
              </div>
            )}

            <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Batch Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="e.g. Class 11th - Morning JEE"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class</label>
                  <select
                    value={batchClass}
                    onChange={(e) => setBatchClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                    <option value="NEET/JEE">NEET/JEE</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Physics & Chemistry"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Teacher</label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subjects.join(', ')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="04:00 PM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="05:30 PM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Active Days</label>
                <div className="flex gap-1.5">
                  {daysList.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition ${
                        selectedDays.includes(d)
                          ? 'bg-blue-700 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room / Hall</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="Room 101"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md text-xs transition"
                >
                  Save Batch Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
