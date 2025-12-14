/**
 * Preview Export - For use in the Dashboard Editor
 * 
 * This file exports the PopupRenderer component in a way that can be
 * easily imported by the React dashboard application.
 * 
 * Usage in Dashboard:
 * import { PopupRenderer } from '@pop-ups/engine/preview';
 * 
 * <PopupRenderer 
 *   config={editorState.popupConfig} 
 *   onClose={() => {}} 
 *   isPreview={true} 
 * />
 */

export { PopupRenderer } from '../engine/PopupRenderer.jsx';

// Also export style utilities in case the dashboard needs them
export {
    boxShadowMap,
    fontStack
} from '../engine/styles.js';
