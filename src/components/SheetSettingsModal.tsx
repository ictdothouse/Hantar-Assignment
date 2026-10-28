import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  ExternalLink,
  PlusCircle,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Link2,
  Trash2,
  Loader2,
  Check,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface SheetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  sheetInfo: { id: string | null; url: string | null; title: string | null };
  onCreateNewSheet: () => Promise<void>;
  onConnectExistingSheet: (id: string) => Promise<void>;
  onSyncSheet: () => Promise<void>;
  onDisconnectSheet: () => void;
  onLogin: () => void;
  isProcessing: boolean;
}

export const SheetSettingsModal: React.FC<SheetSettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  sheetInfo,
  onCreateNewSheet,
  onConnectExistingSheet,
  onSyncSheet,
  onDisconnectSheet,
  onLogin,
  isProcessing,
}) => {
  const [existingIdInput, setExistingIdInput] = useState('');
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnectExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingIdInput.trim()) return;

    // Check if user pasted full URL or bare ID
    let cleanedId = existingIdInput.trim();
    const urlMatch = cleanedId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch && urlMatch[1]) {
      cleanedId = urlMatch[1];
    }

    await onConnectExistingSheet(cleanedId);
    setActionSuccess('Berjaya menyambung ke Google Sheet sedia ada!');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleCreate = async () => {
    await onCreateNewSheet();
    setActionSuccess('Google Sheet baru berjaya dicipta di Google Drive anda!');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleSync = async () => {
    await onSyncSheet();
    setActionSuccess('Data berjaya disegerakkan daripada Google Sheet!');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-emerald-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
            <h2 className="text-base font-bold">Tetapan Google Sheets</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
            aria-label="Tutup Tetapan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-slate-800">
          {/* Auth requirement notice */}
          {!user ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p>
                  Sila log masuk dengan akaun Google anda terlebih dahulu untuk
                  membolehkan sistem menyimpan dan menyegerakkan data tugasan ke
                  dalam Google Sheets akaun anda.
                </p>
              </div>
              <button
                onClick={onLogin}
                className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Log Masuk dengan Google Sekarang
              </button>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">Akaun Google Aktif:</span>
                <span className="font-bold text-slate-900">{user.email}</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded-full border border-emerald-200 text-[11px]">
                Disahkan
              </span>
            </div>
          )}

          {actionSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* Active Sheet Card */}
          {sheetInfo.id ? (
            <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-sm text-emerald-950">
                    {sheetInfo.title || 'Google Sheet Tugasan'}
                  </span>
                </div>
                {sheetInfo.url && (
                  <a
                    href={sheetInfo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline"
                  >
                    <span>Buka Sheet</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
              </div>

              <div className="text-xs text-slate-600 font-mono bg-white/80 p-2 rounded border border-emerald-100 break-all select-all">
                ID: {sheetInfo.id}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={handleSync}
                  disabled={isProcessing}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>Segerakkan Sekarang</span>
                </button>

                <button
                  onClick={() => setShowConfirmDisconnect(true)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Putuskan sambungan sheet ini"
                  aria-label="Putuskan sambungan sheet"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Confirm Disconnect Dialog */}
              {showConfirmDisconnect && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 space-y-2">
                  <p className="font-semibold">
                    Adakah anda pasti ingin memutuskan sambungan fail Google Sheet ini?
                  </p>
                  <p className="text-[11px] text-red-700">
                    Fail asal dalam Google Drive anda tidak akan dipadamkan, cuma pautan aplikasi ini akan ditamatkan.
                  </p>
                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      onClick={() => setShowConfirmDisconnect(false)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded text-xs"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => {
                        onDisconnectSheet();
                        setShowConfirmDisconnect(false);
                      }}
                      className="px-3 py-1 bg-red-600 text-white font-bold rounded text-xs hover:bg-red-700"
                    >
                      Sahkan Putus
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 text-center space-y-3">
              <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto" />
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  Tiada Google Sheet Dihubungkan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cipta fail baru automatik atau masukkan pautan Google Sheet sedia ada.
                </p>
              </div>

              {user && (
                <button
                  onClick={handleCreate}
                  disabled={isProcessing}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <PlusCircle className="w-4 h-4" />
                  )}
                  <span>Cipta Google Sheet Tugasan Baru Secara Automatik</span>
                </button>
              )}
            </div>
          )}

          {/* Connect Existing Sheet by ID */}
          {user && (
            <form onSubmit={handleConnectExisting} className="pt-3 border-t border-slate-200 space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Atau Sambung Menggunakan Pautan / ID Google Sheet Sedia Ada:
              </label>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="URL Google Sheet atau Spreadsheet ID"
                    value={existingIdInput}
                    onChange={(e) => setExistingIdInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isProcessing || !existingIdInput.trim()}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Sambung
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
