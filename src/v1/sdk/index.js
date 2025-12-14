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

// ============================================
// Capture script element immediately (before any async)
// ============================================
const CURRENT_SCRIPT = document.currentScript;

// ============================================
// Configuration
// ============================================

// Production API endpoint
const API_BASE_URL = 'https://twuvzxjmywyenpsxwavy.supabase.co/functions/v1';

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
// Main SDK Logic
// ============================================

/**
 * Extract API key from the current script tag
 * Uses document.currentScript for IIFE bundles, falls back to querySelector
 */
function getApiKey() {
    // First try: CURRENT_SCRIPT captured at module load time
    if (CURRENT_SCRIPT && CURRENT_SCRIPT.hasAttribute('data-api-key')) {
        return CURRENT_SCRIPT.getAttribute('data-api-key');
    }

    // Second try: querySelector (fallback for when script runs after load)
    const scripts = document.querySelectorAll('script[data-api-key]');
    const script = scripts[scripts.length - 1];
    if (script) {
        return script.getAttribute('data-api-key');
    }

    // Development fallback
    if (DEV_API_KEY) {
        return DEV_API_KEY;
    }
    if (USE_MOCK) {
        return 'mock-api-key';
    }

    console.error('[Toggleup] No script tag with data-api-key found');
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
            `${API_BASE_URL}/deliver-popups?api_key=${apiKey}&url=${currentUrl}`,
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
 */
function createPopupHost() {
    const host = document.createElement('div');
    host.id = 'toggleup-host';
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

    // Create Shadow DOM for style isolation
    const shadowRoot = host.attachShadow({ mode: 'open' });

    // Create a container inside shadow for popups
    const container = document.createElement('div');
    container.id = 'toggleup-container';
    container.style.cssText = 'pointer-events: auto;';
    shadowRoot.appendChild(container);

    return { host, shadowRoot, container };
}

/**
 * Render a popup inside Shadow DOM
 */
function renderPopup(config, container, onClose, branding = null) {
    render(
        h(PopupRenderer, {
            config,
            branding,
            onClose,
            isPreview: false
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
 * @param {Object} branding - Optional branding (uses global if not provided)
 */
function showPopup(config, branding = null) {
    const { host, container } = createPopupHost();

    // Use provided branding or fall back to global
    const activeBranding = branding || globalBranding;

    // Record that popup was shown (only if rules.frequency exists - legacy format)
    if (config.id && config.rules?.frequency) {
        recordPopupShown(config.id, config.rules.frequency);
    }

    // Support both new format (flat) and legacy format (design object)
    const design = config.design || config;

    // For top_bar with pushContent, add margin to body
    let bodyMarginCleanup = null;
    if (design.type === 'top_bar' && design.pushContent !== false) {
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
        // Remove scroll listener if exists
        if (scrollCleanup) {
            scrollCleanup();
        }

        // Restore body margin if applicable
        if (bodyMarginCleanup) {
            bodyMarginCleanup();
        }

        // Give time for exit animation
        setTimeout(() => {
            destroyPopup(host);
        }, 250);
    };

    // If fixed: false, hide the banner on scroll
    let scrollCleanup = null;
    if (design.type === 'top_bar' && design.fixed === false) {
        const scrollThreshold = 100; // Hide after scrolling 100px
        const initialScrollY = window.scrollY;

        const handleScroll = () => {
            const scrolledDistance = Math.abs(window.scrollY - initialScrollY);
            if (scrolledDistance > scrollThreshold) {
                handleClose();
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        scrollCleanup = () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }

    // Render the popup with branding
    renderPopup(config, container, handleClose, activeBranding);
}

/**
 * Process a single popup configuration
 */
function processPopup(config) {
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
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM already loaded
    init();
}

// ============================================
// Expose SDK API globally for manual usage
// ============================================
window.ToggleupSDK = {
    version: '1.0.0',
    init,
    showPopup,
    setBranding,
    getApiKey
};

// Export for ES modules/testing
export { init, showPopup, setBranding, getApiKey };

