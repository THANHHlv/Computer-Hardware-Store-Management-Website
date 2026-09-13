/**
 * 🎨 COLOR PALETTE - Computer Shop E-commerce
 * International Clean & Bright Theme + Obsidian Slate Dark Mode
 * Standardized for modern international tech e-commerce (Apple, Best Buy, NZXT, Framework)
 */

// ===== LIGHT PALETTE (Default - International Clean & Bright) =====
export const lightColors = {
  primary: {
    main: '#2563EB',        // Electric Sapphire Blue - Modern international tech brand
    light: '#3B82F6',       // Blue 500
    dark: '#1D4ED8',        // Blue 700
    contrastText: '#FFFFFF',
    '50': '#EFF6FF',
    '100': '#DBEAFE',
    '200': '#BFDBFE',
    '300': '#93C5FD',
    '400': '#60A5FA',
    '500': '#3B82F6',
    '600': '#2563EB',
    '700': '#1D4ED8',
    '800': '#1E40AF',
    '900': '#1E3A8A',
  },

  secondary: {
    main: '#10B981',        // Emerald Mint - Conversion CTA (Buy Now / Add to Cart)
    light: '#34D399',       // Emerald 400
    dark: '#059669',        // Emerald 600
    contrastText: '#FFFFFF',
    '50': '#ECFDF5',
    '100': '#D1FAE5',
    '200': '#A7F3D0',
    '300': '#6EE7B7',
    '400': '#34D399',
    '500': '#10B981',
    '600': '#059669',
    '700': '#047857',
    '800': '#065F46',
    '900': '#064E3B',
  },

  error: {
    main: '#EF4444',        // Red 500
    light: '#F87171',
    dark: '#DC2626',
    contrastText: '#FFFFFF',
    '50': 'rgba(239, 68, 68, 0.08)',
    '100': 'rgba(239, 68, 68, 0.16)',
  },

  warning: {
    main: '#F59E0B',        // Amber 500
    light: '#FBBF24',
    dark: '#D97706',
    contrastText: '#FFFFFF',
    '50': 'rgba(245, 158, 11, 0.08)',
    '100': 'rgba(245, 158, 11, 0.16)',
  },

  info: {
    main: '#0284C7',        // Sky 600
    light: '#38BDF8',
    dark: '#0369A1',
    contrastText: '#FFFFFF',
    '50': 'rgba(2, 132, 199, 0.08)',
    '100': 'rgba(2, 132, 199, 0.16)',
  },

  success: {
    main: '#10B981',        // Emerald 500
    light: '#34D399',
    dark: '#059669',
    contrastText: '#FFFFFF',
    '50': 'rgba(16, 185, 129, 0.08)',
    '100': 'rgba(16, 185, 129, 0.16)',
  },

  grey: {
    50: '#F8FAFC',          // Slate 50 - Base background
    100: '#F1F5F9',         // Slate 100 - Sub-surface
    200: '#E2E8F0',         // Slate 200 - Borders
    300: '#CBD5E1',         // Slate 300 - Input borders
    400: '#94A3B8',         // Slate 400 - Placeholder & disabled
    500: '#64748B',         // Slate 500 - Secondary text
    600: '#475569',         // Slate 600 - Body secondary
    700: '#334155',         // Slate 700 - Body primary
    800: '#1E293B',         // Slate 800 - Dark slate
    900: '#0F172A',         // Slate 900 - Headings & deep text
  },

  background: {
    default: '#F8FAFC',     // Modern luminous canvas
    paper: '#FFFFFF',       // Pure white elevated cards
    neutral: '#F1F5F9',     // Muted section background
  },

  text: {
    primary: '#0F172A',     // Slate 900 - High contrast WCAG AAA
    secondary: '#475569',   // Slate 600 - Elegant reading text
    disabled: '#94A3B8',    // Slate 400
    hint: '#64748B',        // Slate 500
  },

  divider: 'rgba(15, 23, 42, 0.08)',

  common: {
    black: '#000000',
    white: '#FFFFFF',
  },

  shop: {
    price: {
      original: '#94A3B8',
      sale: '#E11D48',      // Rose 600 - vibrant, urgent sale
      discount: '#059669',  // Emerald 600
    },
    stock: {
      inStock: '#10B981',
      lowStock: '#F59E0B',
      outStock: '#EF4444',
      discontinued: '#94A3B8',
    },
    rating: {
      star: '#F59E0B',
      empty: '#CBD5E1',
    },
    categories: {
      cpu: '#EF4444',
      gpu: '#2563EB',
      ram: '#0EA5E9',
      storage: '#8B5CF6',
      motherboard: '#475569',
      psu: '#F59E0B',
      cooling: '#06B6D4',
      case: '#64748B',
    },
  },

  // Legacy aliases
  categories: {
    cpu: '#EF4444',
    gpu: '#2563EB',
    ram: '#0EA5E9',
    storage: '#8B5CF6',
    motherboard: '#475569',
    psu: '#F59E0B',
    cooling: '#06B6D4',
    case: '#64748B',
  },
  status: {
    inStock: '#10B981',
    lowStock: '#F59E0B',
    outOfStock: '#EF4444',
    discontinued: '#94A3B8',
  },
} as const;

