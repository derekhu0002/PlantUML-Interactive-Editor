// Concern D: Bidirectional Sync Engine — .puml.meta sidecar store
// Implements app-concern-d: Bidirectional Sync Engine
// See src/sync/ARCHITECTURE.md for contract

import * as fs from 'fs';
import * as path from 'path';

interface SidecarData {
  version: number;
  positions: Record<string, { x: number; y: number }>;
  metadata: Record<string, any>;
}

/**
 * Manages read/write of .puml.meta sidecar files alongside .puml files.
 * The sidecar stores element position data separately from the PlantUML source.
 * Format: JSON file with version, positions map, and optional metadata.
 */
export class SidecarStore {
  private cache: Map<string, SidecarData> = new Map();

  /**
   * Get the sidecar file path for a given .puml file path.
   */
  getSidecarPath(pumlPath: string): string {
    return pumlPath + '.meta';
  }

  /**
   * Load sidecar data for a .puml file.
   * Returns null if no sidecar exists.
   */
  load(pumlPath: string): SidecarData | null {
    const sidecarPath = this.getSidecarPath(pumlPath);

    // Check cache first
    if (this.cache.has(sidecarPath)) {
      return this.cache.get(sidecarPath)!;
    }

    try {
      if (fs.existsSync(sidecarPath)) {
        const content = fs.readFileSync(sidecarPath, 'utf-8');
        const data = JSON.parse(content) as SidecarData;
        this.cache.set(sidecarPath, data);
        return data;
      }
    } catch {
      // Silently fail — sidecar is optional
    }

    return null;
  }

  /**
   * Save sidecar data for a .puml file.
   */
  save(
    pumlPath: string,
    positions: Record<string, { x: number; y: number }>,
    metadata: Record<string, any> = {}
  ): boolean {
    const sidecarPath = this.getSidecarPath(pumlPath);

    try {
      const data: SidecarData = {
        version: Date.now(),
        positions,
        metadata,
      };

      fs.writeFileSync(sidecarPath, JSON.stringify(data, null, 2), 'utf-8');
      this.cache.set(sidecarPath, data);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete the sidecar file for a .puml file.
   */
  delete(pumlPath: string): boolean {
    const sidecarPath = this.getSidecarPath(pumlPath);

    try {
      if (fs.existsSync(sidecarPath)) {
        fs.unlinkSync(sidecarPath);
      }
      this.cache.delete(sidecarPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if a sidecar file exists.
   */
  exists(pumlPath: string): boolean {
    const sidecarPath = this.getSidecarPath(pumlPath);
    return fs.existsSync(sidecarPath);
  }

  /**
   * Clear the cache.
   */
  clearCache(): void {
    this.cache.clear();
  }
}
