// Concern G: Electron Desktop Shell — dependency download manager
// Implements app-concern-g: Electron Desktop Shell
// See src/main/ARCHITECTURE.md for contract

import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { BrowserWindow } from 'electron';

export interface DownloadProgress {
  bytesReceived: number;
  totalBytes: number;
  percent: number;
  speed: number; // bytes per second
}

export type DownloadStatusCallback = (progress: DownloadProgress) => void;

// Trusted download sources
const JRE_DOWNLOAD_URL = 'https://api.adoptium.net/v3/binary/version/jdk-17.0.14+7/windows/x64/jre/hotspot/normal/eclipse';
const PLANTUML_JAR_URL = 'https://github.com/plantuml/plantuml/releases/download/v1.2024.7/plantuml-1.2024.7.jar';
const PLANTUML_MIRROR_URL = 'https://repo1.maven.org/maven2/net/sourceforge/plantuml/plantuml/1.2024.7/plantuml-1.2024.7.jar';

/**
 * Download a file with progress reporting.
 * Sends progress events to the renderer via IPC.
 */
export function downloadFile(
  url: string,
  destPath: string,
  onProgress?: DownloadStatusCallback,
  signal?: AbortSignal
): Promise<void> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    const startTime = Date.now();
    let lastBytes = 0;

    const req = client.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        downloadFile(res.headers.location, destPath, onProgress, signal)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
        reject(new Error(`Download failed with status ${res.statusCode}`));
        return;
      }

      const totalBytes = parseInt(res.headers['content-length'] || '0', 10);
      let bytesReceived = 0;
      const fileStream = fs.createWriteStream(destPath);

      res.on('data', (chunk: Buffer) => {
        if (signal?.aborted) {
          req.destroy();
          fileStream.close();
          fs.unlinkSync(destPath);
          reject(new Error('Download aborted'));
          return;
        }

        bytesReceived += chunk.length;
        fileStream.write(chunk);

        if (onProgress && totalBytes > 0) {
          const elapsed = Date.now() - startTime;
          const speed = elapsed > 0 ? (bytesReceived - lastBytes) / (elapsed / 1000) : 0;
          lastBytes = bytesReceived;
          onProgress({
            bytesReceived,
            totalBytes,
            percent: Math.round((bytesReceived / totalBytes) * 100),
            speed,
          });
        }
      });

      res.on('end', () => {
        fileStream.end();
        if (onProgress && totalBytes > 0) {
          onProgress({
            bytesReceived: totalBytes,
            totalBytes,
            percent: 100,
            speed: 0,
          });
        }
        resolve();
      });

      res.on('error', (err) => {
        fileStream.close();
        reject(err);
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Download timed out after 30s'));
    });
  });
}

/**
 * Send download progress to the renderer windows.
 */
export function sendDownloadProgress(
  type: 'jre' | 'plantuml-jar',
  progress: DownloadProgress
): void {
  const windows = BrowserWindow.getAllWindows();
  for (const win of windows) {
    win.webContents.send('download:progress', { type, ...progress });
  }
}

/**
 * Download JRE (jlink minimal) if not present.
 */
export async function downloadJre(
  destDir: string,
  signal?: AbortSignal
): Promise<string> {
  const jrePath = path.join(destDir, 'jre');
  const jreZipPath = path.join(destDir, 'jre.zip');

  if (fs.existsSync(jrePath)) {
    return jrePath;
  }

  await downloadFile(
    JRE_DOWNLOAD_URL,
    jreZipPath,
    (progress) => sendDownloadProgress('jre', progress),
    signal
  );

  // Extract zip (simplified — would need unzip library in production)
  // For now, just return the zip path
  return jreZipPath;
}

/**
 * Download PlantUML JAR if not present.
 */
export async function downloadPlantUmlJar(
  destDir: string,
  signal?: AbortSignal
): Promise<string> {
  const jarPath = path.join(destDir, 'plantuml.jar');

  if (fs.existsSync(jarPath)) {
    return jarPath;
  }

  // Try primary URL first, fall back to mirror
  try {
    await downloadFile(
      PLANTUML_JAR_URL,
      jarPath,
      (progress) => sendDownloadProgress('plantuml-jar', progress),
      signal
    );
  } catch {
    await downloadFile(
      PLANTUML_MIRROR_URL,
      jarPath,
      (progress) => sendDownloadProgress('plantuml-jar', progress),
      signal
    );
  }

  return jarPath;
}

/**
 * Check if all dependencies are downloaded.
 */
export function checkDependencies(destDir: string): {
  jreReady: boolean;
  plantUmlReady: boolean;
} {
  return {
    jreReady: fs.existsSync(path.join(destDir, 'jre')),
    plantUmlReady: fs.existsSync(path.join(destDir, 'plantuml.jar')),
  };
}
