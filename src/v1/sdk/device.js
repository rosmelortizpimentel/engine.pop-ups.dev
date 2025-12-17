/**
 * Device detection utility
 * Matches CSS breakpoints defined in styles.js
 */

/**
 * Get current device type based on screen width
 * @returns {'mobile' | 'tablet' | 'desktop'}
 */
export function getDeviceType() {
    // Mobile: max-width: 480px
    if (window.matchMedia('(max-width: 480px)').matches) {
        return 'mobile';
    }
    // Tablet: max-width: 768px
    if (window.matchMedia('(max-width: 768px)').matches) {
        return 'tablet';
    }
    // Desktop: > 768px
    return 'desktop';
}

/**
 * Check if the popup is allowed on the current device
 * @param {Object} deviceRules - The device targeting rules
 * @param {boolean} deviceRules.desktop - Allow on desktop
 * @param {boolean} deviceRules.tablet - Allow on tablet
 * @param {boolean} deviceRules.mobile - Allow on mobile
 * @returns {boolean}
 */
export function isDeviceAllowed(deviceRules) {
    if (!deviceRules) return true; // No rules = allow all

    const currentDevice = getDeviceType();

    // specific check for each type
    if (currentDevice === 'mobile' && deviceRules.mobile === false) return false;
    if (currentDevice === 'tablet' && deviceRules.tablet === false) return false;
    if (currentDevice === 'desktop' && deviceRules.desktop === false) return false;

    return true;
}
