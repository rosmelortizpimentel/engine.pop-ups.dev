/**
 * Default configurations for all popup types.
 * These values are used when the API doesn't provide specific values.
 * 
 * Supports branding object to inherit styles from client's website.
 * 
 * @version 1.0.0
 */

/**
 * Default button style
 */
export const DEFAULT_BUTTON_STYLE = {
    backgroundColor: '#2196F3',
    textColor: '#ffffff',
    borderRadius: '4px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600'
};

/**
 * Default configuration for Top Bar (Banner) popup
 */
export const TOP_BAR_DEFAULTS = {
    type: 'top_bar',

    // Position & Behavior
    position: 'top',           // 'top' | 'bottom'
    fixed: true,               // true = stays visible on scroll
    pushContent: true,         // true = pushes page content down/up
    showCloseButton: true,     // show X button
    closable: true,            // allows closing

    // Dimensions
    width: '100%',
    maxWidth: 'none',

    // Content
    content: {
        headline: '',
        body: '',
        image: null,           // { url: string, position: 'left' | 'right', width: string, height: string }
    },

    // Buttons (max 3)
    buttons: [],

    // Styling
    style: {
        backgroundColor: '#ffffff',
        textColor: '#1a1a1a',
        closeIconColor: '#999999',
        borderRadius: '0px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        padding: '12px 20px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        fontFamily: null  // null = use branding or system fonts
    },

    // Animation
    animation: {
        enter: 'slideDown',    // 'slideDown' | 'slideUp' | 'fadeIn' | 'none'
        exit: 'slideUp'        // 'slideUp' | 'slideDown' | 'fadeOut' | 'none'
    }
};

/**
 * Default configuration for Modal popup
 */
export const MODAL_DEFAULTS = {
    type: 'modal',

    showCloseButton: true,
    closable: true,
    closeOnOverlayClick: true,

    width: '420px',
    maxWidth: '90vw',

    content: {
        headline: '',
        body: '',
        image: null
    },

    buttons: [],

    style: {
        backgroundColor: '#ffffff',
        textColor: '#1a1a1a',
        closeIconColor: '#999999',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        padding: '24px',
        overlayColor: 'rgba(0, 0, 0, 0.6)',
        fontFamily: null
    },

    animation: {
        enter: 'scaleIn',
        exit: 'scaleOut'
    }
};

/**
 * Deep merge two objects
 */
export function deepMerge(target, source) {
    const result = { ...target };

    for (const key in source) {
        if (source[key] !== null && source[key] !== undefined) {
            if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
    }

    return result;
}

/**
 * Get defaults for a popup type
 */
export function getDefaults(type) {
    switch (type) {
        case 'top_bar':
            return TOP_BAR_DEFAULTS;
        case 'modal':
            return MODAL_DEFAULTS;
        default:
            return MODAL_DEFAULTS;
    }
}

/**
 * Apply branding to popup configuration
 * @param {Object} config - Popup configuration
 * @param {Object} branding - Branding object from scraped website
 */
export function applyBranding(config, branding) {
    if (!branding) return config;

    const result = { ...config };
    const style = result.style || result.design?.style || {};
    const buttons = result.buttons || result.design?.buttons || [];

    // Apply colors from branding
    if (branding.colors) {
        // Background - use branding background or keep default
        if (branding.colors.background && !style.backgroundColor) {
            style.backgroundColor = branding.colors.background;
        }

        // Text color - use branding primary text
        if (branding.colors.textPrimary && !style.textColor) {
            style.textColor = branding.colors.textPrimary;
        }
    }

    // Apply typography from branding
    if (branding.typography?.fontFamilies?.primary && !style.fontFamily) {
        style.fontFamily = branding.typography.fontFamilies.primary;
    }

    // Apply border radius from branding
    if (branding.spacing?.borderRadius && !style.borderRadius) {
        style.borderRadius = branding.spacing.borderRadius;
    }

    // Apply button styles from branding
    if (branding.components?.buttonPrimary && buttons.length > 0) {
        const primaryBtn = branding.components.buttonPrimary;
        buttons.forEach((btn, index) => {
            if (!btn.style) btn.style = {};

            // First button uses primary style
            if (index === 0) {
                if (primaryBtn.background && !btn.style.backgroundColor) {
                    btn.style.backgroundColor = primaryBtn.background;
                }
                if (primaryBtn.textColor && !btn.style.textColor) {
                    btn.style.textColor = primaryBtn.textColor;
                }
                if (primaryBtn.borderRadius && !btn.style.borderRadius) {
                    btn.style.borderRadius = primaryBtn.borderRadius;
                }
                if (primaryBtn.shadow && !btn.style.boxShadow) {
                    btn.style.boxShadow = primaryBtn.shadow;
                }
            }
            // Secondary buttons use secondary style
            else if (branding.components.buttonSecondary) {
                const secondaryBtn = branding.components.buttonSecondary;
                if (secondaryBtn.background && !btn.style.backgroundColor) {
                    btn.style.backgroundColor = secondaryBtn.background;
                }
                if (secondaryBtn.textColor && !btn.style.textColor) {
                    btn.style.textColor = secondaryBtn.textColor;
                }
                if (secondaryBtn.borderRadius && !btn.style.borderRadius) {
                    btn.style.borderRadius = secondaryBtn.borderRadius;
                }
            }
        });
    }

    // Apply logo from branding if image not explicitly set
    if (branding.images?.logo) {
        const content = result.content || result.design?.content || {};
        if (!content.image) {
            content.image = {
                url: branding.images.logo,
                position: 'left',
                height: '24px'
            };
        }
        if (result.content) {
            result.content = content;
        } else if (result.design) {
            result.design.content = content;
        }
    }

    // Update style back to config
    if (result.style) {
        result.style = style;
    } else if (result.design) {
        result.design.style = style;
    }

    // Update buttons back to config
    if (result.buttons) {
        result.buttons = buttons;
    } else if (result.design) {
        result.design.buttons = buttons;
    }

    return result;
}

/**
 * Merge user config with defaults and branding
 * @param {Object} config - User popup configuration
 * @param {Object} branding - Optional branding object
 */
export function mergeWithDefaults(config, branding = null) {
    const type = config.type || config.design?.type;
    const defaults = getDefaults(type);

    let result;

    // Handle legacy format (design object)
    if (config.design) {
        result = {
            ...config,
            design: deepMerge(defaults, config.design)
        };
    } else {
        result = deepMerge(defaults, config);
    }

    // Apply branding if provided
    if (branding) {
        result = applyBranding(result, branding);
    }

    return result;
}
