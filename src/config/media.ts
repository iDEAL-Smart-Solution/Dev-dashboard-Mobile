export const PUBLIC_FILE_BASE_URL = 'https://pub-3c097fbfc9714a69b02f7640ab008bd3.r2.dev';

export const resolveMediaUrl = (path?: string | null): string => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${PUBLIC_FILE_BASE_URL}${normalizedPath}`;
};
