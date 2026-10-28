import React, { useState, useEffect } from 'react';
import {
  X,
  Globe,
  Presentation,
  User,
  GraduationCap,
  Building2,
  FileText,
  Sparkles,
  ExternalLink,
  Check,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { AssignmentSubmission, FACULTIES } from '../types/assignment';
import { generateThumbnailUrl, isValidUrl, normalizeUrl } from '../utils/thumbnail';
import { validateSubmission, ValidationErrors } from '../utils/submissionUtils';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (submission: AssignmentSubmission) => Promise<void>;
  isSaving: boolean;
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSaving,
}) => {
  const [studentName, setStudentName] = useState('');
  const [matricNo, setMatricNo] = useState('');
  const [faculty, setFaculty] = useState<string>('Fakulti Sains & Teknologi (FST)');
  const [customFaculty, setCustomFaculty] = useState('');
  const [isOtherFaculty, setIsOtherFaculty] = useState(false);
  const [webTitle, setWebTitle] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [slideUrl, setSlideUrl] = useState('');
  const [description, setDescription] = useState('');

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);

  // Debounced auto-generation of thumbnail when webUrl changes
  useEffect(() => {
    if (!webUrl.trim()) {
      setThumbnailPreview('');
      setThumbnailLoaded(false);
      return;
    }

    if (isValidUrl(webUrl)) {
      setIsGeneratingThumbnail(true);
      setThumbnailLoaded(false);
      const cleanUrl = normalizeUrl(webUrl);
      const generated = generateThumbnailUrl(cleanUrl);

      const timer = setTimeout(() => {
        setThumbnailPreview(generated);
        setIsGeneratingThumbnail(false);
      }, 400);

      return () => clearTimeout(timer);
    } else {
      setThumbnailPreview('');
      setIsGeneratingThumbnail(false);
    }
  }, [webUrl]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedFaculty = isOtherFaculty ? customFaculty.trim() : faculty;

    const draft = {
      studentName: studentName.trim(),
      matricNo: matricNo.trim(),
      faculty: selectedFaculty,
      webTitle: webTitle.trim(),
      webUrl: normalizeUrl(webUrl),
      slideUrl: normalizeUrl(slideUrl),
      description: description.trim(),
    };

    const validation = validateSubmission(draft);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const cleanWeb = normalizeUrl(webUrl);
    const thumbUrl = generateThumbnailUrl(cleanWeb);

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newSubmission: AssignmentSubmission = {
      id: `sub-${Date.now().toString().slice(-6)}`,
      timestamp: formattedDate,
      studentName: draft.studentName,
      matricNo: draft.matricNo,
      faculty: draft.faculty,
      webTitle: draft.webTitle,
      webUrl: draft.webUrl,
      slideUrl: draft.slideUrl,
      thumbnailUrl: thumbUrl,
      description: draft.description,
      status: 'Dalam Semakan',
      notes: '',
    };

    await onSubmit(newSubmission);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-bold">
                Borang Penyerahan Tugasan Web & Slaid
              </h2>
              <p className="text-xs text-blue-100">
                Data akan disimpan ke Google Sheet dan thumbnail dijana automatik
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup Borang"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Row 1: Nama & No Matrik */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Penuh Pelajar <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Ali bin Abu"
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                    if (errors.studentName) setErrors({ ...errors, studentName: undefined });
                  }}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border ${
                    errors.studentName ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              {errors.studentName && (
                <p className="text-xs text-red-600 mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.studentName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                No. Matrik <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: 1220455"
                  value={matricNo}
                  onChange={(e) => {
                    setMatricNo(e.target.value);
                    if (errors.matricNo) setErrors({ ...errors, matricNo: undefined });
                  }}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border ${
                    errors.matricNo ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono`}
                />
              </div>
              {errors.matricNo && (
                <p className="text-xs text-red-600 mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.matricNo}
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Fakulti */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fakulti <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <select
                value={isOtherFaculty ? 'Lain-lain' : faculty}
                onChange={(e) => {
                  if (e.target.value === 'Lain-lain') {
                    setIsOtherFaculty(true);
                  } else {
                    setIsOtherFaculty(false);
                    setFaculty(e.target.value);
                  }
                  if (errors.faculty) setErrors({ ...errors, faculty: undefined });
                }}
                className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {FACULTIES.filter((f) => f !== 'Semua Fakulti').map((fac) => (
                  <option key={fac} value={fac}>
                    {fac}
                  </option>
                ))}
                <option value="Lain-lain">Lain-lain (Nyatakan)...</option>
              </select>
            </div>
            {isOtherFaculty && (
              <input
                type="text"
                placeholder="Nyatakan nama fakulti anda"
                value={customFaculty}
                onChange={(e) => setCustomFaculty(e.target.value)}
                className="mt-2 w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            {errors.faculty && (
              <p className="text-xs text-red-600 mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.faculty}
              </p>
            )}
          </div>

          {/* Row 3: Tajuk Web */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tajuk Laman Web / Projek <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="Contoh: Portal E-Wakaf Komuniti Negeri Sembilan"
                value={webTitle}
                onChange={(e) => {
                  setWebTitle(e.target.value);
                  if (errors.webTitle) setErrors({ ...errors, webTitle: undefined });
                }}
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border ${
                  errors.webTitle ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            {errors.webTitle && (
              <p className="text-xs text-red-600 mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.webTitle}
              </p>
            )}
          </div>

          {/* Row 4: Link Web & Auto Thumbnail Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Link Laman Web (URL Projek) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-blue-600 absolute left-3 top-3 pointer-events-none" />
              <input
                type="url"
                required
                placeholder="https://projek-anda.vercel.app atau github.io"
                value={webUrl}
                onChange={(e) => {
                  setWebUrl(e.target.value);
                  if (errors.webUrl) setErrors({ ...errors, webUrl: undefined });
                }}
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border ${
                  errors.webUrl ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono`}
              />
            </div>
            {errors.webUrl && (
              <p className="text-xs text-red-600 mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.webUrl}
              </p>
            )}

            {/* Live Generated Thumbnail Box */}
            <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Jana Thumbnail Automatik (Mshots Engine)</span>
                </div>
                {isValidUrl(webUrl) && (
                  <span className="text-[11px] text-emerald-600 font-medium flex items-center">
                    <Check className="w-3 h-3 mr-0.5" /> URL Sah Dikesan
                  </span>
                )}
              </div>

              {isGeneratingThumbnail ? (
                <div className="h-32 rounded-lg bg-white border border-dashed border-slate-300 flex items-center justify-center space-x-2 text-slate-500 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Sedang menjana visual thumbnail dari laman web...</span>
                </div>
              ) : thumbnailPreview ? (
                <div className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white aspect-video max-h-40">
                  <img
                    src={thumbnailPreview}
                    alt="Pratonton Thumbnail Web"
                    className="w-full h-full object-cover"
                    onLoad={() => setThumbnailLoaded(true)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-90 p-2 flex items-end justify-between">
                    <span className="text-[11px] font-medium text-white truncate max-w-[80%]">
                      {normalizeUrl(webUrl)}
                    </span>
                    <a
                      href={normalizeUrl(webUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 bg-white/20 hover:bg-white/40 rounded text-white"
                      title="Uji buka link"
                      aria-label="Uji buka pautan web"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="h-24 rounded-lg bg-white border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <ImageIcon className="w-6 h-6 mb-1 text-slate-300" />
                  <span>Masukkan URL laman web di atas untuk pratonton thumbnail</span>
                </div>
              )}
            </div>
          </div>

          {/* Row 5: Link Slide */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Link Slaid Pembentangan <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Presentation className="w-4 h-4 text-indigo-600 absolute left-3 top-3 pointer-events-none" />
              <input
                type="url"
                required
                placeholder="https://docs.google.com/presentation/... atau canva.com"
                value={slideUrl}
                onChange={(e) => {
                  setSlideUrl(e.target.value);
                  if (errors.slideUrl) setErrors({ ...errors, slideUrl: undefined });
                }}
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border ${
                  errors.slideUrl ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono`}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Pastikan akses pautan slaid diset kepada <em>"Anyone with the link can view"</em>.
            </p>
            {errors.slideUrl && (
              <p className="text-xs text-red-600 mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.slideUrl}
              </p>
            )}
          </div>

          {/* Row 6: Penerangan Projek (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ringkasan Projek / Nota Tambahan (Pilihan)
            </label>
            <textarea
              rows={2}
              placeholder="Terangkan fungsi utama sistem atau matlamat projek anda secara ringkas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all rounded-xl shadow-md shadow-blue-500/20 flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan ke Google Sheet...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Hantar Tugasan Sekarang</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
