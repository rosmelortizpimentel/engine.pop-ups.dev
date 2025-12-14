import { Fragment } from 'preact';
import { useState, useCallback } from 'preact/hooks';
import {
    keyframes,
    responsiveStyles,
    getContainerStyles,
    getOverlayStyles,
    getContentStyles,
    getCloseButtonStyles,
    getButtonStyles,
    getHeadlineStyles,
    getBodyStyles,
    getWatermarkStyles,
    getAnimationStyle,
    getOverlayAnimationStyle
} from './styles.js';

/**
 * PopupRenderer - The shared Preact component for rendering popups.
 * 
 * This component is "isomorphic" - it works in two environments:
 * 1. Dashboard Preview (React): Flows naturally in editor canvas
 * 2. SDK Live (Preact): Fixed position with overlay in Shadow DOM
 * 
 * @param {Object} props
 * @param {Object} props.config - Popup configuration from API
 * @param {Function} props.onClose - Callback when popup is closed
 * @param {boolean} props.isPreview - True if rendering in editor preview
 */
export function PopupRenderer({ config, onClose, isPreview = false }) {
    const [isExiting, setIsExiting] = useState(false);

    const { design } = config;
    const isModal = design.type === 'modal';
    const isTopBar = design.type === 'top_bar';

    /**
     * Handle close with exit animation
     */
    const handleClose = useCallback(() => {
        if (isPreview) {
            // In preview mode, close immediately (no animation needed)
            onClose?.();
            return;
        }

        // Trigger exit animation
        setIsExiting(true);

        // Wait for animation to complete before calling onClose
        setTimeout(() => {
            onClose?.();
        }, 200); // Match exit animation duration
    }, [isPreview, onClose]);

    /**
     * Handle button click - navigate or close
     */
    const handleButtonClick = useCallback(() => {
        if (design.btnLink) {
            // Navigate to URL
            window.location.href = design.btnLink;
        }
        handleClose();
    }, [design.btnLink, handleClose]);

    /**
     * Handle overlay click (close popup)
     */
    const handleOverlayClick = useCallback((e) => {
        // Only close if clicking the overlay itself, not the popup
        if (e.target === e.currentTarget) {
            handleClose();
        }
    }, [handleClose]);

    /**
     * Render close button (X icon)
     */
    const renderCloseButton = () => (
        <button
            onClick={handleClose}
            style={getCloseButtonStyles(config)}
            aria-label="Close popup"
            class="popup-close-btn"
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        </button>
    );

    /**
     * Render primary action button
     */
    const renderButton = () => {
        if (!design.btnText) return null;

        return (
            <button
                onClick={handleButtonClick}
                style={getButtonStyles(config)}
                class="popup-btn"
            >
                {design.btnText}
            </button>
        );
    };

    /**
     * Render watermark (for free plans)
     */
    const renderWatermark = () => {
        if (!design.showWatermark) return null;

        return (
            <div style={getWatermarkStyles()} class="popup-watermark">
                Powered by{' '}
                <a
                    href="https://pop-ups.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'underline' }}
                >
                    Pop-ups.dev
                </a>
            </div>
        );
    };

    /**
     * Render Modal popup type
     */
    const renderModal = () => {
        const containerStyles = {
            ...getContainerStyles(config, isPreview),
            ...(isPreview ? {} : getAnimationStyle('modal', null, isExiting)),
            position: isPreview ? 'relative' : 'fixed'
        };

        return (
            <div
                class="popup-container modal"
                style={containerStyles}
                role="dialog"
                aria-modal="true"
                aria-labelledby="popup-headline"
            >
                {renderCloseButton()}

                <div class="popup-content modal" style={getContentStyles('modal')}>
                    {design.headline && (
                        <h2
                            id="popup-headline"
                            class="popup-headline modal"
                            style={getHeadlineStyles('modal')}
                        >
                            {design.headline}
                        </h2>
                    )}

                    {design.body && (
                        <p class="popup-body modal" style={getBodyStyles('modal')}>
                            {design.body}
                        </p>
                    )}

                    {renderButton()}
                    {renderWatermark()}
                </div>
            </div>
        );
    };

    /**
     * Render Top Bar popup type (announcement bar)
     */
    const renderTopBar = () => {
        const containerStyles = {
            ...getContainerStyles(config, isPreview),
            ...(isPreview ? {} : getAnimationStyle('top_bar', design.position, isExiting))
        };

        return (
            <div
                class="popup-container top_bar"
                style={containerStyles}
                role="banner"
                aria-labelledby="popup-headline"
            >
                <div class="popup-content top_bar" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 50px 10px 20px', // Right padding for close button
                    gap: '12px',
                    flexWrap: 'nowrap',
                    minHeight: '40px'
                }}>
                    {/* All content inline */}
                    {design.headline && (
                        <span
                            id="popup-headline"
                            class="popup-headline top_bar"
                            style={{
                                fontWeight: '700',
                                fontSize: '14px',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {design.headline}
                        </span>
                    )}

                    {design.body && (
                        <span class="popup-body top_bar" style={{
                            fontSize: '14px',
                            opacity: 0.9,
                            whiteSpace: 'nowrap'
                        }}>
                            {design.body}
                        </span>
                    )}

                    {design.btnText && (
                        <button
                            onClick={handleButtonClick}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '6px 16px',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: design.colors?.buttonText || '#ffffff',
                                backgroundColor: design.colors?.buttonBg || '#10b981',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                            class="popup-btn top_bar"
                        >
                            {design.btnText}
                        </button>
                    )}
                </div>

                {/* Close button */}
                {renderCloseButton()}
            </div>
        );
    };

    /**
     * Render the complete popup with overlay (if needed)
     */
    const renderPopup = () => {
        if (isModal) return renderModal();
        if (isTopBar) return renderTopBar();

        // Default to modal
        return renderModal();
    };

    // In preview mode, just render the popup without overlay
    if (isPreview) {
        return (
            <Fragment>
                <style>{keyframes}</style>
                <style>{responsiveStyles}</style>
                {renderPopup()}
            </Fragment>
        );
    }

    // In live mode, add overlay for modals
    return (
        <Fragment>
            <style>{keyframes}</style>
            <style>{responsiveStyles}</style>
            <style>{`
        .popup-close-btn:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        .popup-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .popup-btn:active {
          transform: translateY(0);
        }
      `}</style>

            {isModal && (
                <div
                    class="popup-overlay"
                    style={{
                        ...getOverlayStyles(config),
                        ...getOverlayAnimationStyle(isExiting)
                    }}
                    onClick={handleOverlayClick}
                    aria-hidden="true"
                />
            )}

            {renderPopup()}
        </Fragment>
    );
}

export default PopupRenderer;
