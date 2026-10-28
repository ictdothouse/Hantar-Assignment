export interface AssignmentSubmission {
  id: string;
  timestamp: string;
  studentName: string;
  matricNo: string;
  faculty: string;
  webTitle: string;
  webUrl: string;
  slideUrl: string;
  thumbnailUrl: string;
  description?: string;
  status: 'Disahkan' | 'Dalam Semakan' | 'Perlu Kemaskini';
  notes?: string;
}

export type SortOption = 'terkini' | 'terdahulu' | 'nama_az' | 'tajuk_az';

export const FACULTIES = [
  'Semua Fakulti',
  'Fakulti Sains & Teknologi (FST)',
  'Fakulti Kepimpinan & Pengurusan (FKP)',
  'Fakulti Syariah & Undang-Undang (FSU)',
  'Fakulti Ekonomi & Muamalat (FEM)',
  'Fakulti Pengajian Quran & Sunnah (FPQS)',
  'Fakulti Pengajian Bahasa Utama (FPBU)',
  'Fakulti Perubatan & Sains Kesihatan (FPSK)',
  'Fakulti Kejuruteraan & Alam Bina (FKAB)',
  'Fakulti Pergigian (FPg)',
] as const;

export type FacultyOption = typeof FACULTIES[number];
