/**
 * Table Tools File System
 *
 * Versioned file envelope for all Table Tools data types.
 * Files are persisted by downloading to / uploading from the local filesystem.
 *
 * Two distinct persistence layers exist:
 *   - localStorage: auto-save current in-progress work (session recovery on refresh)
 *   - This module: intentional save/load of named files to the user's filesystem
 */

export const FILE_VERSION = '1' as const;

export type FileType = 'stat-block' | 'hex-map' | 'mood-board-preset' | 'gm-screen' | 'spell-block';

export const VALID_FILE_TYPES: readonly FileType[] = [
  'stat-block',
  'hex-map',
  'mood-board-preset',
  'gm-screen',
];

export type TableToolsFile<T = unknown> = {
  /** Stable identifier — preserved across saves/edits */
  id: string;
  /** Schema version — used for future migrations */
  version: typeof FILE_VERSION;
  type: FileType;
  /** User-visible name */
  name: string;
  createdAt: string;
  updatedAt: string;
  data: T;
};

// ---------------------------------------------------------------------------
// Pure constructors
// ---------------------------------------------------------------------------

export function createFile<T>(type: FileType, name: string, data: T): TableToolsFile<T> {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    version: FILE_VERSION,
    type,
    name,
    createdAt: now,
    updatedAt: now,
    data,
  };
}

export function updateFile<T>(file: TableToolsFile<T>, data: T): TableToolsFile<T> {
  return { ...file, data, updatedAt: new Date().toISOString() };
}

export function renameFile<T>(file: TableToolsFile<T>, name: string): TableToolsFile<T> {
  return { ...file, name, updatedAt: new Date().toISOString() };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function isValidFileType(value: unknown): value is FileType {
  return typeof value === 'string' && (VALID_FILE_TYPES as string[]).includes(value);
}

export function isTableToolsFile(value: unknown): value is TableToolsFile<unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.version === 'string' &&
    typeof v.type === 'string' &&
    typeof v.name === 'string' &&
    typeof v.createdAt === 'string' &&
    typeof v.updatedAt === 'string' &&
    'data' in v
  );
}

export function parseFileJSON(json: string): TableToolsFile<unknown> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('File is not valid JSON.');
  }
  if (!isTableToolsFile(parsed)) {
    throw new Error('File does not appear to be a Table Tools file.');
  }
  if (!isValidFileType(parsed.type)) {
    throw new Error(`Unknown file type: "${parsed.type}".`);
  }
  return parsed;
}

// ---------------------------------------------------------------------------
// Download / upload (browser-side effects)
// ---------------------------------------------------------------------------

function toFileName(file: TableToolsFile<unknown>): string {
  const slug =
    file.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'untitled';
  return `${slug}.${file.type}.json`;
}

export function downloadFile(file: TableToolsFile<unknown>): void {
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = toFileName(file);
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function uploadFile<T = unknown>(expectedType?: FileType): Promise<TableToolsFile<T>> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        reject(new Error('No file selected.'));
        return;
      }
      try {
        const text = await file.text();
        const parsed = parseFileJSON(text);
        if (expectedType && parsed.type !== expectedType) {
          reject(new Error(`Expected a ${expectedType} file but got "${parsed.type}".`));
          return;
        }
        resolve(parsed as TableToolsFile<T>);
      } catch (err) {
        reject(err);
      }
    };

    input.oncancel = () => reject(new Error('File selection cancelled.'));
    input.click();
  });
}
