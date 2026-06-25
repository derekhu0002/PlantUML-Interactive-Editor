// Concern G: Electron Desktop Shell — health check polling
// Implements app-concern-g: Electron Desktop Shell
// See src/main/ARCHITECTURE.md for contract

import * as http from 'http';

/**
 * Check if the Python render backend is healthy.
 * Returns true if /health responds with 200 OK.
 */
export function checkBackendHealth(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/health`, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.setTimeout(3000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Poll the backend health endpoint until it responds or timeout.
 */
export async function waitForHealthyBackend(
  port: number,
  maxRetries: number = 10,
  intervalMs: number = 2000
): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    const healthy = await checkBackendHealth(port);
    if (healthy) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return false;
}
