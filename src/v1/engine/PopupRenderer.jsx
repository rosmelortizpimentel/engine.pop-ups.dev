import { Fragment } from 'preact';
import { useState, useCallback, useMemo } from 'preact/hooks';
import {
    keyframes,
    responsiveStyles,
    getOverlayStyles,
    getOverlayAnimationStyle
} from './styles.js';
import { mergeWithDefaults, DEFAULT_BUTTON_STYLE } from './defaults.js';

/**
 * PopupRenderer - The shared Preact component for rendering popups.
 * 
 * Supports both legacy format (design object) and new format (flat config).
 * All values have sensible defaults defined in defaults.js.
 * Supports branding object to inherit styles from client's website.
 * 
 * @version 1.0.0
 */
export function PopupRenderer({ config: rawConfig, branding = null, onClose, isPreview = false }) {
    // Merge config with defaults and branding
    const config = useMemo(() => mergeWithDefaults(rawConfig, branding), [rawConfig, branding]);

    const [isExiting, setIsExiting] = useState(false);

    // Support both new format and legacy design format
    const design = config.design || config;
    const isModal = design.type === 'modal';
    const isTopBar = design.type === 'top_bar';

    // Extract content (support both formats)
    // headline/body can be string or { text, style }
    const rawContent = design.content || {
        headline: design.headline,
        body: design.body,
        image: design.image
    };

    // Normalize headline and body to support both string and object formats
    const normalizeTextItem = (item) => {
        if (typeof item === 'string') {
            return { text: item, style: {} };
        }
        return item || { text: '', style: {} };
    };

    const content = {
        headline: normalizeTextItem(rawContent.headline),
        body: normalizeTextItem(rawContent.body),
        image: rawContent.image,
        features: rawContent.features || [],
        input: rawContent.input
    };

    // Extract style (support both formats)
    const style = design.style || {
        backgroundColor: design.colors?.background,
        textColor: design.colors?.text,
        closeIconColor: design.colors?.closeIcon,
        borderRadius: design.borderRadius,
        boxShadow: design.boxShadow,
        padding: design.padding
    };

    // Extract buttons (support both formats)
    const buttons = design.buttons || (design.btnText ? [{
        text: design.btnText,
        action: design.btnLink ? 'link' : 'close',
        url: design.btnLink,
        target: '_self',
        style: {
            backgroundColor: design.colors?.buttonBg,
            textColor: design.colors?.buttonText
        }
    }] : []);

    /**
     * Handle close with exit animation
     */
    const handleClose = useCallback(() => {
        if (!design.closable && design.closable !== undefined) return;

        if (isPreview) {
            onClose?.();
            return;
        }

        setIsExiting(true);
        setTimeout(() => {
            onClose?.();
        }, 200);
    }, [isPreview, onClose, design.closable]);

    /**
     * Handle button click
     */
    const handleButtonClick = useCallback((button) => {
        if (button.action === 'link' && button.url) {
            if (button.target === '_blank') {
                window.open(button.url, '_blank', 'noopener,noreferrer');
            } else {
                window.location.href = button.url;
            }
        }

        if (button.action === 'close' || !button.action) {
            handleClose();
        }
    }, [handleClose]);

    /**
     * Handle overlay click
     */
    const handleOverlayClick = useCallback((e) => {
        if (e.target === e.currentTarget && design.closeOnOverlayClick !== false) {
            handleClose();
        }
    }, [handleClose, design.closeOnOverlayClick]);

    /**
     * Get animation style
     */
    const getAnimationStyle = (isExit = false) => {
        const anim = design.animation || {};
        const animName = isExit ? anim.exit : anim.enter;

        const animations = {
            slideDown: isExit ? 'slideOutUp' : 'slideDown',
            slideUp: isExit ? 'slideOutDown' : 'slideUp',
            scaleIn: isExit ? 'popupScaleOut' : 'popupScaleIn',
            scaleOut: 'popupScaleOut',
            fadeIn: isExit ? 'popupFadeOut' : 'popupFadeIn',
            fadeOut: 'popupFadeOut',
            none: null
        };

        const cssAnim = animations[animName] || animations.slideDown;
        if (!cssAnim) return {};

        return {
            animation: `${cssAnim} ${isExit ? 200 : 300}ms ease-${isExit ? 'in' : 'out'} forwards`
        };
    };

    /**
     * Render close button
     */
    const renderCloseButton = () => {
        if (design.showCloseButton === false) return null;

        return (
            <button
                onClick={handleClose}
                aria-label="Close"
                class="popup-close-btn"
                style={{
                    position: 'absolute',
                    top: isTopBar ? '50%' : '12px',
                    right: '12px',
                    transform: isTopBar ? 'translateY(-50%)' : 'none',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    minWidth: '44px',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: style.closeIconColor || '#999999',
                    borderRadius: '50%',
                    transition: 'background-color 150ms ease'
                }}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
        );
    };

    /**
     * Render a button
     */
    const renderButton = (button, index) => {
        const btnStyle = { ...DEFAULT_BUTTON_STYLE, ...button.style };

        return (
            <button
                key={index}
                onClick={() => handleButtonClick(button)}
                class="popup-btn"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: btnStyle.padding || '8px 16px',
                    fontSize: btnStyle.fontSize || '14px',
                    fontWeight: btnStyle.fontWeight || '600',
                    color: btnStyle.textColor || '#ffffff',
                    backgroundColor: btnStyle.backgroundColor || '#2196F3',
                    border: 'none',
                    borderRadius: btnStyle.borderRadius || '4px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'opacity 150ms ease, transform 150ms ease'
                }}
            >
                {button.text}
            </button>
        );
    };

    /**
     * Render image
     */
    const renderImage = () => {
        if (!content.image?.url) return null;

        return (
            <img
                src={content.image.url}
                alt=""
                class="popup-image"
                style={{
                    width: content.image.width || 'auto',
                    height: content.image.height || '24px',
                    objectFit: 'contain',
                    flexShrink: 0
                }}
            />
        );
    };

    /**
     * Render Top Bar
     */
    const renderTopBar = () => {
        const position = design.position || 'top';
        const isFixed = design.fixed !== false;
        const imagePosition = content.image?.position || 'left';

        const systemFonts = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
        const containerStyle = {
            fontFamily: style.fontFamily ? `${style.fontFamily}, ${systemFonts}` : systemFonts,
            boxSizing: 'border-box',
            // Fixed: stays at viewport edge. Inline: flows with document
            position: isPreview ? 'relative' : (isFixed ? 'fixed' : 'relative'),
            ...(isFixed ? { [position]: 0 } : {}),
            left: 0,
            right: 0,
            width: design.width || '100%',
            maxWidth: design.maxWidth || 'none',
            margin: design.maxWidth && design.maxWidth !== 'none' ? '0 auto' : undefined,
            backgroundColor: style.backgroundColor || '#ffffff',
            color: style.textColor || '#1a1a1a',
            borderRadius: style.borderRadius || '0px',
            boxShadow: style.boxShadow || '0 2px 8px rgba(0, 0, 0, 0.08)',
            borderBottom: position === 'top' ? (style.borderBottom || '1px solid rgba(0, 0, 0, 0.05)') : undefined,
            borderTop: position === 'bottom' ? (style.borderTop || '1px solid rgba(0, 0, 0, 0.05)') : undefined,
            zIndex: 2147483647,
            ...(isPreview ? {} : getAnimationStyle(isExiting))
        };

        const contentStyle = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: style.padding || '12px 20px',
            paddingRight: design.showCloseButton !== false ? '50px' : (style.padding || '20px'),
            gap: '12px',
            flexWrap: 'wrap',
            minHeight: '40px'
        };

        return (
            <div class="popup-container top_bar" style={containerStyle} role="banner">
                <div class="popup-content top_bar" style={contentStyle}>
                    {/* Image left */}
                    {imagePosition === 'left' && renderImage()}

                    {/* Text content */}
                    <div class="popup-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {content.headline.text && (
                            <span class="popup-headline top_bar" style={{
                                fontWeight: content.headline.style?.fontWeight || '700',
                                fontSize: content.headline.style?.fontSize || '14px',
                                color: content.headline.style?.color || style.textColor || '#1a1a1a',
                                ...content.headline.style
                            }}>
                                {content.headline.text}
                            </span>
                        )}
                        {content.body.text && (
                            <span class="popup-body top_bar" style={{
                                fontSize: content.body.style?.fontSize || '14px',
                                opacity: content.body.style?.opacity !== undefined ? content.body.style.opacity : 0.9,
                                color: content.body.style?.color || style.textColor || '#1a1a1a',
                                ...content.body.style
                            }}>
                                {content.body.text}
                            </span>
                        )}
                    </div>

                    {/* Image right */}
                    {imagePosition === 'right' && renderImage()}

                    {/* Buttons (max 3) */}
                    {buttons.slice(0, 3).map((btn, i) => renderButton(btn, i))}
                </div>

                {renderCloseButton()}
            </div>
        );
    };

    /**
     * Render Modal - Full customizable modal popup
     */
    const renderModal = () => {
        const systemFonts = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;

        // Size presets
        const sizePresets = {
            small: '360px',
            medium: '480px',
            large: '600px',
            fullscreen: '95vw'
        };
        const modalWidth = sizePresets[design.size] || design.width || '480px';

        const containerStyle = {
            fontFamily: style.fontFamily ? `${style.fontFamily}, ${systemFonts}` : systemFonts,
            boxSizing: 'border-box',
            // Fixed position for centering in live mode
            position: isPreview ? 'relative' : 'fixed',
            top: isPreview ? undefined : '50%',
            left: isPreview ? undefined : '50%',
            transform: isPreview ? undefined : 'translate(-50%, -50%)',
            width: modalWidth,
            maxWidth: design.maxWidth || '90vw',
            maxHeight: design.maxHeight || '85vh',
            overflow: 'auto',
            backgroundColor: style.backgroundColor || '#ffffff',
            color: style.textColor || '#1a1a1a',
            borderRadius: style.borderRadius || '16px',
            boxShadow: style.boxShadow || '0 25px 50px rgba(0, 0, 0, 0.25)',
            border: style.border || 'none',
            zIndex: 2147483647,
            ...(isPreview ? { margin: '0 auto' } : getAnimationStyle(isExiting))
        };

        // Image position determines layout
        const imagePosition = content.image?.position || 'top';
        const isHorizontalImage = imagePosition === 'left' || imagePosition === 'right';

        const contentLayoutStyle = {
            display: isHorizontalImage ? 'flex' : 'block',
            flexDirection: imagePosition === 'right' ? 'row-reverse' : 'row'
        };

        // Render hero image
        const renderHeroImage = () => {
            if (!content.image?.url) return null;

            const configuredHeight = content.image.height || '200px';

            const imageStyle = {
                flexShrink: 0,
                display: 'block'
            };

            if (imagePosition === 'top') {
                // Centered image with max-height, maintain aspect ratio
                imageStyle.width = 'auto';
                imageStyle.maxWidth = 'calc(100% - 48px)'; // Leave 24px padding on each side
                imageStyle.maxHeight = configuredHeight;
                imageStyle.height = 'auto';
                imageStyle.objectFit = 'contain';
                imageStyle.margin = '24px auto 0 auto'; // 24px top, centered horizontally
                imageStyle.borderRadius = style.borderRadius || '8px';
            } else if (imagePosition === 'background') {
                return null; // Handled separately
            } else {
                // left/right
                imageStyle.width = content.image.width || '40%';
                imageStyle.height = '100%';
                imageStyle.minHeight = '250px';
                imageStyle.objectFit = content.image.objectFit || 'cover';
                imageStyle.borderRadius = imagePosition === 'left'
                    ? `${style.borderRadius || '16px'} 0 0 ${style.borderRadius || '16px'}`
                    : `0 ${style.borderRadius || '16px'} ${style.borderRadius || '16px'} 0`;
            }

            return (
                <img
                    src={content.image.url}
                    alt={content.image.alt || ''}
                    class="popup-image"
                    style={imageStyle}
                />
            );
        };

        // Text content area
        const renderTextContent = () => {
            const padding = isHorizontalImage ? '24px' : (style.padding || '32px');
            const textAlign = style.textAlign || 'center';

            return (
                <div class="popup-content modal" style={{
                    padding,
                    textAlign,
                    flex: isHorizontalImage ? 1 : undefined
                }}>
                    {/* Headline */}
                    {content.headline.text && (
                        <h2 class="popup-headline modal" style={{
                            margin: '0 0 12px 0',
                            fontSize: content.headline.style?.fontSize || '24px',
                            fontWeight: content.headline.style?.fontWeight || '700',
                            lineHeight: '1.3',
                            color: content.headline.style?.color || style.textColor || '#1a1a1a',
                            textAlign: content.headline.style?.textAlign || textAlign,
                            ...content.headline.style
                        }}>
                            {content.headline.text}
                        </h2>
                    )}

                    {/* Body */}
                    {content.body.text && (
                        <p class="popup-body modal" style={{
                            margin: '0 0 24px 0',
                            fontSize: content.body.style?.fontSize || '16px',
                            lineHeight: content.body.style?.lineHeight || '1.6',
                            color: content.body.style?.color || '#666666',
                            textAlign: content.body.style?.textAlign || textAlign,
                            ...content.body.style
                        }}>
                            {content.body.text}
                        </p>
                    )}

                    {/* Features list */}
                    {content.features && content.features.length > 0 && (
                        <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: '0 0 24px 0',
                            textAlign: 'left'
                        }}>
                            {content.features.map((feature, i) => (
                                <li key={i} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '8px',
                                    fontSize: '14px',
                                    color: '#555'
                                }}>
                                    <span style={{ color: '#22c55e' }}>{feature.icon || '✓'}</span>
                                    <span>{feature.text}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Input field (email capture, etc.) */}
                    {content.input?.enabled && (
                        <div style={{ marginBottom: '16px' }}>
                            <input
                                type={content.input.type || 'email'}
                                placeholder={content.input.placeholder || 'Enter your email'}
                                required={content.input.required}
                                style={{
                                    width: '100%',
                                    padding: content.input.style?.padding || '14px 16px',
                                    fontSize: '15px',
                                    border: '1px solid #ddd',
                                    borderRadius: content.input.style?.borderRadius || '8px',
                                    boxSizing: 'border-box',
                                    ...content.input.style
                                }}
                            />
                        </div>
                    )}

                    {/* Buttons */}
                    {buttons.length > 0 && (
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: textAlign,
                            flexWrap: 'wrap',
                            flexDirection: buttons.length === 1 ? 'column' : 'row'
                        }}>
                            {buttons.slice(0, 3).map((btn, i) => {
                                const btnStyle = { ...DEFAULT_BUTTON_STYLE, ...btn.style };
                                const isPrimary = btn.primary !== false && i === 0;

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleButtonClick(btn)}
                                        class={`popup-btn ${isPrimary ? 'primary' : 'secondary'}`}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: btnStyle.padding || (isPrimary ? '14px 28px' : '10px 20px'),
                                            fontSize: btnStyle.fontSize || '16px',
                                            fontWeight: btnStyle.fontWeight || '600',
                                            color: btnStyle.textColor || (isPrimary ? '#ffffff' : '#666666'),
                                            backgroundColor: btnStyle.backgroundColor || (isPrimary ? '#2196F3' : 'transparent'),
                                            border: btnStyle.border || 'none',
                                            borderRadius: btnStyle.borderRadius || '8px',
                                            boxShadow: btnStyle.boxShadow || 'none',
                                            cursor: 'pointer',
                                            width: btnStyle.width || (buttons.length === 1 ? '100%' : 'auto'),
                                            whiteSpace: 'nowrap',
                                            transition: 'all 150ms ease'
                                        }}
                                    >
                                        {btn.text}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Footer */}
                    {design.footer && (
                        <div class="popup-footer" style={{
                            marginTop: '20px',
                            paddingTop: '16px',
                            borderTop: '1px solid rgba(0,0,0,0.08)',
                            fontSize: design.footer.style?.fontSize || '12px',
                            color: design.footer.style?.color || '#999999',
                            ...design.footer.style
                        }}>
                            {design.footer.text && <span>{design.footer.text} </span>}
                            {design.footer.links && design.footer.links.map((link, i) => (
                                <span key={i}>
                                    {i > 0 && ' · '}
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: 'inherit', textDecoration: 'underline' }}
                                    >
                                        {link.text}
                                    </a>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Watermark */}
                    {design.showWatermark && (
                        <div class="popup-watermark" style={{
                            marginTop: '16px',
                            paddingTop: '12px',
                            borderTop: '1px solid rgba(0,0,0,0.08)',
                            fontSize: '11px',
                            opacity: 0.5
                        }}>
                            Powered by <a href="https://toggleup.io" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Toggleup</a>
                        </div>
                    )}
                </div>
            );
        };

        // Background image mode
        const backgroundStyle = imagePosition === 'background' && content.image?.url ? {
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${content.image.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: '#ffffff'
        } : {};

        return (
            <div class="popup-container modal" style={{ ...containerStyle, ...backgroundStyle }} role="dialog" aria-modal="true">
                {renderCloseButton()}

                <div style={contentLayoutStyle}>
                    {imagePosition !== 'background' && renderHeroImage()}
                    {renderTextContent()}
                </div>
            </div>
        );
    };

    const renderPopup = () => {
        if (isTopBar) return renderTopBar();
        return renderModal();
    };

    // Preview mode: just the popup
    if (isPreview) {
        return (
            <Fragment>
                <style>{keyframes}</style>
                <style>{responsiveStyles}</style>
                {renderPopup()}
            </Fragment>
        );
    }

    // Live mode: with overlay for modals
    return (
        <Fragment>
            <style>{keyframes}</style>
            <style>{responsiveStyles}</style>
            <style>{`
                .popup-close-btn:hover { background-color: rgba(0, 0, 0, 0.05); }
                .popup-btn:hover { opacity: 0.9; transform: translateY(-1px); }
                .popup-btn:active { transform: translateY(0); }
            `}</style>

            {isModal && (
                <div
                    class="popup-overlay"
                    style={{
                        ...getOverlayStyles({ design: { colors: { overlay: style.overlayColor } } }),
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
