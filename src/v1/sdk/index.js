/**
 * Toggleup.io SDK v1 - Entry Point
 * 
 * This is the main entry point for the embeddable SDK script.
 * It orchestrates the entire popup lifecycle:
 * 
 * 1. Extract project ID from script tag
 * 2. Fetch popup configurations from API
 * 3. Filter popups based on frequency caps
 * 4. Set up triggers for each popup
 * 5. Inject popups into Shadow DOM when triggered
 * 
 * The SDK is designed to be:
 * - Lightweight (<8KB gzipped target)
 * - Non-intrusive (Shadow DOM isolation)
 * - Performant (lazy loading, minimal DOM operations)
 * 
 * @version 1.0.0
 */

import { h, render } from 'preact';
import { PopupRenderer } from '../engine/PopupRenderer.jsx';
import { setupTrigger } from './triggers.js';
import { shouldShowPopup, recordPopupShown } from './frequency.js';
import { isDeviceAllowed } from './device.js';

// ============================================
// Capture script element immediately (before any async)
// ============================================
const CURRENT_SCRIPT = document.currentScript;

// ============================================
// Configuration
// ============================================

// Production API endpoint
const API_BASE_URL = 'https://api.toggleup.io/v1';

// Development mock - set to false to use real API
const USE_MOCK = false;

// Development API key fallback (only for local Vite dev, set to null for production)
const DEV_API_KEY = null;

// ============================================
// Mock Data (for development only)
// ============================================

const MOCK_POPUP_CONFIG = {
    id: 'popup_mock_12345',
    name: 'Demo Popup',
    design: {
        type: 'modal', // 'modal' | 'top_bar'
        position: 'top', // Only for top_bar: 'top' | 'bottom'
        isSticky: true,
        headline: '¡Bienvenido a nuestra tienda!',
        body: 'Suscríbete a nuestro newsletter y obtén un 10% de descuento en tu primera compra.',
        btnText: 'Suscribirme',
        btnLink: null, // null = just close, URL = navigate
        colors: {
            background: '#ffffff',
            text: '#1a1a1a',
            buttonBg: '#6366f1',
            buttonText: '#ffffff',
            closeIcon: '#999999',
            overlay: 'rgba(0, 0, 0, 0.6)'
        },
        borderRadius: '16px',
        boxShadow: 'medium',
        showWatermark: true
    },
    rules: {
        trigger: {
            type: 'time_delay',
            value: 3 // seconds
        },
        frequency: {
            cap: 'always' // DEV: show every time for testing
        }
    }
};

// ============================================
// Font Loading Utilities
// ============================================

/**
 * Check if a Google Font is already loaded via <link> tag
 * We don't use document.fonts.check() because it gives false positives
 * due to browser font substitution
 */
