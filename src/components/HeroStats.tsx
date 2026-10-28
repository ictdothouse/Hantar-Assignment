import React from 'react';
import { Globe, FileText, Layers, CheckCircle, Sparkles, Database } from 'lucide-react';
import { AssignmentSubmission } from '../types/assignment';

interface HeroStatsProps {
  submissions: AssignmentSubmission[];
  isGoogleConnected: boolean;
  sheetTitle: string | null;
  onOpenSubmit: () => void;
}

export const HeroStats: React.FC<HeroStatsProps> = ({
  submissions,
  isGoogleConnected,
  sheetTitle,
  onOpenSubmit,
}) => {
  const totalSubmissions = submissions.length;
  const uniqueFaculties = new Set(submissions.map((s) => s.faculty)).size;
  const verifiedCount = submissions.filter((s) => s.status === 'Disahkan').length;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Title & Intro */}
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Penjana Thumbnail Automatik & Integrasi Google Sheets</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Galeri Tugasan Web & Slaid Pelajar
            </h1>
            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
              Hantar pautan laman web dan slaid pembentangan anda. Sistem akan
              menjana visual thumbnail automatik dan menyimpan rekod lengkap
              secara langsung ke dalam Google Sheet pensyarah.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                onClick={onOpenSubmit}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center space-x-2 cursor-pointer"
              >
                <span>Borang Penyerahan Pelajar</span>
              </button>

              <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/60">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>
                  {isGoogleConnected
                    ? `Disimpan ke: ${sheetTitle || 'Google Sheets'}`
                    : 'Mod Storan Aktif (Sedia Disegerak)'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
            <div className="bg-slate-800/60 border border-slate-700/70 backdrop-blur-sm rounded-2xl p-4 flex flex-col justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">
                  {totalSubmissions}
                </p>
                <p className="text-xs text-slate-400 font-medium">Projek Dihantar</p>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/70 backdrop-blur-sm rounded-2xl p-4 flex flex-col justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">
                  {uniqueFaculties}
                </p>
                <p className="text-xs text-slate-400 font-medium">Fakulti Terlibat</p>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-800/60 border border-slate-700/70 backdrop-blur-sm rounded-2xl p-4 flex flex-col justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">
                  {verifiedCount}
                </p>
                <p className="text-xs text-slate-400 font-medium">Tugasan Disahkan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
