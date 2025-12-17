/**
 * CSS-in-JS utilities for the PopupRenderer.
 * 
 * All styles are generated as inline styles or injected as <style> tags
 * to work within Shadow DOM isolation.
 */

/**
 * Maps boxShadow preset names to CSS values
 */
export const boxShadowMap = {
  none: 'none',
  subtle: '0 2px 8px rgba(0, 0, 0, 0.08)',
  medium: '0 4px 20px rgba(0, 0, 0, 0.15)',
  strong: '0 8px 40px rgba(0, 0, 0, 0.25)'
};

/**
 * Base font stack using system fonts for optimal performance
 */
export const fontStack = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`;

/**
 * CSS keyframes for animations
 */
export const keyframes = `
  @keyframes popupFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes popupScaleIn {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  @keyframes popupFadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes popupScaleOut {
    from {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    to {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.95);
    }
  }

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
    }
    to {
      transform: translateY(0);
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  @keyframes slideOutUp {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(-100%);
    }
  }

  @keyframes slideOutDown {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(100%);
    }
  }
`;

/**
 * Get animation styles based on popup type and position
 */
export function getAnimationStyle(type, position, isExiting = false) {
  if (type === 'modal') {
    return {
      animation: isExiting
        ? 'popupScaleOut 200ms ease-in forwards'
        : 'popupScaleIn 300ms ease-out forwards'
    };
  }

  if (type === 'bar') {
    if (position === 'top') {
      return {
        animation: isExiting
          ? 'slideOutUp 200ms ease-in forwards'
          : 'slideDown 300ms ease-out forwards'
      };
    } else {
      return {
        animation: isExiting
          ? 'slideOutDown 200ms ease-in forwards'
          : 'slideUp 300ms ease-out forwards'
      };
    }
  }

  return {};
}

/**
 * Get overlay animation style
 */
export function getOverlayAnimationStyle(isExiting = false) {
  return {
    animation: isExiting
      ? 'popupFadeOut 200ms ease-in forwards'
      : 'popupFadeIn 300ms ease-out forwards'
  };
}

/**
 * Base styles for the popup container
 */
export function getContainerStyles(config, isPreview) {
  const { design } = config;

  // Support both design.boxShadow and design.styles.boxShadow
  const boxShadowValue = design.boxShadow || design.styles?.boxShadow || 'medium';
  const shadow = boxShadowMap[boxShadowValue] || boxShadowMap.medium;

  // Support both design.borderRadius and design.styles.borderRadius
  const borderRadius = design.borderRadius || design.styles?.borderRadius || '12px';

  const base = {
    fontFamily: fontStack,
    boxSizing: 'border-box',
    backgroundColor: design.colors?.background || '#ffffff',
    color: design.colors?.text || '#1a1a1a',
    borderRadius: borderRadius,
    boxShadow: shadow,
    maxWidth: '90vw',
    width: design.type === 'bar' ? '100%' : '420px'
  };

  if (isPreview) {
    // Preview mode: flows naturally in the editor canvas
    return {
      ...base,
      position: 'relative',
      margin: '0 auto'
    };
  }

  // Live mode: fixed positioning
  if (design.type === 'modal') {
    return {
      ...base,
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 2147483647 // Max z-index
    };
  }

  // Top bar positioning - always fixed to viewport for full width
  return {
    ...base,
    position: 'fixed', // Always fixed to viewport
    left: 0,
    right: 0,
    width: '100vw', // Explicit viewport width
    maxWidth: '100vw',
    borderRadius: 0,
    ...(design.position === 'top' ? { top: 0 } : { bottom: 0 }),
    zIndex: 2147483647
  };
}

/**
 * Overlay styles (only for modal in live mode)
 */
export function getOverlayStyles(config) {
  return {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: config.design?.colors?.overlay || 'rgba(0, 0, 0, 0.6)',
    zIndex: 2147483646
  };
}

/**
 * Content area styles
 */
export function getContentStyles(type) {
  if (type === 'bar') {
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 20px',
      gap: '16px',
      flexWrap: 'wrap'
    };
  }

  return {
    padding: '24px',
    textAlign: 'center'
  };
}

/**
 * Close button styles
 */
export function getCloseButtonStyles(config) {
  return {
    position: 'absolute',
    top: config.design?.type === 'bar' ? '50%' : '12px',
    right: '12px',
    transform: config.design?.type === 'bar' ? 'translateY(-50%)' : 'none',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    minWidth: '44px',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: config.design?.colors?.closeIcon || '#999999',
    borderRadius: '50%',
    transition: 'background-color 150ms ease'
  };
}

/**
 * Primary button styles
 */
export function getButtonStyles(config) {
  const { design } = config;
  const borderRadius = design.borderRadius || design.styles?.borderRadius || '8px';

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: fontStack,
    color: design.colors?.buttonText || '#ffffff',
    backgroundColor: design.colors?.buttonBg || '#000000',
    border: 'none',
    borderRadius: borderRadius,
    cursor: 'pointer',
    transition: 'opacity 150ms ease, transform 150ms ease',
    whiteSpace: 'nowrap'
  };
}

/**
 * Headline text styles
 */
export function getHeadlineStyles(type) {
  return {
    margin: type === 'bar' ? '0' : '0 0 12px 0',
    fontSize: type === 'bar' ? '16px' : '22px',
    fontWeight: '700',
    lineHeight: '1.3'
  };
}

/**
 * Body text styles
 */
export function getBodyStyles(type) {
  return {
    margin: type === 'bar' ? '0' : '0 0 20px 0',
    fontSize: type === 'bar' ? '14px' : '15px',
    lineHeight: '1.5',
    opacity: 0.85
  };
}

/**
 * Watermark styles
 */
export function getWatermarkStyles() {
  return {
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(0, 0, 0, 0.08)',
    fontSize: '11px',
    opacity: 0.5,
    textAlign: 'center'
  };
}

/**
 * Responsive styles as a CSS string
 * Supports: Desktop, Tablet (768px), Mobile (480px)
 * Cross-browser compatible
 */
export const responsiveStyles = `
  /* ============================================
   * BASE STYLES - All devices
   * ============================================ */
  .popup-container {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }

  .popup-headline.bar,
  .popup-body.bar {
    white-space: normal !important;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  /* ============================================
   * TABLET - max-width: 768px
   * ============================================ */
  @media (max-width: 768px) {
    .popup-container.modal {
      width: 90vw !important;
      max-width: 500px !important;
    }
    
    .popup-content.modal {
      padding: 22px !important;
    }
    
    .popup-headline.modal {
      font-size: 20px !important;
    }
    
    .popup-content.bar {
      flex-wrap: wrap !important;
      justify-content: center !important;
      gap: 10px !important;
      padding: 12px 50px 12px 16px !important;
    }
    
    .popup-headline.bar {
      font-size: 13px !important;
    }
    
    .popup-body.bar {
      font-size: 13px !important;
    }
    
    .popup-btn.bar {
      padding: 8px 14px !important;
      font-size: 12px !important;
    }
  }

  /* ============================================
   * MOBILE - max-width: 480px
   * ============================================ */
  @media (max-width: 480px) {
    .popup-container.modal {
      width: 95vw !important;
      max-width: none !important;
      margin: 0 auto !important;
    }
    
    .popup-content.modal {
      padding: 20px 16px !important;
    }
    
    .popup-headline.modal {
      font-size: 18px !important;
      margin-bottom: 10px !important;
    }
    
    .popup-body.modal {
      font-size: 14px !important;
      margin-bottom: 16px !important;
    }
    
    .popup-btn {
      width: 100% !important;
      padding: 14px 20px !important;
      font-size: 15px !important;
      min-height: 48px !important;
    }
    
    .popup-content.bar {
      flex-direction: column !important;
      align-items: center !important;
      text-align: center !important;
      padding: 14px 44px 14px 14px !important;
      gap: 8px !important;
    }
    
    .popup-headline.bar {
      font-size: 14px !important;
      line-height: 1.3 !important;
    }
    
    .popup-body.bar {
      font-size: 13px !important;
      line-height: 1.4 !important;
    }
    
    .popup-btn.bar {
      margin-top: 4px !important;
      padding: 10px 20px !important;
      font-size: 13px !important;
      min-height: 44px !important;
    }
    
    .popup-close-btn {
      min-width: 44px !important;
      min-height: 44px !important;
      right: 4px !important;
    }

    .popup-watermark {
      font-size: 10px !important;
      margin-top: 12px !important;
      padding-top: 10px !important;
    }
  }

  /* ============================================
   * VERY SMALL SCREENS - max-width: 360px
   * ============================================ */
  @media (max-width: 360px) {
    .popup-content.modal {
      padding: 16px 12px !important;
    }
    
    .popup-headline.modal {
      font-size: 16px !important;
    }
    
    .popup-body.modal {
      font-size: 13px !important;
    }
    
    .popup-headline.bar {
      font-size: 13px !important;
    }
    
    .popup-body.bar {
      font-size: 12px !important;
    }
  }
`;