function isGoogleFontLoaded(fontFamily) {
    if (!fontFamily) return true;

    // Normalize font name (remove quotes if present)
    const normalizedFont = fontFamily.replace(/['"]/g, '').split(',')[0].trim();
    const fontParam = normalizedFont.replace(/ /g, '+');

    // Check if a Google Fonts link for this font already exists
    const existingLink = document.querySelector(`link[href*="fonts.googleapis.com"][href*="family=${fontParam}"]`);
    return !!existingLink;
}

/**
 * Inject Google Fonts link if not already present
 * @returns {Promise} Resolves when font is loaded
 */
function loadGoogleFont(fontFamily) {
    return new Promise((resolve) => {
        if (!fontFamily) {
            resolve();
            return;
        }

        // Normalize font name
        const normalizedFont = fontFamily.replace(/['"]/g, '').split(',')[0].trim();

        // Check if already loaded in page
        const existingLink = document.querySelector(`link[href*="family=${normalizedFont.replace(/ /g, '+')}"]`);
        if (existingLink) {
            resolve();
            return;
        }

        // Create Google Fonts URL
        const fontUrl = `https://fonts.googleapis.com/css2?family=${normalizedFont.replace(/ /g, '+')}:wght@400;500;600;700&display=swap`;

        // Inject link element
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fontUrl;
        link.setAttribute('data-toggleup-font', normalizedFont);

        link.onload = () => {
            // Wait a bit for font to be parsed and available
            setTimeout(resolve, 100);
        };
        link.onerror = () => {
            console.warn(`[Toggleup] Failed to load font: ${normalizedFont}`);
            resolve(); // Continue even if font fails
        };

        document.head.appendChild(link);
    });
}

/**
 * Load font if config requests it and font doesn't exist
 * @param {Object} config - Popup config
 * @returns {Promise} Resolves when ready to render
 */
async function loadFontIfNeeded(config) {
    const design = config.design || config;
    const style = design.style || {};

    // Check if loadFont is explicitly enabled
    if (!style.loadFont) {
        return; // Don't load, use whatever is available
    }

    const fontFamily = style.fontFamily;
    if (!fontFamily) {
        return; // No font specified
    }

    // Check if font already loaded via Google Fonts link
    if (isGoogleFontLoaded(fontFamily)) {
        return; // Font already available, no need to load
    }

    // Load the font
    await loadGoogleFont(fontFamily);
}

// ============================================
// Main SDK Logic
// ============================================

/**
 * Extract API key from the current script tag
 * Supports both data-api-key and data-project-id (alias)
 */
function getApiKey() {
    const getKeyFromElement = (el) => {
        if (!el) return null;
        return el.getAttribute('data-api-key') || el.getAttribute('data-project-id');
    };

    // First try: CURRENT_SCRIPT captured at module load time
    const keyFromCurrent = getKeyFromElement(CURRENT_SCRIPT);
    if (keyFromCurrent) return keyFromCurrent;

    // Second try: querySelector (fallback for when script runs after load)
    const scripts = document.querySelectorAll('script[data-api-key], script[data-project-id]');
    const script = scripts[scripts.length - 1];
    const keyFromQuery = getKeyFromElement(script);
    if (keyFromQuery) return keyFromQuery;

    // Development fallback
    if (DEV_API_KEY) {
        return DEV_API_KEY;
    }
    if (USE_MOCK) {
        return 'mock-api-key';
    }

    console.error('[Toggleup] No script tag with data-api-key or data-project-id found');
    return null;
}

/**
 * Fetch popup configurations from API
 */
async function fetchPopupConfigs(apiKey) {
    if (USE_MOCK) {
        // Development mock - simulate network delay
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([MOCK_POPUP_CONFIG]);
            }, 100);
        });
    }

    try {
        const currentUrl = encodeURIComponent(window.location.pathname);
        const response = await fetch(
            `${API_BASE_URL}/popups?api_key=${apiKey}&url=${currentUrl}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            if (response.status === 403) {
                console.error('[Toggleup] Origin not allowed for this API key');
            } else if (response.status === 404) {
                console.error('[Toggleup] Project not found');
            }
            throw new Error(`API returned ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[Toggleup] Failed to fetch popup configs:', error);
        return [];
    }
}

/**
 * Create isolated Shadow DOM container for popup
 * @param {boolean} isFixed - If false, insert at body start as inline element
 * @param {boolean} isModal - If true, create fullscreen overlay host for modal
 */
function createPopupHost(isFixed = true, isModal = false, position = 'top') {
    const host = document.createElement('div');
    host.id = 'toggleup-host';

    if (!isFixed) {
        // Inline mode: insert at very beginning or end of body, flows with content
        host.style.cssText = `
            position: relative;
            display: block;
            width: 100%;
            z-index: 2147483647;
        `;
        if (position === 'bottom') {
            document.body.appendChild(host);
        } else {
            document.body.insertBefore(host, document.body.firstChild);
        }
    } else if (isModal) {
        // Modal mode: fullscreen fixed overlay
        host.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 2147483647;
            pointer-events: none;
        `;
        document.body.appendChild(host);
    } else {
        // Banner mode: minimal fixed container
        host.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0;
            height: 0;
            overflow: visible;
            z-index: 2147483647;
            pointer-events: none;
        `;
        document.body.appendChild(host);
    }

    // Create Shadow DOM for style isolation
    const shadowRoot = host.attachShadow({ mode: 'open' });

    // Create a container inside shadow for popups
    const container = document.createElement('div');
    container.id = 'toggleup-container';
    container.style.cssText = isModal
        ? 'pointer-events: auto; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;'
        : 'pointer-events: auto;';
    shadowRoot.appendChild(container);

    return { host, shadowRoot, container };
}

/**
 * Render a popup inside Shadow DOM
 * @param {boolean} isEmbedded - If true, use relative positioning (for canvas/container rendering)
 */
function renderPopup(config, container, onClose, branding = null, isEmbedded = false) {
    render(
        h(PopupRenderer, {
            config,
            branding,
            onClose,
            isPreview: isEmbedded  // Use relative positioning when embedded
        }),
        container
    );
}

/**
 * Remove popup from DOM and cleanup
 */
function destroyPopup(host) {
    if (host && host.parentNode) {
        host.parentNode.removeChild(host);
    }
}

/**
 * Global branding configuration (set via API or manually)
 */
let globalBranding = null;

/**
 * Set global branding for all popups
 */
function setBranding(branding) {
    globalBranding = branding;
}

/**
 * Show a single popup with full lifecycle
 * @param {Object} config - Popup configuration
 * @param {Object} options - Optional: { target, branding }
 *   - target: DOM element to render inside (embedded mode)
 *   - branding: Branding config (falls back to global)
 */
async function showPopup(config, options = {}) {
    // Load font if needed (async, waits before rendering)
    await loadFontIfNeeded(config);

    // Support legacy signature: showPopup(config, branding)
    const opts = (options && typeof options === 'object' && !options.nodeType)
        ? options
        : { branding: options };

    const { target, branding } = opts;

    // Support both new format (flat) and legacy format (design object)
    const design = config.design || config;

    // Determine popup type
    const isModal = design.type === 'modal';
    const isTopBar = design.type === 'top_bar';

    // Use provided branding or fall back to global
    const activeBranding = branding || globalBranding;

    // === EMBEDDED MODE: Render inside target container ===
    if (target && target.nodeType === 1) {
        const wrapper = document.createElement('div');
        wrapper.id = 'toggleup-embedded';
        wrapper.style.cssText = 'position:relative;width:100%;height:100%;';

        // Clear target and append
        target.innerHTML = '';
        target.appendChild(wrapper);

        // For modal in embedded mode, add backdrop inside wrapper
        if (isModal) {
            wrapper.style.display = 'flex';
            wrapper.style.alignItems = 'center';
            wrapper.style.justifyContent = 'center';
            const backdrop = document.createElement('div');
            backdrop.style.cssText = `position:absolute;inset:0;background:${design.colors?.overlay || 'rgba(0,0,0,0.5)'};`;
            wrapper.appendChild(backdrop);
        }

        const embeddedContainer = document.createElement('div');
        embeddedContainer.style.cssText = isModal ? 'position:relative;z-index:1;' : '';
        wrapper.appendChild(embeddedContainer);

        renderPopup(config, embeddedContainer, () => {
            wrapper.remove();
        }, activeBranding, true);  // isEmbedded = true

        return { cleanup: () => wrapper.remove() };
    }

    // === FULLSCREEN MODE: Original behavior ===
    // Determine if banner should be fixed or inline (only for top_bar)
    const isFixed = isTopBar ? design.fixed !== false : true;
    const position = design.position || 'top';

    const { host, container } = createPopupHost(isFixed, isModal, position);

    // Record that popup was shown (only if rules.frequency exists - legacy format)
    if (config.id && config.rules?.frequency) {
        recordPopupShown(config.id, config.rules.frequency);
    }

    // For fixed top_bar with pushContent, add margin to body
    // (Not needed for inline mode since it naturally pushes content)
    let bodyMarginCleanup = null;
    if (isFixed && design.type === 'top_bar' && design.pushContent !== false) {
        const position = design.position || 'top';
        const barHeight = '50px'; // Approximate height of top bar

        // Store original margin
        const originalMargin = position === 'top'
            ? document.body.style.marginTop
            : document.body.style.marginBottom;

        // Apply margin to push content
        if (position === 'top') {
            document.body.style.marginTop = barHeight;
        } else {
            document.body.style.marginBottom = barHeight;
        }

        // Cleanup function to restore original margin
        bodyMarginCleanup = () => {
            if (position === 'top') {
                document.body.style.marginTop = originalMargin || '';
            } else {
                document.body.style.marginBottom = originalMargin || '';
            }
        };
    }

    // Handle close
    const handleClose = () => {
        // Restore body margin if applicable
        if (bodyMarginCleanup) {
            bodyMarginCleanup();
        }

        // Give time for exit animation
        setTimeout(() => {
            destroyPopup(host);
        }, 250);
    };

    // Render the popup with branding
    renderPopup(config, container, handleClose, activeBranding);
}

/**
 * Process a single popup configuration
 */
function processPopup(config) {
    // Check device targeting first (lowest cost check)
    if (config.rules?.deviceTargeting && !isDeviceAllowed(config.rules.deviceTargeting)) {
        return null; // Skip this popup for this device
    }

    // Check frequency cap
    if (!shouldShowPopup(config.id, config.rules.frequency)) {
        return null; // Skip this popup
    }

    // Set up trigger
    const cleanup = setupTrigger(config.rules.trigger, () => {
        showPopup(config);
    });

    return cleanup;
}

/**
 * Initialize the SDK
 */
async function init() {
    // Get API key from script tag
    const apiKey = getApiKey();

    if (!apiKey) {
        return;
    }

    // Fetch popup configurations
    const configs = await fetchPopupConfigs(apiKey);

    if (!configs || configs.length === 0) {
        return;
    }

    // Process all popups that pass frequency checks
    const cleanups = [];

    for (const config of configs) {
        const cleanup = processPopup(config);
        if (cleanup) {
            cleanups.push(cleanup);
        }
    }

    // Store cleanups for potential future use (e.g., SPA navigation)
    window.__toggleupCleanups = cleanups;
}

// ============================================
// Auto-initialize when DOM is ready
// Check for data-manual attribute to skip auto-init
// ============================================

const currentScript = document.currentScript;
const isManualMode = currentScript?.hasAttribute('data-manual');

if (!isManualMode) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM already loaded
        init();
    }
}

/**
 * Get popup configs from API without showing them
 * Useful for debugging or manual control
 */
async function getConfigs() {
    const apiKey = getApiKey();
    if (!apiKey) return [];
    return await fetchPopupConfigs(apiKey);
}

/**
 * Show a specific popup by its ID
 * @param {string} id - The popup ID
 */
async function showPopupById(id) {
    const configs = await getConfigs();
    const popup = configs.find(c => c.id === id);
    if (popup) {
        showPopup(popup);
        return true;
    }
    console.warn(`[Toggleup] Popup with id "${id}" not found`);
    return false;
}

// ============================================
// Expose SDK API globally for manual usage
// ============================================
window.ToggleupSDK = {
    version: '1.0.0',
    init,
    showPopup,
    showPopupById,
    setBranding,
    getApiKey,
    getConfigs
};

// Export for ES modules/testing
export { init, showPopup, showPopupById, setBranding, getApiKey, getConfigs };

