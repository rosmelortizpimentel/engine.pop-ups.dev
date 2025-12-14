/**
 * Trigger System - Determines WHEN to show a popup
 * 
 * Triggers are executed client-side by the SDK after receiving
 * popup configurations from the API.
 */

/**
 * Setup a trigger and return a cleanup function
 * 
 * @param {Object} triggerConfig - The trigger configuration
 * @param {string} triggerConfig.type - Trigger type: "immediate" | "time_delay" | "scroll_percent" | "exit_intent"
 * @param {number} triggerConfig.value - Value for the trigger (seconds for delay, percentage for scroll)
 * @param {Function} onTrigger - Callback when trigger fires
 * @returns {Function} Cleanup function to cancel the trigger
 */
export function setupTrigger(triggerConfig, onTrigger) {
    const { type, value } = triggerConfig;

    switch (type) {
        case 'immediate':
            return setupImmediateTrigger(onTrigger);

        case 'time_delay':
            return setupDelayTrigger(value, onTrigger);

        case 'scroll_percent':
            return setupScrollTrigger(value, onTrigger);

        case 'exit_intent':
            return setupExitIntentTrigger(onTrigger);

        default:
            console.warn(`[Pop-ups.dev] Unknown trigger type: ${type}`);
            return setupImmediateTrigger(onTrigger);
    }
}

/**
 * Immediate trigger - fires right away
 */
function setupImmediateTrigger(onTrigger) {
    // Use requestAnimationFrame to ensure DOM is ready
    const frameId = requestAnimationFrame(() => {
        onTrigger();
    });

    return () => cancelAnimationFrame(frameId);
}

/**
 * Time delay trigger - fires after N seconds
 */
function setupDelayTrigger(seconds, onTrigger) {
    const timeoutId = setTimeout(() => {
        onTrigger();
    }, seconds * 1000);

    return () => clearTimeout(timeoutId);
}

/**
 * Scroll percentage trigger - fires when user scrolls past N%
 */
function setupScrollTrigger(percentage, onTrigger) {
    let hasTriggered = false;

    const handleScroll = () => {
        if (hasTriggered) return;

        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = window.scrollY;
        const currentPercent = scrollHeight > 0 ? (scrolled / scrollHeight) * 100 : 0;

        if (currentPercent >= percentage) {
            hasTriggered = true;
            onTrigger();
            window.removeEventListener('scroll', handleScroll);
        }
    };

    // Check immediately in case page is already scrolled
    handleScroll();

    if (!hasTriggered) {
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => window.removeEventListener('scroll', handleScroll);
}

/**
 * Exit intent trigger - fires when mouse leaves the viewport (desktop only)
 * 
 * This detects when the user moves their cursor towards the browser chrome
 * (tabs, address bar, close button), suggesting they might leave the page.
 */
function setupExitIntentTrigger(onTrigger) {
    let hasTriggered = false;

    const handleMouseLeave = (e) => {
        if (hasTriggered) return;

        // Only trigger if mouse left from the top of the viewport
        // (suggesting user is going to tabs/address bar/close button)
        if (e.clientY <= 0) {
            hasTriggered = true;
            onTrigger();
            document.removeEventListener('mouseleave', handleMouseLeave);
        }
    };

    // Exit intent only works on desktop - check for touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice) {
        document.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => document.removeEventListener('mouseleave', handleMouseLeave);
}