// ===== DARK PALETTE (Obsidian Slate) =====
export const darkColors = {
  primary: {
    main: '#38BDF8',        // Sky 400 - Vibrant on dark
    light: '#7DD3FC',
    dark: '#0284C7',
    contrastText: '#0B0F19',
    '50': '#082f49',
    '100': '#0c4a6e',
    '200': '#0369a1',
    '300': '#0284c7',
    '400': '#38bdf8',
    '500': '#38BDF8',
    '600': '#0284c7',
    '700': '#0369a1',
    '800': '#0c4a6e',
    '900': '#082f49',
  },

  secondary: {
    main: '#10B981',
    light: '#34D399',
    dark: '#059669',
    contrastText: '#0B0F19',
    '50': '#064e3b',
    '100': '#047857',
    '200': '#059669',
    '300': '#10b981',
    '400': '#34d399',
    '500': '#10B981',
    '600': '#059669',
    '700': '#047857',
    '800': '#065f46',
    '900': '#064e3b',
  },

  error: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
    contrastText: '#FFFFFF',
    '50': 'rgba(239, 68, 68, 0.1)',
    '100': 'rgba(239, 68, 68, 0.2)',
  },

  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
    contrastText: '#0B0F19',
    '50': 'rgba(245, 158, 11, 0.1)',
    '100': 'rgba(245, 158, 11, 0.2)',
  },

  info: {
    main: '#38BDF8',
    light: '#7DD3FC',
    dark: '#0284C7',
    contrastText: '#0B0F19',
    '50': 'rgba(56, 189, 248, 0.1)',
    '100': 'rgba(56, 189, 248, 0.2)',
  },

  success: {
    main: '#10B981',
    light: '#34D399',
    dark: '#059669',
    contrastText: '#0B0F19',
    '50': 'rgba(16, 185, 129, 0.1)',
    '100': 'rgba(16, 185, 129, 0.2)',
  },

  grey: {
    50: '#0B0F19',          // Deep obsidian base
    100: '#111827',         // Slate 900
    200: '#1E293B',         // Dark card surface
    300: '#334155',         // Muted surface / borders
    400: '#475569',         // Dark borders
    500: '#64748B',         // Muted text
    600: '#94A3B8',         // Secondary text
    700: '#CBD5E1',         // Light gray text
    800: '#E2E8F0',         // Bright gray
    900: '#F8FAFC',         // Crisp white headline text
  },

  background: {
    default: '#0B0F19',     // Obsidian slate background
    paper: '#111827',       // Dark card surface
    neutral: '#1E293B',     // Dark neutral container
  },

  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    disabled: '#475569',
    hint: '#64748B',
  },

  divider: 'rgba(255, 255, 255, 0.08)',

  common: {
    black: '#000000',
    white: '#FFFFFF',
  },

  shop: {
    price: {
      original: '#64748B',
      sale: '#EF4444',
      discount: '#10B981',
    },
    stock: {
      inStock: '#10B981',
      lowStock: '#F59E0B',
      outStock: '#EF4444',
      discontinued: '#64748B',
    },
    rating: {
      star: '#FBBF24',
      empty: '#334155',
    },
    categories: {
      cpu: '#FF4655',
      gpu: '#38BDF8',
      ram: '#3B82F6',
      storage: '#A855F7',
      motherboard: '#64748B',
      psu: '#EAB308',
      cooling: '#06B6D4',
      case: '#475569',
    },
  },

  categories: {
    cpu: '#FF4655',
    gpu: '#38BDF8',
    ram: '#3B82F6',
    storage: '#A855F7',
    motherboard: '#64748B',
    psu: '#EAB308',
    cooling: '#06B6D4',
    case: '#475569',
  },
  status: {
    inStock: '#10B981',
    lowStock: '#F59E0B',
    outOfStock: '#EF4444',
    discontinued: '#64748B',
  },
} as const;

// Default exported colors is LIGHT palette for luminous international look
export const colors = lightColors;

export type ColorPalette = typeof lightColors;
