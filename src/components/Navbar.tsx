import React from 'react';
import { User } from 'firebase/auth';
import {
  Globe,
  FileSpreadsheet,
  PlusCircle,
  ExternalLink,
  LogOut,
  Settings,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  sheetInfo: { id: string | null; url: string | null; title: string | null };
  onOpenSubmissionModal: () => void;
  onOpenSheetSettings: () => void;
  onSyncSheet: () => void;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  sheetInfo,
  onOpenSubmissionModal,
  onOpenSheetSettings,
  onSyncSheet,
  isSyncing,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  EduShowcase
                </span>
                <span className="text-xs px-2 py-0.5 font-semibold bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                  USIM
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Portal Tugasan Web & Slaid Pelajar
              </p>
            </div>
          </div>

          {/* Center / Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Google Sheets Status Pill */}
            {sheetInfo.id ? (
              <div className="hidden md:flex items-center bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg px-2.5 py-1 text-xs space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium truncate max-w-[130px]">
                  Google Sheet Aktif
                </span>
                {sheetInfo.url && (
                  <a
                    href={sheetInfo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-emerald-700 hover:text-emerald-900 transition-colors"
                    title="Buka Google Sheet di tab baru"
                    aria-label="Buka Google Sheet di tab baru"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center bg-amber-50 text-amber-800 border border-amber-200 rounded-lg px-2.5 py-1 text-xs space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Mod Storan Tempatan</span>
              </div>
            )}

            {/* Sheet Settings button */}
            <button
              onClick={onOpenSheetSettings}
              className="inline-flex items-center px-2.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200/80 cursor-pointer"
              title="Tetapan & Penyegerakan Google Sheet"
              aria-label="Tetapan Google Sheet"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 sm:mr-1.5" />
              <span className="hidden sm:inline">Google Sheet</span>
            </button>

            {/* Primary Submit Button */}
            <button
              onClick={onOpenSubmissionModal}
              className="inline-flex items-center px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all rounded-lg shadow-sm shadow-blue-600/30 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span>Hantar Tugasan</span>
            </button>

            {/* Auth / User Section */}
            {user ? (
              <div className="flex items-center pl-1 sm:pl-2 border-l border-slate-200 space-x-2">
                <div className="flex items-center space-x-2">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Pensyarah'}
                      className="w-8 h-8 rounded-full border border-slate-300"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {(user.displayName || user.email || 'P')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="hidden lg:block text-left text-xs">
                    <p className="font-semibold text-slate-900 leading-tight truncate max-w-[120px]">
                      {user.displayName || 'Pensyarah'}
                    </p>
                    <p className="text-slate-500 truncate max-w-[120px]">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Log Keluar"
                  aria-label="Log Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                disabled={isLoggingIn}
                className="gsi-material-button text-xs !h-9 !py-1 !px-3"
                title="Log Masuk dengan Google untuk mengurus Google Sheet"
              >
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      style={{ display: 'block' }}
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      ></path>
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      ></path>
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      ></path>
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      ></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents font-medium text-xs">
                    {isLoggingIn ? 'Menyambung...' : 'Log Masuk'}
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
