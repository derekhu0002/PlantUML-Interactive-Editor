// Renderer Integration — root React component
// Implements biz-service-editing: Diagram Editing Service
// See src/renderer/ARCHITECTURE.md for contract

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Canvas from '../canvas/Canvas';
import AceEditorWrapper from '../editor/AceEditorWrapper';
import Palette from '../palette/Palette';
import { SyncEngine, SyncDirection } from '../sync/SyncEngine';
import AppLayout from './AppLayout';
import FirstLaunchWizard from './components/FirstLaunchWizard';
import { useMenuIPC } from './hooks/useMenuIPC';
import { useAppLifecycle } from './hooks/useAppLifecycle';
import { DiagramModel } from '../model/types';

/**
 * Root application component that wires all concerns together.
 * Layout: Palette (left) | Canvas (center) | Editor (right)
 * Integrates SyncEngine, menu IPC, and app lifecycle.
 */
export default function App() {
  const [syncEngine] = useState(() => new SyncEngine());
  const [code, setCode] = useState('@startuml\n@enduml\n');
  const [model, setModel] = useState<DiagramModel>({ nodes: [], edges: [] });
  const [showFirstLaunch, setShowFirstLaunch] = useState(true);
  const [canvasKey, setCanvasKey] = useState(0);
  const syncModelRef = useRef<DiagramModel>({ nodes: [], edges: [] });

  const {
    newDiagram,
    openFile,
    exportPuml,
    exportPng,
    undo,
    redo,
  } = useAppLifecycle(syncEngine);

  // Subscribe to sync engine events
  useEffect(() => {
    const unsubCanvas = syncEngine.subscribe((updatedModel: DiagramModel, source: SyncDirection) => {
      if (source === 'code-to-canvas') {
        syncModelRef.current = updatedModel;
        setModel({ ...updatedModel });
        setCanvasKey((k) => k + 1);
      } else if (source === 'canvas-to-code') {
        const generatedCode = syncEngine.getCode();
        setCode(generatedCode);
      }
    });

    return () => {
      unsubCanvas();
    };
  }, [syncEngine]);

  // Handle canvas changes
  const handleCanvasChange = useCallback(
    (event: any) => {
      if (event.type === 'nodesChange' || event.type === 'edgesChange') {
        syncEngine.handleCanvasChange(event.nodes, event.edges);
      }
    },
    [syncEngine]
  );

  // Handle editor changes
  const handleEditorChange = useCallback(
    (event: { content: string; timestamp: number }) => {
      setCode(event.content);
      syncEngine.handleEditorChange(event.content);
    },
    [syncEngine]
  );

  // Wire menu IPC
  useMenuIPC({
    onNew: newDiagram,
    onOpen: openFile,
    onExportPuml: exportPuml,
    onExportPng: exportPng,
    onUndo: undo,
    onRedo: redo,
  });

  // Handle first-launch completion
  const handleFirstLaunchComplete = useCallback(() => {
    setShowFirstLaunch(false);
    newDiagram();
  }, [newDiagram]);

  return (
    <>
      {showFirstLaunch && <FirstLaunchWizard onComplete={handleFirstLaunchComplete} />}

      <AppLayout
        palette={
          <Palette width={240} />
        }
        canvas={
          <Canvas
            key={canvasKey}
            initialModel={model}
            onCanvasChange={handleCanvasChange}
          />
        }
        editor={
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Editor toolbar */}
            <div
              style={{
                padding: '8px 12px',
                background: '#f5f5f5',
                borderBottom: '1px solid #e0e0e0',
                fontSize: 12,
                fontWeight: 500,
                color: '#424242',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>PlantUML Editor</span>
              <span style={{ fontSize: 10, color: '#999' }}>
                {code.length} chars
              </span>
            </div>
            {/* Editor */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              <AceEditorWrapper
                value={code}
                onChange={handleEditorChange}
                height="100%"
              />
            </div>
          </div>
        }
      />
    </>
  );
}
