/**
 * 🎨 THEME SYSTEM - Computer Shop E-commerce
 * International Clean & Bright Theme with Dynamic Mode Support
 * Standardized for modern international tech e-commerce (Apple, Best Buy, NZXT)
 */
import { createTheme, type ThemeOptions, type Theme } from '@mui/material/styles';
import { lightColors, darkColors } from './colors';
import { typography, shopTypography } from './typography';
import { components } from './components';

export const buildTheme = (mode: 'light' | 'dark' = 'light'): Theme => {
  const paletteColors = mode === 'light' ? lightColors : darkColors;

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: paletteColors.primary.main,
        light: paletteColors.primary.light,
        dark: paletteColors.primary.dark,
        contrastText: paletteColors.primary.contrastText,
      },
      secondary: {
        main: paletteColors.secondary.main,
        light: paletteColors.secondary.light,
        dark: paletteColors.secondary.dark,
        contrastText: paletteColors.secondary.contrastText,
      },
      error: {
        main: paletteColors.error.main,
        light: paletteColors.error.light,
        dark: paletteColors.error.dark,
        contrastText: paletteColors.error.contrastText,
      },
      warning: {
        main: paletteColors.warning.main,
        light: paletteColors.warning.light,
        dark: paletteColors.warning.dark,
        contrastText: paletteColors.warning.contrastText,
      },
      info: {
        main: paletteColors.info.main,
        light: paletteColors.info.light,
        dark: paletteColors.info.dark,
        contrastText: paletteColors.info.contrastText,
      },
      success: {
        main: paletteColors.success.main,
        light: paletteColors.success.light,
        dark: paletteColors.success.dark,
        contrastText: paletteColors.success.contrastText,
      },
      grey: paletteColors.grey,
      background: {
        default: paletteColors.background.default,
        paper: paletteColors.background.paper,
      },
      text: {
        primary: paletteColors.text.primary,
        secondary: paletteColors.text.secondary,
        disabled: paletteColors.text.disabled,
      },
      divider: paletteColors.divider,
      common: paletteColors.common,
    },
    
    // Typography system
    typography,
    
    // Responsive breakpoints (optimized for modern e-commerce)
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
    
    spacing: 8,
    shape: {
      borderRadius: 12,
    },
    
    // Modern ambient diffusion shadows
    shadows: (() => {
      const s = mode === 'light' ? [
        'none',
        '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.06)',
        '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
        '0 20px 25px -5px rgba(15, 23, 42, 0.09), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
        '0 30px 60px -12px rgba(15, 23, 42, 0.18)',
        '0 35px 70px -15px rgba(15, 23, 42, 0.22)',
      ] : [
        'none',
        '0 1px 3px rgba(0, 0, 0, 0.3)',
        '0 3px 6px rgba(0, 0, 0, 0.35)',
        '0 10px 20px rgba(0, 0, 0, 0.4)',
        '0 14px 28px rgba(0, 0, 0, 0.45)',
        '0 19px 38px rgba(0, 0, 0, 0.5)',
        '0 24px 48px rgba(0, 0, 0, 0.55)',
        '0 30px 60px rgba(0, 0, 0, 0.6)',
        '0 36px 72px rgba(0, 0, 0, 0.65)',
      ];
      while (s.length < 25) s.push(s[s.length - 1]);
      return s as any;
    })(),
    
    // Silky smooth transitions (cubic-bezier 0.16, 1, 0.3, 1)
    transitions: {
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
      easing: {
        easeInOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
        easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
    },
    
    zIndex: {
      mobileStepper: 1000,
      fab: 1050,
      speedDial: 1050,
      appBar: 1100,
      drawer: 1200,
      modal: 1300,
      snackbar: 1400,
      tooltip: 1500,
    },
  };

  const baseTheme = createTheme(themeOptions);
  return createTheme({
    ...baseTheme,
    components: components(baseTheme),
  });
};

// Default theme is International Clean Light
export const lightTheme = buildTheme('light');
export const darkTheme = buildTheme('dark');

export const theme = lightTheme;

// Extended shop tokens
export const createShopTheme = (mode: 'light' | 'dark' = 'light') => {
  const currentTheme = mode === 'light' ? lightTheme : darkTheme;
  const paletteColors = mode === 'light' ? lightColors : darkColors;

  return {
    ...currentTheme,
    shop: {
      productCard: {
        width: 280,
        height: 400,
        imageHeight: 200,
        padding: 16,
        borderRadius: 14,
      },
      categoryColors: paletteColors.shop.categories,
      stockColors: paletteColors.shop.stock,
      priceStyles: shopTypography.price,
      productStyles: shopTypography.product,
      statusStyles: shopTypography.status,
      specStyles: shopTypography.spec,
      layout: {
        headerHeight: 68,
        sidebarWidth: 280,
        footerHeight: 200,
        containerMaxWidth: 1200,
        productGridGap: 20,
      },
      animations: {
        cardHover: 220,
        buttonHover: 160,
        pageTransition: 280,
        fadeIn: 240,
      },
    },
    utils: {
      formatPrice: (price: number, currency = 'VND') => {
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(price);
      },
      calculateDiscount: (originalPrice: number, salePrice: number) => {
        return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
      },
      getStockColor: (status: 'inStock' | 'lowStock' | 'outStock' | 'discontinued') => {
        return paletteColors.shop.stock[status];
      },
      getCategoryColor: (category: string) => {
        const categoryKey = category.toLowerCase().replace(/\s+/g, '');
        return (paletteColors.shop.categories as any)[categoryKey] || paletteColors.grey[500];
      },
      responsive: {
        mobile: `@media (max-width: ${currentTheme.breakpoints.values.sm}px)`,
        tablet: `@media (max-width: ${currentTheme.breakpoints.values.md}px)`,
        desktop: `@media (min-width: ${currentTheme.breakpoints.values.lg}px)`,
        largeDesktop: `@media (min-width: ${currentTheme.breakpoints.values.xl}px)`,
      },
      spacing: {
        section: currentTheme.spacing(8),
        component: currentTheme.spacing(4),
        element: currentTheme.spacing(2),
        tight: currentTheme.spacing(1),
      },
    },
  };
};

export const shopTheme = createShopTheme('light');

export { colors, lightColors, darkColors } from './colors';
export { typography, shopTypography } from './typography';
export { components } from './components';

export default shopTheme;

export type ShopTheme = typeof shopTheme;

declare module '@mui/material/styles' {
  interface Theme {
    shop?: typeof shopTheme.shop;
    utils?: typeof shopTheme.utils;
  }
  
  interface ThemeOptions {
    shop?: Partial<typeof shopTheme.shop>;
    utils?: Partial<typeof shopTheme.utils>;
  }
}
