import { createContext } from '@lit/context';

/**
 * WorkspaceContext Token
 * 
 * Defines the contract for providing workspace state to shared viewer components.
 * 
 * Expected Provider Value Interface:
 * {
 *   files$: BehaviorSubject<Array<File>>,
 *   activeFile$: BehaviorSubject<File | null>,
 *   theme$: BehaviorSubject<'light' | 'dark'>
 * }
 */
export const WorkspaceContext = createContext('spectre-workspace-state');
