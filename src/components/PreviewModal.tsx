import React, { useState } from 'react';
import {
  X,
  Globe,
  Presentation,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  GraduationCap,
  Building2,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';
import { AssignmentSubmission } from '../types/assignment';
import { getFacultyBadgeStyle } from '../utils/submissionUtils';

interface PreviewModalProps {
  submission: AssignmentSubmission | null;
  onClose: () => void;
  spreadsheetUrl: string | null;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  submission,
  onClose,
  spreadsheetUrl,
}) => {
  const [activeTab, setActiveTab] = useState<'web' | 'slide' | 'info'>('web');
  const [copiedLink, setCopiedLink] = useState<'web' | 'slide' | null>(null);

  if (!submission) return null;

  const facultyStyle = getFacultyBadgeStyle(submission.faculty);

  const copyToClipboard = (url: string, type: 'web' | 'slide') => {
    navigator.clipboard.writeText(url);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center space-x-3 truncate max-w-[70%]">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${facultyStyle.bg} ${facultyStyle.text} ${facultyStyle.border}`}
            >
              {submission.faculty}
            </span>
            <h2 className="font-bold text-sm sm:text-base text-white truncate">
              {submission.webTitle}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Tutup Pratonton"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switcher & action bar */}
        <div className="bg-slate-100 px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 text-xs">
          <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveTab('web')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'web'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Pratonton Laman Web</span>
            </button>

            <button
              onClick={() => setActiveTab('slide')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'slide'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Pratonton Slaid</span>
            </button>

            <button
              onClick={() => setActiveTab('info')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'info'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>Maklumat Pelajar</span>
            </button>
          </div>

          {/* Quick links & copy buttons */}
          <div className="flex items-center space-x-2">
            <a
              href={submission.webUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg font-medium transition-colors"
            >
              <Globe className="w-3.5 h-3.5 mr-1" />
              <span>Buka Web</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>

            <a
              href={submission.slideUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg font-medium transition-colors"
            >
              <Presentation className="w-3.5 h-3.5 mr-1" />
              <span>Buka Slaid</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>

        {/* Content Viewport */}
        <div className="flex-1 bg-slate-900 relative overflow-hidden flex flex-col">
          {activeTab === 'web' && (
            <div className="w-full h-full flex flex-col">
              {/* Informational banner about iframe restrictions */}
              <div className="bg-slate-800/90 text-slate-300 px-4 py-1.5 text-[11px] flex items-center justify-between border-b border-slate-700">
                <span className="flex items-center space-x-1.5">
                  <Globe className="w-3 h-3 text-blue-400" />
                  <span>Memaparkan: {submission.webUrl}</span>
                </span>
                <span className="text-slate-400">
                  Jika sesetengah laman web menyekat paparan terbenam (iframe), sila klik "Buka Web" di atas.
                </span>
              </div>
              <iframe
                src={submission.webUrl}
                title={submission.webTitle}
                className="w-full flex-1 border-0 bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          )}

          {activeTab === 'slide' && (
            <div className="w-full h-full flex flex-col">
              <div className="bg-slate-800/90 text-slate-300 px-4 py-1.5 text-[11px] flex items-center justify-between border-b border-slate-700">
                <span className="flex items-center space-x-1.5">
                  <Presentation className="w-3 h-3 text-indigo-400" />
                  <span>Memaparkan pautan slaid: {submission.slideUrl}</span>
                </span>
                <a
                  href={submission.slideUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-300 hover:text-white underline"
                >
                  Buka pautan di tetingkap penuh
                </a>
              </div>
              <iframe
                src={submission.slideUrl}
                title={`Slaid ${submission.webTitle}`}
                className="w-full flex-1 border-0 bg-slate-800"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          )}

          {activeTab === 'info' && (
            <div className="w-full h-full bg-slate-50 p-6 overflow-y-auto text-slate-900">
              <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                <div className="border-b border-slate-200 pb-4">
                  <h3 className="text-xl font-bold text-slate-900">
                    {submission.webTitle}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {submission.description || 'Tiada keterangan tambahan diberikan.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-xs text-slate-500 font-medium">Nama Pelajar</label>
                    <p className="font-semibold text-slate-900">{submission.studentName}</p>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-medium">No. Matrik</label>
                    <p className="font-mono font-semibold text-slate-900">{submission.matricNo}</p>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-medium">Fakulti</label>
                    <p className="font-medium text-slate-900">{submission.faculty}</p>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-medium">Tarikh & Masa Hantar</label>
                    <p className="font-medium text-slate-900">{submission.timestamp}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-1">
                      Pautan Laman Web
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        readOnly
                        value={submission.webUrl}
                        className="flex-1 text-xs bg-slate-50 p-2 rounded-lg border border-slate-200 font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(submission.webUrl, 'web')}
                        className="px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium flex items-center space-x-1"
                      >
                        {copiedLink === 'web' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Salin</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-1">
                      Pautan Slaid Pembentangan
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        readOnly
                        value={submission.slideUrl}
                        className="flex-1 text-xs bg-slate-50 p-2 rounded-lg border border-slate-200 font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(submission.slideUrl, 'slide')}
                        className="px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium flex items-center space-x-1"
                      >
                        {copiedLink === 'slide' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Salin</span>
                      </button>
                    </div>
                  </div>
                </div>

                {spreadsheetUrl && (
                  <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 mr-1.5" />
                      Rekod ini disimpan dalam Google Sheet pensyarah.
                    </span>
                    <a
                      href={spreadsheetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:text-emerald-900 font-bold inline-flex items-center"
                    >
                      Buka Google Sheet →
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
