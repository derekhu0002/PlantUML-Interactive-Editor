// Concern D: Bidirectional Sync Engine — barrel export
export { SyncEngine } from './SyncEngine';
export { ConflictResolver } from './ConflictResolver';
export { FingerprintMatcher } from './FingerprintMatcher';
export { SidecarStore } from './SidecarStore';
export type { SyncDirection, SyncCallback } from './SyncEngine';
export type { ConflictWinner, SyncState, SyncTimestamp } from './ConflictResolver';
export type { Fingerprint } from './FingerprintMatcher';
