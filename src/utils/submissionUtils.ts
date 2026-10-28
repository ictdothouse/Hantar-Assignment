import { AssignmentSubmission, SortOption } from '../types/assignment';
import { isValidUrl, normalizeUrl } from './thumbnail';

export interface ValidationErrors {
  studentName?: string;
  matricNo?: string;
  faculty?: string;
  webTitle?: string;
  webUrl?: string;
  slideUrl?: string;
}

export function validateSubmission(data: Partial<AssignmentSubmission>): {
  isValid: boolean;
  errors: ValidationErrors;
} {
  const errors: ValidationErrors = {};

  if (!data.studentName || data.studentName.trim().length < 3) {
    errors.studentName = 'Sila masukkan nama penuh pelajar (sekurang-kurangnya 3 aksara)';
  }

  if (!data.matricNo || data.matricNo.trim().length < 4) {
    errors.matricNo = 'Sila masukkan nombor matrik yang sah (contoh: 1210452)';
  }

  if (!data.faculty || data.faculty.trim() === '' || data.faculty === 'Semua Fakulti') {
    errors.faculty = 'Sila pilih fakulti anda';
  }

  if (!data.webTitle || data.webTitle.trim().length < 3) {
    errors.webTitle = 'Sila masukkan tajuk laman web / projek anda';
  }

  if (!data.webUrl || !isValidUrl(data.webUrl)) {
    errors.webUrl = 'Sila masukkan URL laman web yang sah (contoh: https://projek-saya.vercel.app)';
  }

  if (!data.slideUrl || !isValidUrl(data.slideUrl)) {
    errors.slideUrl = 'Sila masukkan URL slaid pembentangan yang sah (contoh: Google Slides / Canva / PDF link)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export const SHEET_HEADERS = [
  'Tarikh Hantar',
  'ID Tugasan',
  'Nama Pelajar',
  'No. Matrik',
  'Fakulti',
  'Tajuk Web',
  'Link Laman Web',
  'Link Slaid',
  'URL Thumbnail',
  'Penerangan',
  'Status',
  'Catatan',
];

/**
 * Formats a submission into an array of cell values for Google Sheets
 */
export function formatSubmissionRow(submission: AssignmentSubmission): (string | number)[] {
  return [
    submission.timestamp,
    submission.id,
    submission.studentName,
    submission.matricNo,
    submission.faculty,
    submission.webTitle,
    normalizeUrl(submission.webUrl),
    normalizeUrl(submission.slideUrl),
    submission.thumbnailUrl,
    submission.description || '',
    submission.status || 'Dalam Semakan',
    submission.notes || '',
  ];
}

/**
 * Parses a Google Sheets row into an AssignmentSubmission object
 */
export function parseSheetRow(row: any[], rowIndex: number): AssignmentSubmission | null {
  if (!row || row.length < 6) return null;
  
  // Skip header row if encountered
  const col0 = String(row[0] || '').toLowerCase();
  if (col0.includes('tarikh') || col0.includes('timestamp') || col0.includes('date')) {
    return null;
  }

  const timestamp = String(row[0] || new Date().toISOString());
  const id = row[1] ? String(row[1]) : `sub-${rowIndex}-${Date.now()}`;
  const studentName = String(row[2] || 'Pelajar');
  const matricNo = String(row[3] || '-');
  const faculty = String(row[4] || 'Umum');
  const webTitle = String(row[5] || 'Projek Web');
  const webUrl = String(row[6] || '');
  const slideUrl = String(row[7] || '');
  const thumbnailUrl = String(row[8] || (webUrl ? `https://s0.wp.com/mshots/v1/${encodeURIComponent(webUrl)}?w=800&h=500` : ''));
  const description = row[9] ? String(row[9]) : '';
  const statusRaw = String(row[10] || 'Dalam Semakan');
  const status: AssignmentSubmission['status'] =
    statusRaw.includes('Disahkan') ? 'Disahkan' :
    statusRaw.includes('Kemaskini') ? 'Perlu Kemaskini' : 'Dalam Semakan';
  const notes = row[11] ? String(row[11]) : '';

  return {
    id,
    timestamp,
    studentName,
    matricNo,
    faculty,
    webTitle,
    webUrl,
    slideUrl,
    thumbnailUrl,
    description,
    status,
    notes,
  };
}

export function filterAndSortSubmissions(
  submissions: AssignmentSubmission[],
  searchQuery: string,
  facultyFilter: string,
  sortBy: SortOption
): AssignmentSubmission[] {
  let list = [...submissions];

  // Faculty filter
  if (facultyFilter && facultyFilter !== 'Semua Fakulti') {
    list = list.filter((item) =>
      item.faculty.toLowerCase().includes(facultyFilter.toLowerCase())
    );
  }

  // Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(
      (item) =>
        item.studentName.toLowerCase().includes(q) ||
        item.matricNo.toLowerCase().includes(q) ||
        item.webTitle.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
    );
  }

  // Sort
  list.sort((a, b) => {
    switch (sortBy) {
      case 'terdahulu':
        return a.id.localeCompare(b.id);
      case 'nama_az':
        return a.studentName.localeCompare(b.studentName);
      case 'tajuk_az':
        return a.webTitle.localeCompare(b.webTitle);
      case 'terkini':
      default:
        // Try timestamp date or fallback id
        return b.id.localeCompare(a.id);
    }
  });

  return list;
}

export function getFacultyBadgeStyle(faculty: string): { bg: string; text: string; border: string } {
  const f = faculty.toLowerCase();
  if (f.includes('fst') || f.includes('sains')) {
    return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
  }
  if (f.includes('fkp') || f.includes('kepimpinan')) {
    return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
  }
  if (f.includes('fsu') || f.includes('syariah')) {
    return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
  }
  if (f.includes('fem') || f.includes('ekonomi')) {
    return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
  }
  if (f.includes('fpqs') || f.includes('quran')) {
    return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' };
  }
  if (f.includes('fpbu') || f.includes('bahasa')) {
    return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
  }
  if (f.includes('fpsk') || f.includes('perubatan')) {
    return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
  }
  return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
}
