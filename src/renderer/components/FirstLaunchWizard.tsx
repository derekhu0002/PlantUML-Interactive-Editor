// Renderer Integration — first-launch dependency download wizard
// Implements biz-service-editing: Diagram Editing Service
// See src/renderer/ARCHITECTURE.md for contract

import React, { useState, useEffect, useCallback } from 'react';

interface DownloadProgress {
  type: 'jre' | 'plantuml-jar';
  bytesReceived: number;
  totalBytes: number;
  percent: number;
  speed: number;
}

interface FirstLaunchWizardProps {
  onComplete: () => void;
  onSkip?: () => void;
}

/**
 * First-launch wizard that shows progress bars for JRE and PlantUML JAR downloads.
 * Displayed when the application is launched for the first time.
 */
export default function FirstLaunchWizard({ onComplete, onSkip }: FirstLaunchWizardProps) {
  const [jreProgress, setJreProgress] = useState<DownloadProgress | null>(null);
  const [jarProgress, setJarProgress] = useState<DownloadProgress | null>(null);
  const [status, setStatus] = useState<'downloading' | 'complete' | 'error'>('downloading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!window.electronAPI) {
      // Running in browser — skip
      setStatus('complete');
      return;
    }

    const unsub = window.electronAPI.onDownloadProgress((data: any) => {
      if (data.type === 'jre') {
        setJreProgress(data);
      } else if (data.type === 'plantuml-jar') {
        setJarProgress(data);
      }

      if (data.percent === 100) {
        setStatus('complete');
      }
    });

    return () => unsub();
  }, []);

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    onSkip?.();
    onComplete();
  }, [onSkip, onComplete]);

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          padding: 32,
          width: 420,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <h2 style={{ margin: '0 0 8px', fontSize: 20, color: '#1976D2' }}>
          First-Time Setup
        </h2>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 24 }}>
          PlantUML Interactive Editor needs to download some dependencies to enable diagram rendering.
        </p>

        {/* JRE Download */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Java Runtime (JRE)</span>
            <span style={{ fontSize: 12, color: '#999' }}>
              {jreProgress ? `${jreProgress.percent}%` : 'Pending...'}
            </span>
          </div>
          <div
            style={{
              height: 6,
              background: '#e0e0e0',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${jreProgress?.percent || 0}%`,
                background: '#4CAF50',
                borderRadius: 3,
                transition: 'width 0.3s',
              }}
            />
          </div>
          {jreProgress && (
            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
              {formatBytes(jreProgress.bytesReceived)} / {formatBytes(jreProgress.totalBytes)}
            </div>
          )}
        </div>

        {/* PlantUML JAR Download */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>PlantUML JAR</span>
            <span style={{ fontSize: 12, color: '#999' }}>
              {jarProgress ? `${jarProgress.percent}%` : 'Pending...'}
            </span>
          </div>
          <div
            style={{
              height: 6,
              background: '#e0e0e0',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${jarProgress?.percent || 0}%`,
                background: '#FF9800',
                borderRadius: 3,
                transition: 'width 0.3s',
              }}
            />
          </div>
          {jarProgress && (
            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
              {formatBytes(jarProgress.bytesReceived)} / {formatBytes(jarProgress.totalBytes)}
            </div>
          )}
        </div>

        {/* Status message */}
        {status === 'downloading' && (
          <p style={{ fontSize: 12, color: '#1976D2' }}>
            Downloading dependencies... Please wait.
          </p>
        )}

        {status === 'error' && (
          <p style={{ fontSize: 12, color: '#f44336' }}>
            Download failed: {errorMessage}
          </p>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={handleSkip}
            style={{
              padding: '8px 16px',
              border: '1px solid #ccc',
              borderRadius: 6,
              background: 'white',
              cursor: 'pointer',
              fontSize: 13,
              color: '#666',
            }}
          >
            Skip (offline)
          </button>
          <button
            onClick={handleComplete}
            disabled={status === 'downloading'}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: 6,
              background: status === 'downloading' ? '#bdbdbd' : '#1976D2',
              cursor: status === 'downloading' ? 'not-allowed' : 'pointer',
              fontSize: 13,
              color: 'white',
              fontWeight: 500,
            }}
          >
            {status === 'complete' ? 'Get Started' : 'Downloading...'}
          </button>
        </div>
      </div>
    </div>
  );
}
