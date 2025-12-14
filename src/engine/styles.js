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

  if (type === 'top_bar') {
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
    width: design.type === 'top_bar' ? '100%' : '420px'
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
  if (type === 'top_bar') {
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
    top: config.design?.type === 'top_bar' ? '50%' : '12px',
    right: '12px',
    transform: config.design?.type === 'top_bar' ? 'translateY(-50%)' : 'none',
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
    margin: type === 'top_bar' ? '0' : '0 0 12px 0',
    fontSize: type === 'top_bar' ? '16px' : '22px',
    fontWeight: '700',
    lineHeight: '1.3'
  };
}

/**
 * Body text styles
 */
export function getBodyStyles(type) {
  return {
    margin: type === 'top_bar' ? '0' : '0 0 20px 0',
    fontSize: type === 'top_bar' ? '14px' : '15px',
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
 * Mobile responsive styles as a CSS string
 */
export const responsiveStyles = `
  @media (max-width: 480px) {
    .popup-container.modal {
      width: 95vw !important;
      max-width: none !important;
    }
    
    .popup-content.modal {
      padding: 20px !important;
    }
    
    .popup-headline.modal {
      font-size: 18px !important;
    }
    
    .popup-body.modal {
      font-size: 14px !important;
    }
    
    .popup-content.top_bar {
      flex-direction: column !important;
      text-align: center !important;
      padding: 16px !important;
    }
    
    .popup-text-container.top_bar {
      margin-right: 0 !important;
    }
  }
`;
