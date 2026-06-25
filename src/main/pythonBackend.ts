// Concern G: Electron Desktop Shell — Python backend subprocess manager
// Implements app-concern-g: Electron Desktop Shell
// See src/main/ARCHITECTURE.md for contract

import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as http from 'http';

let backendProcess: ChildProcess | null = null;
let backendPort: number = 5001;
let isRunning: boolean = false;

/**
 * Start the Python render backend subprocess.
 * In development: runs `python src/python-backend/app.py`
 * In production: runs the PyInstaller-packaged exe
 */
export async function startPythonBackend(): Promise<number> {
  if (isRunning) {
    return backendPort;
  }

  return new Promise((resolve, reject) => {
    let command: string;
    let args: string[];

    if (process.env.NODE_ENV === 'production' || process.env.VITE_DEV_SERVER_URL === undefined) {
      // Production: use PyInstaller exe from extraResources
      const resourcesPath = process.resourcesPath || path.join(__dirname, '../../');
      const exePath = path.join(resourcesPath, 'python-backend', 'plantuml-backend.exe');
      command = exePath;
      args = [];
    } else {
      // Development: use python interpreter
      command = 'python';
      args = [path.join(__dirname, '../../src/python-backend/app.py')];
    }

    backendProcess = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        FLASK_PORT: String(backendPort),
        FLASK_DEBUG: '0',
      },
    });

    backendProcess.stdout?.on('data', (data: Buffer) => {
      console.log(`[Python Backend] ${data.toString().trim()}`);
    });

    backendProcess.stderr?.on('data', (data: Buffer) => {
      console.error(`[Python Backend Error] ${data.toString().trim()}`);
    });

    backendProcess.on('error', (err) => {
      console.error('[Python Backend] Failed to start:', err.message);
      isRunning = false;
      reject(err);
    });

    backendProcess.on('exit', (code) => {
      console.log(`[Python Backend] Process exited with code ${code}`);
      isRunning = false;
      backendProcess = null;
    });

    // Wait for backend to become healthy
    waitForHealth(backendPort, 30, 2000)
      .then(() => {
        isRunning = true;
        resolve(backendPort);
      })
      .catch((err) => {
        console.error('[Python Backend] Health check failed:', err.message);
        stopPythonBackend();
        reject(err);
      });
  });
}

/**
 * Stop the Python backend subprocess gracefully.
 * Sends SIGTERM first, then SIGKILL after 3s timeout.
 */
export async function stopPythonBackend(): Promise<void> {
  if (!backendProcess) {
    isRunning = false;
    return;
  }

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      // Force kill if not terminated
      if (backendProcess) {
        backendProcess.kill('SIGKILL');
      }
      isRunning = false;
      backendProcess = null;
      resolve();
    }, 3000);

    backendProcess!.on('exit', () => {
      clearTimeout(timeout);
      isRunning = false;
      backendProcess = null;
      resolve();
    });

    // Send SIGTERM on Windows, use taskkill
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(backendProcess!.pid), '/f', '/t']);
    } else {
      backendProcess!.kill('SIGTERM');
    }
  });
}

/**
 * Check if the Python backend is currently running.
 */
export function isBackendRunning(): boolean {
  return isRunning;
}

/**
 * Get the current backend port.
 */
export function getBackendPort(): number {
  return backendPort;
}

/**
 * Poll the /health endpoint until the backend responds or timeout.
 */
function waitForHealth(port: number, maxRetries: number, intervalMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    let retries = 0;

    const check = () => {
      const req = http.get(`http://localhost:${port}/health`, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else if (++retries < maxRetries) {
          setTimeout(check, intervalMs);
        } else {
          reject(new Error(`Health check failed after ${maxRetries} retries`));
        }
      });

      req.on('error', () => {
        if (++retries < maxRetries) {
          setTimeout(check, intervalMs);
        } else {
          reject(new Error(`Health check timed out after ${maxRetries} retries`));
        }
      });

      req.setTimeout(2000, () => {
        req.destroy();
        if (++retries < maxRetries) {
          setTimeout(check, intervalMs);
        } else {
          reject(new Error(`Health check timed out after ${maxRetries} retries`));
        }
      });
    };

    check();
  });
}
