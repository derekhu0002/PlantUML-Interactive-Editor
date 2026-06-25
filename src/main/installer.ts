// Concern G: Electron Desktop Shell — installer configuration
// Implements app-concern-g: Electron Desktop Shell
// See src/main/ARCHITECTURE.md for contract

import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Get the application's user data directory for storing runtime dependencies.
 */
export function getAppDataDir(): string {
  const userDataPath = app.getPath('userData');
  const depsDir = path.join(userDataPath, 'dependencies');
  if (!fs.existsSync(depsDir)) {
    fs.mkdirSync(depsDir, { recursive: true });
  }
  return depsDir;
}

/**
 * Check if this is a first launch by checking if application data exists.
 */
export function isFirstLaunch(): boolean {
  const userDataPath = app.getPath('userData');
  const configPath = path.join(userDataPath, 'config.json');
  return !fs.existsSync(configPath);
}

/**
 * Mark setup as complete by writing a config marker file.
 */
export function markSetupComplete(): void {
  const userDataPath = app.getPath('userData');
  const configPath = path.join(userDataPath, 'config.json');
  const config = {
    setupComplete: true,
    version: app.getVersion(),
    installedAt: new Date().toISOString(),
  };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}
