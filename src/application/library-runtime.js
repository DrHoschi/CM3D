import { createLibraryRegistry } from './library-registry.js';

// A10 runtime authority. Deliberately session-local: WD-26J does not add
// project, browser or other persistence for the reusable-content registry.
export const sharedLibraryRegistry = createLibraryRegistry();
