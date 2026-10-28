import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateSubmission,
  formatSubmissionRow,
  parseSheetRow,
  filterAndSortSubmissions,
  getFacultyBadgeStyle,
} from './submissionUtils';
import { normalizeUrl, isValidUrl, generateThumbnailUrl } from './thumbnail';

test('normalizeUrl prepends https protocol if missing', () => {
  assert.equal(normalizeUrl('example.com'), 'https://example.com');
  assert.equal(normalizeUrl('http://myproject.org'), 'http://myproject.org');
  assert.equal(normalizeUrl('  https://test.my  '), 'https://test.my');
});

test('isValidUrl validates correctly', () => {
  assert.equal(isValidUrl('https://google.com'), true);
  assert.equal(isValidUrl('mysite.com'), true); // after normalise
  assert.equal(isValidUrl(''), false);
  assert.equal(isValidUrl('   '), false);
});

test('generateThumbnailUrl creates valid WordPress mshot URL', () => {
  const thumb = generateThumbnailUrl('https://myproject.dev');
  assert.equal(
    thumb,
    'https://s0.wp.com/mshots/v1/https%3A%2F%2Fmyproject.dev?w=800&h=500'
  );
});

test('validateSubmission catches empty or invalid fields', () => {
  const invalidResult = validateSubmission({});
  assert.equal(invalidResult.isValid, false);
  assert.ok(invalidResult.errors.studentName);
  assert.ok(invalidResult.errors.matricNo);
  assert.ok(invalidResult.errors.faculty);
  assert.ok(invalidResult.errors.webTitle);
  assert.ok(invalidResult.errors.webUrl);
  assert.ok(invalidResult.errors.slideUrl);
});

test('validateSubmission passes for complete valid submission', () => {
  const validResult = validateSubmission({
    studentName: 'Ahmad Faiz Bin Aziz',
    matricNo: '1210452',
    faculty: 'Fakulti Sains & Teknologi (FST)',
    webTitle: 'Sistem Pengurusan e-Masjid',
    webUrl: 'https://emasjid-usim.vercel.app',
    slideUrl: 'https://docs.google.com/presentation/d/123/edit',
  });
  assert.equal(validResult.isValid, true);
  assert.deepEqual(validResult.errors, {});
});

test('formatSubmissionRow serializes submission correctly for Google Sheets', () => {
  const row = formatSubmissionRow({
    id: 'sub-001',
    timestamp: '2026-10-28 10:00:00',
    studentName: 'Nur Aisyah',
    matricNo: '1220999',
    faculty: 'Fakulti Ekonomi & Muamalat (FEM)',
    webTitle: 'FinTech Halal Dashboard',
    webUrl: 'fintech-halal.com',
    slideUrl: 'https://canva.com/design/123',
    thumbnailUrl: 'https://s0.wp.com/mshots/v1/https%3A%2F%2Ffintech-halal.com?w=800&h=500',
    description: 'Aplikasi kewangan patuh syariah',
    status: 'Disahkan',
    notes: 'Markah: 95/100',
  });

  assert.equal(row[0], '2026-10-28 10:00:00');
  assert.equal(row[1], 'sub-001');
  assert.equal(row[2], 'Nur Aisyah');
  assert.equal(row[3], '1220999');
  assert.equal(row[4], 'Fakulti Ekonomi & Muamalat (FEM)');
  assert.equal(row[5], 'FinTech Halal Dashboard');
  assert.equal(row[6], 'https://fintech-halal.com');
  assert.equal(row[7], 'https://canva.com/design/123');
  assert.equal(row[10], 'Disahkan');
});

test('parseSheetRow parses a row correctly and skips headers', () => {
  const headerRow = ['Tarikh Hantar', 'ID', 'Nama', 'Matrik', 'Fakulti', 'Tajuk', 'Web', 'Slide'];
  assert.equal(parseSheetRow(headerRow, 0), null);

  const dataRow = [
    '2026-10-28 11:30',
    'sub-002',
    'Mohd Danial',
    '1200111',
    'Fakulti Sains & Teknologi (FST)',
    'AI Plant Disease Detector',
    'https://plant-ai.web.app',
    'https://slides.google.com/123',
    'https://s0.wp.com/mshots/v1/...',
    'Model diagnosis penyakit daun',
    'Disahkan',
    'Bagus sekali',
  ];

  const parsed = parseSheetRow(dataRow, 1);
  assert.ok(parsed);
  assert.equal(parsed?.studentName, 'Mohd Danial');
  assert.equal(parsed?.matricNo, '1200111');
  assert.equal(parsed?.status, 'Disahkan');
});

test('filterAndSortSubmissions filters by search query and faculty', () => {
  const items = [
    {
      id: '1',
      timestamp: '2026-10-28',
      studentName: 'Ali bin Abu',
      matricNo: '111',
      faculty: 'FST',
      webTitle: 'Portal AI',
      webUrl: 'https://a.com',
      slideUrl: 'https://s.com',
      thumbnailUrl: '',
      status: 'Disahkan' as const,
    },
    {
      id: '2',
      timestamp: '2026-10-28',
      studentName: 'Siti binti Omar',
      matricNo: '222',
      faculty: 'FKP',
      webTitle: 'Portal Media Dakwah',
      webUrl: 'https://b.com',
      slideUrl: 'https://s.com',
      thumbnailUrl: '',
      status: 'Disahkan' as const,
    },
  ];

  const searched = filterAndSortSubmissions(items, 'Omar', 'Semua Fakulti', 'terkini');
  assert.equal(searched.length, 1);
  assert.equal(searched[0].studentName, 'Siti binti Omar');

  const facultyFiltered = filterAndSortSubmissions(items, '', 'FST', 'terkini');
  assert.equal(facultyFiltered.length, 1);
  assert.equal(facultyFiltered[0].matricNo, '111');
});

test('getFacultyBadgeStyle returns styling with contrast', () => {
  const fst = getFacultyBadgeStyle('Fakulti Sains & Teknologi');
  assert.ok(fst.bg.includes('emerald'));
  const fallback = getFacultyBadgeStyle('Fakulti Lain');
  assert.ok(fallback.bg.includes('slate'));
});
