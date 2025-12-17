/**
 * Frequency Capping - Controls how often a popup is shown to a user
 * 
 * Uses localStorage and sessionStorage to track popup views.
 * All storage keys are prefixed to avoid collisions with client site data.
 */

const STORAGE_PREFIX = 'popups_dev_';

/**
 * Check if a popup should be shown based on frequency rules
 * 
 * @param {string} popupId - Unique popup identifier
 * @param {Object} frequencyConfig - Frequency configuration
 * @param {string} frequencyConfig.cap - Cap type: "always" | "once_per_session" | "once_per_user_24h" | "once_lifetime"
 * @returns {boolean} True if popup should be shown
 */
export function shouldShowPopup(popupId, frequencyConfig) {
    const { cap } = frequencyConfig;

    switch (cap) {
        case 'always':
            return true;

        case 'once_per_session':
            return !hasShownThisSession(popupId);

        case 'once_per_day':
            return !hasShownInLast24Hours(popupId);

        case 'once_per_week':
            return !hasShownInLastWeek(popupId);

        case 'once_ever':
            return !hasEverShown(popupId);

        // Legacy/Fallback support
        case 'once_per_user_24h':
            return !hasShownInLast24Hours(popupId);
        case 'once_lifetime':
            return !hasEverShown(popupId);

        default:
            // Default to always showing for unknown cap types
            return true;
    }
}

/**
 * Record that a popup was shown (call this when popup is displayed)
 * 
 * @param {string} popupId - Unique popup identifier
 * @param {Object} frequencyConfig - Frequency configuration
 */
export function recordPopupShown(popupId, frequencyConfig) {
    const { cap } = frequencyConfig;

    try {
        switch (cap) {
            case 'once_per_session':
                markShownThisSession(popupId);
                break;

            case 'once_per_day':
            case 'once_per_user_24h':
                markShownWithTimestamp(popupId);
                break;

            case 'once_per_week':
                markShownWithTimestamp(popupId);
                break;

            case 'once_ever':
            case 'once_lifetime':
                markShownForever(popupId);
                break;

            // 'always' doesn't need recording
        }
    } catch (e) {
        // Storage might be unavailable (private browsing, etc.)
        // Fail silently - popup will just show again next time
        console.warn('[Pop-ups.dev] Could not record popup view:', e.message);
    }
}

// ============================================
// Session-based tracking (sessionStorage)
// ============================================

function getSessionKey(popupId) {
    return `${STORAGE_PREFIX}${popupId}_session`;
}

function hasShownThisSession(popupId) {
    try {
        return sessionStorage.getItem(getSessionKey(popupId)) === 'true';
    } catch {
        return false;
    }
}

function markShownThisSession(popupId) {
    sessionStorage.setItem(getSessionKey(popupId), 'true');
}

// ============================================
// Time-based tracking (localStorage with timestamp)
// ============================================

function getTimestampKey(popupId) {
    return `${STORAGE_PREFIX}${popupId}_last_shown`;
}

function hasShownInLast24Hours(popupId) {
    try {
        const lastShown = localStorage.getItem(getTimestampKey(popupId));
        if (!lastShown) return false;

        const lastShownTime = parseInt(lastShown, 10);
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        return (now - lastShownTime) < oneDay;
    } catch {
        return false;
    }
}

function hasShownInLastWeek(popupId) {
    try {
        const lastShown = localStorage.getItem(getTimestampKey(popupId));
        if (!lastShown) return false;

        const lastShownTime = parseInt(lastShown, 10);
        const now = Date.now();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;

        return (now - lastShownTime) < oneWeek;
    } catch {
        return false;
    }
}

function markShownWithTimestamp(popupId) {
    localStorage.setItem(getTimestampKey(popupId), Date.now().toString());
}

// ============================================
// Lifetime tracking (localStorage permanent flag)
// ============================================

function getLifetimeKey(popupId) {
    return `${STORAGE_PREFIX}${popupId}_lifetime`;
}

function hasEverShown(popupId) {
    try {
        return localStorage.getItem(getLifetimeKey(popupId)) === 'true';
    } catch {
        return false;
    }
}

function markShownForever(popupId) {
    localStorage.setItem(getLifetimeKey(popupId), 'true');
}

// ============================================
// Utility functions
// ============================================

/**
 * Clear all popup tracking data (useful for debugging)
 */
export function clearAllPopupData() {
    try {
        // Clear localStorage
        const localKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(STORAGE_PREFIX)) {
                localKeys.push(key);
            }
        }
        localKeys.forEach(key => localStorage.removeItem(key));

        // Clear sessionStorage
        const sessionKeys = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith(STORAGE_PREFIX)) {
                sessionKeys.push(key);
            }
        }
        sessionKeys.forEach(key => sessionStorage.removeItem(key));

        console.log('[Pop-ups.dev] Cleared all popup tracking data');
    } catch (e) {
        console.warn('[Pop-ups.dev] Could not clear popup data:', e.message);
    }
}
