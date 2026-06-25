// Concern C: Ace Code Editor Wrapper — React component
// Implements app-concern-c: Ace Code Editor Wrapper
// See src/editor/ARCHITECTURE.md for contract

import React, { useRef, useEffect, useCallback } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';

import { useEditorEvents, OnEditorChange } from './useEditorEvents';
import { registerPlantUmlMode } from './plantumlMode';

// Register the custom PlantUML mode once before the editor mounts.
// This registers ace/mode/plantuml with ace's dynamic module system
// so that setMode('ace/mode/plantuml') resolves correctly.
registerPlantUmlMode();

interface AceEditorWrapperProps {
  /** Current PlantUML code content. */
  value: string;
  /** Called when the editor content changes (debounced at 200ms). */
  onChange?: OnEditorChange;
  /** Whether the editor is read-only. */
  readOnly?: boolean;
  /** Placeholder text when empty. */
  placeholder?: string;
  /** Height of the editor. */
  height?: string;
  /** Custom CSS class name. */
  className?: string;
}

/**
 * Ace Editor wrapper with PlantUML syntax highlighting.
 * Features:
 * - PlantUML keyword highlighting
 * - Line numbers visible
 * - Read/write mode (controlled via readOnly prop)
 * - 200ms debounced change events for sync
 * - Line markers for canvas-code correspondence
 * - Monospace font for code editing
 */
export default function AceEditorWrapper({
  value,
  onChange,
  readOnly = false,
  placeholder = '// Start editing your PlantUML diagram...',
  height = '100%',
  className,
}: AceEditorWrapperProps) {
  const editorRef = useRef<AceEditor | null>(null);
  const contentRef = useRef(value);

  // Update content ref when value changes
  useEffect(() => {
    contentRef.current = value;
  }, [value]);

  // Editor change events with 200ms debounce
  const { flush } = useEditorEvents(value, onChange, 200);

  const handleEditorChange = useCallback(
    (newValue: string) => {
      // The useEditorEvents hook handles debouncing via the value prop
      // This fires on each keystroke to update internal state
      contentRef.current = newValue;
    },
    []
  );

  const handleEditorLoad = useCallback((editor: any) => {
    editorRef.current = editor;
    // Set tab size to 2 spaces
    editor.getSession().setTabSize(2);
    editor.getSession().setUseSoftTabs(true);
    // Show line numbers
    editor.setShowPrintMargin(false);
    editor.setOption('highlightActiveLine', true);
  }, []);

  return (
    <div style={{ width: '100%', height, display: 'flex', flexDirection: 'column' }}>
      <AceEditor
        ref={(ref) => {
          if (ref) editorRef.current = ref as any;
        }}
        mode="plantuml"
        theme="github"
        name="plantuml-editor"
        value={value}
        onChange={handleEditorChange}
        onLoad={handleEditorLoad}
        readOnly={readOnly}
        height="100%"
        width="100%"
        fontSize={13}
        showPrintMargin={false}
        showGutter={true}
        highlightActiveLine={true}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: false,
          enableSnippets: false,
          showLineNumbers: true,
          tabSize: 2,
          fontFamily: "'Consolas', 'Courier New', monospace",
        }}
        editorProps={{ $blockScrolling: true }}
        placeholder={placeholder}
        className={className}
        debounceChangePeriod={0} // We handle debouncing ourselves
      />
    </div>
  );
}
