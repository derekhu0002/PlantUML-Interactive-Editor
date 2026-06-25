// Concern F: Component Palette — item definitions
// Implements app-concern-f: Component Palette
// See src/palette/ARCHITECTURE.md for contract

export interface PaletteItemDef {
  type: string;
  label: string;
  description: string;
  defaultWidth: number;
  defaultHeight: number;
  /** Icon character to display (uses Unicode symbols). */
  icon: string;
  /** Color theme for the item. */
  color: string;
}

export interface PaletteCategoryDef {
  id: string;
  label: string;
  items: PaletteItemDef[];
}

/**
 * Palette items organized by category:
 * - Flow: Activity, Start, Stop, Connector
 * - Structure: If, While, Fork, Switch
 * - Decoration: Note, Group, Title
 */
export const PALETTE_CATEGORIES: PaletteCategoryDef[] = [
  {
    id: 'flow',
    label: 'Flow',
    items: [
      {
        type: 'activity',
        label: 'Activity',
        description: 'A basic action step in the workflow',
        defaultWidth: 140,
        defaultHeight: 50,
        icon: '▭',
        color: '#1E88E5',
      },
      {
        type: 'start',
        label: 'Start',
        description: 'Start point of the diagram',
        defaultWidth: 40,
        defaultHeight: 40,
        icon: '▶',
        color: '#4CAF50',
      },
      {
        type: 'stop',
        label: 'Stop',
        description: 'End point of the diagram',
        defaultWidth: 40,
        defaultHeight: 40,
        icon: '●',
        color: '#f44336',
      },
      {
        type: 'edge',
        label: 'Connector',
        description: 'Directed arrow between elements',
        defaultWidth: 60,
        defaultHeight: 20,
        icon: '→',
        color: '#757575',
      },
    ],
  },
  {
    id: 'structure',
    label: 'Structure',
    items: [
      {
        type: 'if',
        label: 'If',
        description: 'Conditional branch (if/else)',
        defaultWidth: 160,
        defaultHeight: 80,
        icon: '◇',
        color: '#FB8C00',
      },
      {
        type: 'while',
        label: 'While',
        description: 'Loop with condition',
        defaultWidth: 160,
        defaultHeight: 80,
        icon: '↻',
        color: '#8E24AA',
      },
      {
        type: 'fork',
        label: 'Fork',
        description: 'Parallel execution fork',
        defaultWidth: 200,
        defaultHeight: 100,
        icon: '━ ━',
        color: '#00897B',
      },
      {
        type: 'switch',
        label: 'Switch',
        description: 'Multi-case branching',
        defaultWidth: 160,
        defaultHeight: 80,
        icon: '⊞',
        color: '#D81B60',
      },
    ],
  },
  {
    id: 'decoration',
    label: 'Decoration',
    items: [
      {
        type: 'note',
        label: 'Note',
        description: 'Annotation or comment note',
        defaultWidth: 140,
        defaultHeight: 60,
        icon: '📝',
        color: '#FFC107',
      },
      {
        type: 'group',
        label: 'Group',
        description: 'Visual grouping container',
        defaultWidth: 300,
        defaultHeight: 150,
        icon: '▢',
        color: '#607D8B',
      },
      {
        type: 'title',
        label: 'Title',
        description: 'Diagram title',
        defaultWidth: 200,
        defaultHeight: 40,
        icon: 'T',
        color: '#795548',
      },
    ],
  },
];

/** Get a palette item by type. */
export function getPaletteItem(type: string): PaletteItemDef | undefined {
  for (const category of PALETTE_CATEGORIES) {
    const item = category.items.find((i) => i.type === type);
    if (item) return item;
  }
  return undefined;
}
