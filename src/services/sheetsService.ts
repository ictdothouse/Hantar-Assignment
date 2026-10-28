import { AssignmentSubmission } from '../types/assignment';
import { SHEET_HEADERS, formatSubmissionRow, parseSheetRow } from '../utils/submissionUtils';

const STORAGE_KEY_SPREADSHEET_ID = 'usim_assignment_sheet_id';
const STORAGE_KEY_SPREADSHEET_URL = 'usim_assignment_sheet_url';
const STORAGE_KEY_SPREADSHEET_TITLE = 'usim_assignment_sheet_title';

export function getStoredSpreadsheetInfo(): { id: string | null; url: string | null; title: string | null } {
  return {
    id: localStorage.getItem(STORAGE_KEY_SPREADSHEET_ID),
    url: localStorage.getItem(STORAGE_KEY_SPREADSHEET_URL),
    title: localStorage.getItem(STORAGE_KEY_SPREADSHEET_TITLE) || 'Tugasan Pelajar - Senarai Web & Slide',
  };
}

export function saveStoredSpreadsheetInfo(id: string, url: string, title: string) {
  localStorage.setItem(STORAGE_KEY_SPREADSHEET_ID, id);
  localStorage.setItem(STORAGE_KEY_SPREADSHEET_URL, url);
  localStorage.setItem(STORAGE_KEY_SPREADSHEET_TITLE, title);
}

export function clearStoredSpreadsheetInfo() {
  localStorage.removeItem(STORAGE_KEY_SPREADSHEET_ID);
  localStorage.removeItem(STORAGE_KEY_SPREADSHEET_URL);
  localStorage.removeItem(STORAGE_KEY_SPREADSHEET_TITLE);
}

/**
 * Creates a brand new Google Spreadsheet formatted for student submissions
 */
export async function createAssignmentSpreadsheet(
  accessToken: string,
  customTitle = 'Tugasan Pelajar - Senarai Web & Slide'
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; sheetName: string }> {
  const sheetName = 'Senarai Tugasan';

  const payload = {
    properties: {
      title: customTitle,
    },
    sheets: [
      {
        properties: {
          title: sheetName,
          gridProperties: {
            frozenRowCount: 1,
          },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: SHEET_HEADERS.map((header) => ({
                  userEnteredValue: { stringValue: header },
                  userEnteredFormat: {
                    backgroundColor: { red: 0.08, green: 0.35, blue: 0.65 },
                    textFormat: {
                      bold: true,
                      foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
                      fontSize: 11,
                    },
                    horizontalAlignment: 'CENTER',
                  },
                })),
              },
            ],
          },
        ],
      },
    ],
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gagal mencipta Google Sheet (${response.status})`
    );
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  saveStoredSpreadsheetInfo(spreadsheetId, spreadsheetUrl, customTitle);

  return {
    spreadsheetId,
    spreadsheetUrl,
    sheetName,
  };
}

/**
 * Gets sheet metadata to determine tab name
 */
export async function getSpreadsheetDetails(
  accessToken: string,
  spreadsheetId: string
): Promise<{ title: string; firstSheetName: string }> {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties.title`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gagal mengakses Google Sheet (${response.status})`
    );
  }

  const data = await response.json();
  const title = data.properties?.title || 'Google Sheet';
  const firstSheetName = data.sheets?.[0]?.properties?.title || 'Sheet1';

  return { title, firstSheetName };
}

/**
 * Appends a new student submission row to the Google Sheet
 */
export async function appendSubmissionToSheet(
  accessToken: string,
  spreadsheetId: string,
  submission: AssignmentSubmission,
  sheetName = 'Senarai Tugasan'
): Promise<void> {
  const rowValues = formatSubmissionRow(submission);

  const range = `${sheetName}!A:L`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    range
  )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [rowValues],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gagal menyimpan data ke Google Sheet (${response.status})`
    );
  }
}

/**
 * Reads all submissions from Google Sheet
 */
export async function fetchSubmissionsFromSheet(
  accessToken: string,
  spreadsheetId: string,
  sheetName = 'Senarai Tugasan'
): Promise<AssignmentSubmission[]> {
  const range = `${sheetName}!A2:L`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    range
  )}?valueRenderOption=FORMATTED_VALUE`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gagal membaca rekod daripada Google Sheet (${response.status})`
    );
  }

  const data = await response.json();
  const rows: any[][] = data.values || [];

  const submissions: AssignmentSubmission[] = [];
  rows.forEach((row, idx) => {
    const parsed = parseSheetRow(row, idx + 2);
    if (parsed) {
      submissions.push(parsed);
    }
  });

  return submissions;
}
