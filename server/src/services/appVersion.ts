import fs from 'fs';
import path from 'path';

const clientIndexPath = path.resolve(__dirname, '../../../client/dist/index.html');

const resolveVersion = (): string => {
  if (process.env.APP_VERSION) return process.env.APP_VERSION;
  if (process.env.RENDER_GIT_COMMIT) return process.env.RENDER_GIT_COMMIT;
  try {
    return String(fs.statSync(clientIndexPath).mtimeMs);
  } catch {
    return 'dev';
  }
};

export const APP_VERSION_HEADER = 'X-App-Version';

export const appVersion = resolveVersion();

export const autoRefreshEnabled = process.env.CLIENT_AUTO_REFRESH !== 'false';
