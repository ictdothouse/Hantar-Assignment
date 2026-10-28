/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  PlusCircle,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  Presentation,
  Globe,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
} from 'lucide-react';

import { AssignmentSubmission, FACULTIES, SortOption } from './types/assignment';
import { INITIAL_SUBMISSIONS } from './data/seedData';
import { filterAndSortSubmissions, getFacultyBadgeStyle } from './utils/submissionUtils';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './services/authService';
import {
  getStoredSpreadsheetInfo,
  saveStoredSpreadsheetInfo,
  clearStoredSpreadsheetInfo,
  createAssignmentSpreadsheet,
  appendSubmissionToSheet,
  fetchSubmissionsFromSheet,
  getSpreadsheetDetails,
} from './services/sheetsService';

import { Navbar } from './components/Navbar';
import { HeroStats } from './components/HeroStats';
import { ProjectCard } from './components/ProjectCard';
import { SubmissionModal } from './components/SubmissionModal';
import { PreviewModal } from './components/PreviewModal';
import { SheetSettingsModal } from './components/SheetSettingsModal';

const LOCAL_STORAGE_SUBMISSIONS_KEY = 'usim_assignment_submissions_list';

export default function App() {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SUBMISSIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved submissions', e);
    }
    return INITIAL_SUBMISSIONS;
  });

  const [sheetInfo, setSheetInfo] = useState(getStoredSpreadsheetInfo());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('Semua Fakulti');
  const [sortBy, setSortBy] = useState<SortOption>('terkini');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
  const [isSheetSettingsOpen, setIsSheetSettingsOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<AssignmentSubmission | null>(null);

  // Loading flags
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Save to local storage whenever submissions update
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_SUBMISSIONS_KEY, JSON.stringify(submissions));
  }, [submissions]);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        // If we have an active sheet and access token, automatically pull latest rows
        if (token && sheetInfo.id) {
          syncFromSheet(sheetInfo.id, token);
        }
      },
      () => {
        setUser(null);
      }
    );

    return () => unsubscribe();
  }, []);

  const showNotification = (
    type: 'success' | 'error' | 'info',
    message: string,
    duration = 4000
  ) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, duration);
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        showNotification(
          'success',
          `Log masuk berjaya sebagai ${res.user.displayName || res.user.email}!`
        );

        // Check if sheet exists or auto-create if not yet set up
        if (!sheetInfo.id) {
          try {
            const newSheet = await createAssignmentSpreadsheet(
              res.accessToken,
              'Tugasan Pelajar - Senarai Web & Slide'
            );
            setSheetInfo({
              id: newSheet.spreadsheetId,
              url: newSheet.spreadsheetUrl,
              title: 'Tugasan Pelajar - Senarai Web & Slide',
            });
            showNotification(
              'success',
              'Google Sheet baru telah dicipta secara automatik di Google Drive anda!'
            );
          } catch (createErr: any) {
            console.error('Error auto-creating sheet:', createErr);
          }
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      showNotification(
        'error',
        err.message || 'Log masuk dibatalkan atau tidak berjaya.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    showNotification('info', 'Anda telah log keluar.');
  };

  // Sync rows from Google Sheet
  const syncFromSheet = async (
    targetSheetId = sheetInfo.id,
    tokenOverride?: string
  ) => {
    if (!targetSheetId) return;
    setIsSyncing(true);

    try {
      const token = tokenOverride || (await getAccessToken());
      if (!token) {
        // Prompt login if token is expired
        showNotification(
          'info',
          'Sila log masuk untuk menyegerakkan data dari Google Sheet anda.'
        );
        setIsSheetSettingsOpen(true);
        return;
      }

      const rows = await fetchSubmissionsFromSheet(token, targetSheetId);
      if (rows && rows.length > 0) {
        setSubmissions(rows);
        showNotification(
          'success',
          `Berjaya menyegerakkan ${rows.length} rekod tugasan dari Google Sheet.`
        );
      } else {
        showNotification(
          'info',
          'Google Sheet bersambung, tiada rekod penyerahan baru ditemui.'
        );
      }
    } catch (err: any) {
      console.error('Sync failed:', err);
      showNotification('error', `Gagal menyegerak: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Create new sheet manually from settings
  const handleCreateNewSheet = async () => {
    const token = await getAccessToken();
    if (!token) {
      await handleLogin();
      return;
    }

    setIsSaving(true);
    try {
      const result = await createAssignmentSpreadsheet(token);
      setSheetInfo({
        id: result.spreadsheetId,
        url: result.spreadsheetUrl,
        title: 'Tugasan Pelajar - Senarai Web & Slide',
      });
      showNotification('success', 'Google Sheet baru berjaya dicipta!');
    } catch (err: any) {
      showNotification('error', `Ralat: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Connect existing sheet
  const handleConnectExistingSheet = async (customId: string) => {
    const token = await getAccessToken();
    if (!token) {
      await handleLogin();
      return;
    }

    setIsSaving(true);
    try {
      const details = await getSpreadsheetDetails(token, customId);
      const url = `https://docs.google.com/spreadsheets/d/${customId}/edit`;
      saveStoredSpreadsheetInfo(customId, url, details.title);
      setSheetInfo({ id: customId, url, title: details.title });

      // Automatically sync
      await syncFromSheet(customId, token);
    } catch (err: any) {
      showNotification('error', `Gagal menghubungkan Google Sheet: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnectSheet = () => {
    clearStoredSpreadsheetInfo();
    setSheetInfo({ id: null, url: null, title: null });
    showNotification('info', 'Sambungan Google Sheet telah ditamatkan.');
  };

  // Submit handler (called from modal)
  const handleSubmitSubmission = async (newSubmission: AssignmentSubmission) => {
    setIsSaving(true);
    try {
      // 1. Always update local state immediately so student sees their card in the listing
      setSubmissions((prev) => [newSubmission, ...prev]);

      // 2. If Google Sheet is connected and user has token, append row
      let token = await getAccessToken();

      if (token && sheetInfo.id) {
        await appendSubmissionToSheet(token, sheetInfo.id, newSubmission);
        showNotification(
          'success',
          'Tugasan anda berjaya dihantar & disimpan terus ke Google Sheet pensyarah!'
        );
      } else {
        showNotification(
          'success',
          'Tugasan anda berjaya disimpan dalam galeri!'
        );
      }

      setIsSubmissionOpen(false);
    } catch (err: any) {
      console.error('Submission save error:', err);
      showNotification(
        'error',
        `Tugasan dimasukkan ke galeri, tetapi Google Sheet ralat: ${err.message}`
      );
      setIsSubmissionOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Export submissions to CSV for user backup
  const handleExportCSV = () => {
    const headers = ['Tarikh Hantar', 'Nama Pelajar', 'No Matrik', 'Fakulti', 'Tajuk Web', 'Link Web', 'Link Slide'];
    const rows = submissions.map((s) => [
      `"${s.timestamp}"`,
      `"${s.studentName}"`,
      `"${s.matricNo}"`,
      `"${s.faculty}"`,
      `"${s.webTitle}"`,
      `"${s.webUrl}"`,
      `"${s.slideUrl}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tugasan_Pelajar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered and sorted submissions
  const filteredSubmissions = filterAndSortSubmissions(
    submissions,
    searchQuery,
    selectedFaculty,
    sortBy
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2.5 text-xs sm:text-sm font-semibold border ${
              notification.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : notification.type === 'error'
                ? 'bg-red-900 text-red-100 border-red-700'
                : 'bg-slate-900 text-slate-100 border-slate-700'
            }`}
          >
            {notification.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            )}
            {notification.type === 'error' && (
              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            {notification.type === 'info' && (
              <AlertCircle className="w-4 h-4 text-sky-400 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        sheetInfo={sheetInfo}
        onOpenSubmissionModal={() => setIsSubmissionOpen(true)}
        onOpenSheetSettings={() => setIsSheetSettingsOpen(true)}
        onSyncSheet={() => syncFromSheet()}
        isSyncing={isSyncing}
      />

      {/* Hero & Statistics */}
      <HeroStats
        submissions={submissions}
        isGoogleConnected={!!sheetInfo.id}
        sheetTitle={sheetInfo.title}
        onOpenSubmit={() => setIsSubmissionOpen(true)}
      />

      {/* Main Frontpage Listing Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Controls Toolbar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs mb-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama pelajar, no matrik, tajuk web..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  Padam
                </button>
              )}
            </div>

            {/* Right Controls: Sort, View mode, Export */}
            <div className="flex flex-wrap items-center justify-between w-full md:w-auto gap-2.5">
              {/* Sort selector */}
              <div className="flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium hidden sm:inline">Susun:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="terkini">Terkini Dihantar</option>
                  <option value="terdahulu">Terdahulu</option>
                  <option value="nama_az">Nama Pelajar (A-Z)</option>
                  <option value="tajuk_az">Tajuk Projek (A-Z)</option>
                </select>
              </div>

              {/* View Switcher: Grid vs Table */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-blue-600 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Paparan Kad Galeri"
                  aria-label="Paparan Kad Galeri"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white text-blue-600 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Paparan Jadual Kompak"
                  aria-label="Paparan Jadual Kompak"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Export CSV button */}
              <button
                onClick={handleExportCSV}
                className="p-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors flex items-center space-x-1 cursor-pointer"
                title="Muat Turun CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CSV</span>
              </button>
            </div>
          </div>

          {/* Faculty filter chips scroll */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
            <span className="text-slate-400 font-semibold mr-1 flex-shrink-0">
              Fakulti:
            </span>
            {FACULTIES.map((fac) => {
              const isSelected = selectedFaculty === fac;
              const count =
                fac === 'Semua Fakulti'
                  ? submissions.length
                  : submissions.filter((s) =>
                      s.faculty.toLowerCase().includes(fac.toLowerCase())
                    ).length;

              return (
                <button
                  key={fac}
                  onClick={() => setSelectedFaculty(fac)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all cursor-pointer flex items-center space-x-1.5 flex-shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{fac}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-blue-800 text-blue-100'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Headline */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Senarai Laman Web Pelajar ({filteredSubmissions.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik pada mana-mana kad untuk pratonton langsung atau melawat pautan web & slaid.
            </p>
          </div>

          {sheetInfo.id && (
            <button
              onClick={() => syncFromSheet()}
              disabled={isSyncing}
              className="inline-flex items-center text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyegerak...' : 'Segerak Google Sheet'}</span>
            </button>
          )}
        </div>

        {/* Frontpage Grid / Table Output */}
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
            <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              Tiada Tugasan Dijumpai
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
              Tiada penyerahan pelajar yang sepadan dengan carian "{searchQuery}" atau fakulti yang dipilih.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFaculty('Semua Fakulti');
              }}
              className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Reset Tapisan
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubmissions.map((submission) => (
              <ProjectCard
                key={submission.id}
                submission={submission}
                onPreview={(item) => setPreviewItem(item)}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                  <tr>
                    <th className="py-3 px-4">Pratonton</th>
                    <th className="py-3 px-4">Tajuk Web</th>
                    <th className="py-3 px-4">Nama Pelajar</th>
                    <th className="py-3 px-4">No. Matrik</th>
                    <th className="py-3 px-4">Fakulti</th>
                    <th className="py-3 px-4">Pautan Web</th>
                    <th className="py-3 px-4">Pautan Slaid</th>
                    <th className="py-3 px-4 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubmissions.map((sub) => {
                    const fStyle = getFacultyBadgeStyle(sub.faculty);
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-4">
                          <img
                            src={sub.thumbnailUrl}
                            alt=""
                            className="w-14 h-9 object-cover rounded border border-slate-200 bg-slate-100"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-900 max-w-[200px] truncate">
                          {sub.webTitle}
                        </td>
                        <td className="py-2.5 px-4 text-slate-700 font-medium">
                          {sub.studentName}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-500">
                          {sub.matricNo}
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${fStyle.bg} ${fStyle.text} ${fStyle.border}`}
                          >
                            {sub.faculty}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <a
                            href={sub.webUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                          >
                            <span>Laman</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </td>
                        <td className="py-2.5 px-4">
                          <a
                            href={sub.slideUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center"
                          >
                            <span>Slaid</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() => setPreviewItem(sub)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded text-xs transition-colors cursor-pointer"
                          >
                            Pratonton
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © {new Date().getFullYear()} Portal Tugasan Pelajar & Galeri Web. Direka untuk pengurusan tugasan universiti.
          </p>
          <div className="flex items-center space-x-4">
            <span className="text-slate-400">Integrasi Rasmi Google Sheets</span>
            {sheetInfo.url && (
              <a
                href={sheetInfo.url}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 hover:text-emerald-900 font-medium inline-flex items-center"
              >
                <span>Google Sheet Aktif</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            )}
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SubmissionModal
        isOpen={isSubmissionOpen}
        onClose={() => setIsSubmissionOpen(false)}
        onSubmit={handleSubmitSubmission}
        isSaving={isSaving}
      />

      <PreviewModal
        submission={previewItem}
        onClose={() => setPreviewItem(null)}
        spreadsheetUrl={sheetInfo.url}
      />

      <SheetSettingsModal
        isOpen={isSheetSettingsOpen}
        onClose={() => setIsSheetSettingsOpen(false)}
        user={user}
        sheetInfo={sheetInfo}
        onCreateNewSheet={handleCreateNewSheet}
        onConnectExistingSheet={handleConnectExistingSheet}
        onSyncSheet={() => syncFromSheet()}
        onDisconnectSheet={handleDisconnectSheet}
        onLogin={handleLogin}
        isProcessing={isSaving || isSyncing}
      />
    </div>
  );
}
