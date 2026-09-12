/**
 * 📝 TYPOGRAPHY SYSTEM - Computer Shop E-commerce
 * Gaming Tech Dark Mode & Tabular Numbers
 * Tuân thủ ui-ux-pro-max design system MASTER.md
 */

export const typography = {
  // ===== FONT FAMILY =====
  fontFamily: [
    'Inter',
    'Space Grotesk',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    'sans-serif',
  ].join(','),
  
  // ===== HEADLINES =====
  h1: {
    fontFamily: '"Space Grotesk", "Inter", sans-serif',
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.025em',
    color: '#F8FAFC',
    '@media (max-width:600px)': {
      fontSize: '2rem',
    },
  },
  
  h2: {
    fontFamily: '"Space Grotesk", "Inter", sans-serif',
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.25,
    letterSpacing: '-0.02em',
    color: '#F8FAFC',
    '@media (max-width:600px)': {
      fontSize: '1.75rem',
    },
  },
  
  h3: {
    fontFamily: '"Space Grotesk", "Inter", sans-serif',
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
    color: '#F8FAFC',
    '@media (max-width:600px)': {
      fontSize: '1.25rem',
    },
  },
  
  h4: {
    fontFamily: '"Space Grotesk", "Inter", sans-serif',
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.35,
    letterSpacing: '-0.005em',
    color: '#F8FAFC',
  },
  
  h5: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.4,
    color: '#F8FAFC',
  },
  
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.45,
    color: '#F8FAFC',
  },
  
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.005em',
    color: '#94A3B8',
  },
  
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.57,
    letterSpacing: '0.005em',
    color: '#94A3B8',
  },
  
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.6,
    color: '#F8FAFC',
  },
  
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.6,
    color: '#94A3B8',
  },
  
  button: {
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 1.75,
    letterSpacing: '0.02em',
    textTransform: 'none' as const,
  },
  
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.66,
    letterSpacing: '0.02em',
    color: '#64748B',
  },
  
  overline: {
    fontFamily: '"Space Grotesk", sans-serif',
    fontSize: '0.75rem',
    fontWeight: 600,
    lineHeight: 2.66,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#00F0FF',
  },
};

export const shopTypography = {
  price: {
    current: {
      fontFamily: '"JetBrains Mono", monospace',
      fontVariantNumeric: 'tabular-nums',
      fontSize: '1.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      color: '#00F0FF',
    },
    original: {
      fontFamily: '"JetBrains Mono", monospace',
      fontVariantNumeric: 'tabular-nums',
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.2,
      letterSpacing: '0em',
      textDecoration: 'line-through',
      color: '#64748B',
    },
    discount: {
      fontFamily: '"JetBrains Mono", monospace',
      fontVariantNumeric: 'tabular-nums',
      fontSize: '0.75rem',
      fontWeight: 700,
      lineHeight: 1,
      letterSpacing: '0.02em',
      color: '#10B981',
    },
  },
  
  product: {
    name: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '0em',
      color: '#F8FAFC',
    },
    code: {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
      color: '#64748B',
    },
    category: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '0.04em',
      textTransform: 'uppercase' as const,
      color: '#00F0FF',
    },
  },
  
  status: {
    stock: {
      fontSize: '0.8125rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '0.01em',
    },
    badge: {
      fontSize: '0.75rem',
      fontWeight: 700,
      lineHeight: 1,
      letterSpacing: '0.03em',
      textTransform: 'uppercase' as const,
    },
  },
  
  spec: {
    label: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0em',
      color: '#94A3B8',
    },
    value: {
      fontFamily: '"JetBrains Mono", monospace',
      fontVariantNumeric: 'tabular-nums',
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0em',
      color: '#F8FAFC',
    },
  },
};

export type TypographySystem = typeof typography;
export type ShopTypographySystem = typeof shopTypography;
