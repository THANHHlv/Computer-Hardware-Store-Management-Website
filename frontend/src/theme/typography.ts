/**
 * 📝 TYPOGRAPHY SYSTEM - Computer Shop E-commerce
 * International Clean Modern Typography with Tabular Numbers
 * Optimized for high legibility, clean aesthetics, and fluid scaling
 */

export const typography = {
  // ===== FONT FAMILY (Chuẩn tiếng Việt với Be Vietnam Pro & Inter) =====
  fontFamily: [
    '"Be Vietnam Pro"',
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    'sans-serif',
  ].join(','),
  
  // ===== HEADLINES =====
  h1: {
    fontFamily: '"Be Vietnam Pro", "Inter", sans-serif',
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.025em',
    '@media (max-width:600px)': {
      fontSize: '2rem',
    },
  },
  
  h2: {
    fontFamily: '"Be Vietnam Pro", "Inter", sans-serif',
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.25,
    letterSpacing: '-0.02em',
    '@media (max-width:600px)': {
      fontSize: '1.75rem',
    },
  },
  
  h3: {
    fontFamily: '"Be Vietnam Pro", "Inter", sans-serif',
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
    '@media (max-width:600px)': {
      fontSize: '1.25rem',
    },
  },
  
  h4: {
    fontFamily: '"Be Vietnam Pro", "Inter", sans-serif',
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.35,
    letterSpacing: '-0.005em',
  },
  
  h5: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.45,
  },
  
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.005em',
    color: 'text.secondary',
  },
  
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.57,
    letterSpacing: '0.005em',
    color: 'text.secondary',
  },
  
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.6,
    color: 'text.secondary',
  },
  
  button: {
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 1.75,
    letterSpacing: '0.01em',
    textTransform: 'none' as const,
  },
  
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.66,
    letterSpacing: '0.02em',
    color: 'text.secondary',
  },
  
  overline: {
    fontFamily: '"Be Vietnam Pro", sans-serif',
    fontSize: '0.75rem',
    fontWeight: 700,
    lineHeight: 2.66,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: 'primary.main',
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
      color: '#2563EB',
    },
    original: {
      fontFamily: '"JetBrains Mono", monospace',
      fontVariantNumeric: 'tabular-nums',
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.2,
      letterSpacing: '0em',
      textDecoration: 'line-through',
      color: '#94A3B8',
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
      fontSize: '0.95rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '0em',
    },
    code: {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
      color: '#94A3B8',
    },
    category: {
      fontFamily: '"Be Vietnam Pro", sans-serif',
      fontSize: '0.75rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '0.04em',
      textTransform: 'uppercase' as const,
      color: '#2563EB',
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
      color: '#64748B',
    },
    value: {
      fontFamily: '"JetBrains Mono", monospace',
      fontVariantNumeric: 'tabular-nums',
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '0em',
    },
  },
};

export type TypographySystem = typeof typography;
export type ShopTypographySystem = typeof shopTypography;
