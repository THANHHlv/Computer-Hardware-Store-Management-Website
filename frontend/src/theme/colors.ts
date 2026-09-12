/**
 * 🎨 COLOR PALETTE - Computer Shop E-commerce
 * Gaming Tech Dark Mode & Cyber Accent Palette
 * Tuân thủ ui-ux-pro-max design system MASTER.md
 */

export const colors = {
  // ===== PRIMARY PALETTE (Cyber Cyan / Electric Accent) =====
  primary: {
    main: '#00F0FF',        // Cyber Cyan - Main brand accent
    light: '#38BDF8',       // Sky 400
    dark: '#0284C7',        // Sky 600
    contrastText: '#0A0E17',// High contrast dark text on cyan
    '50': '#082f49',
    '100': '#0c4a6e',
    '200': '#0369a1',
    '300': '#0284c7',
    '400': '#38bdf8',
    '500': '#00F0FF',
    '600': '#00d2df',
    '700': '#00b5c0',
    '800': '#00858e',
    '900': '#00585f',
  },

  // ===== SECONDARY PALETTE (Matrix Emerald / Conversion CTA) =====
  secondary: {
    main: '#10B981',        // Emerald 500 - Buy Now / Cart action
    light: '#34D399',       // Emerald 400
    dark: '#059669',        // Emerald 600
    contrastText: '#0A0E17',
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

  // ===== SEMANTIC COLORS =====
  error: {
    main: '#EF4444',        // Red 500
    light: '#F87171',
    dark: '#DC2626',
    contrastText: '#FFFFFF',
    '50': 'rgba(239, 68, 68, 0.1)',
    '100': 'rgba(239, 68, 68, 0.2)',
  },

  warning: {
    main: '#F59E0B',        // Amber 500
    light: '#FBBF24',
    dark: '#D97706',
    contrastText: '#0A0E17',
    '50': 'rgba(245, 158, 11, 0.1)',
    '100': 'rgba(245, 158, 11, 0.2)',
  },

  info: {
    main: '#00F0FF',        // Cyan
    light: '#67E8F9',
    dark: '#0891B2',
    contrastText: '#0A0E17',
    '50': 'rgba(0, 240, 255, 0.1)',
    '100': 'rgba(0, 240, 255, 0.2)',
  },

  success: {
    main: '#10B981',        // Emerald 500
    light: '#34D399',
    dark: '#059669',
    contrastText: '#0A0E17',
    '50': 'rgba(16, 185, 129, 0.1)',
    '100': 'rgba(16, 185, 129, 0.2)',
  },

  // ===== NEUTRAL COLORS (Dark Slate Tones) =====
  grey: {
    50: '#0A0E17',          // Base deep background
    100: '#0F172A',         // Slate 900
    200: '#131B2E',         // Dark card surface
    300: '#1E293B',         // Muted surface / borders
    400: '#334155',         // Dark borders
    500: '#64748B',         // Muted text
    600: '#94A3B8',         // Secondary text
    700: '#CBD5E1',         // Light gray text
    800: '#E2E8F0',         // Bright gray
    900: '#F8FAFC',         // White headline text
  },

  // ===== BACKGROUND COLORS =====
  background: {
    default: '#0A0E17',     // Main deep dark background
    paper: '#131B2E',       // Card / surface background
    neutral: '#1E293B',     // Alternative container
  },

  // ===== TEXT COLORS =====
  text: {
    primary: '#F8FAFC',     // Crisp white / silver
    secondary: '#94A3B8',   // Slate secondary
    disabled: '#475569',    // Disabled text
    hint: '#64748B',        // Hint text
  },

  // ===== COMPUTER SHOP SPECIFIC COLORS =====
  shop: {
    price: {
      original: '#64748B',  // Original price
      sale: '#EF4444',      // Urgent sale price
      discount: '#10B981',  // Discount badge
    },
    
    stock: {
      inStock: '#10B981',   // In stock
      lowStock: '#F59E0B',  // Low stock
      outStock: '#EF4444',  // Out of stock
      discontinued: '#64748B',
    },
    
    rating: {
      star: '#FBBF24',      // Star yellow
      empty: '#334155',     // Empty star
    },
    
    categories: {
      cpu: '#FF4655',       // Cyber Red
      gpu: '#00F0FF',       // Cyber Cyan
      ram: '#3B82F6',       // Electric Blue
      storage: '#A855F7',   // Purple
      motherboard: '#64748B',
      psu: '#EAB308',       // Gold
      cooling: '#06B6D4',   // Aqua
      case: '#475569',
    },
  },

  // ===== COMMON COLORS =====
  common: {
    black: '#000000',
    white: '#ffffff',
  },

  // ===== DIVIDER COLOR =====
  divider: 'rgba(255, 255, 255, 0.08)',

  // Legacy aliases
  categories: {
    cpu: '#FF4655',
    gpu: '#00F0FF',
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

export type ColorPalette = typeof colors;
