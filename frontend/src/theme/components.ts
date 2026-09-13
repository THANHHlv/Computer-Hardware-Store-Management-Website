/**
 * 🎨 COMPONENT THEME OVERRIDES - Computer Shop E-commerce
 * International Clean & Bright Theme with Ultra-Smooth Micro-interactions
 * Standardized for Apple/NZXT/Framework high-end shopping experience
 */

import { alpha, type Theme, type Components } from '@mui/material/styles';

export const components = (theme: Theme): Components => ({
  // ===== BUTTONS =====
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.875rem',
        padding: theme.spacing(1, 2.2),
        transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform, box-shadow, background-color',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
          transform: 'translateY(-1px)',
        },
        '&:active': {
          transform: 'scale(0.98)',
        },
      },
      contained: {
        boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.08)',
        '&:hover': {
          boxShadow: '0 6px 20px -4px rgba(15, 23, 42, 0.16)',
          transform: 'translateY(-2px)',
        },
      },
      containedPrimary: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        fontWeight: 600,
        '&:hover': {
          backgroundColor: theme.palette.primary.dark,
          boxShadow: `0 8px 24px -4px ${alpha(theme.palette.primary.main, 0.45)}`,
        },
      },
      containedSecondary: {
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.secondary.contrastText,
        fontWeight: 600,
        '&:hover': {
          backgroundColor: theme.palette.secondary.dark,
          boxShadow: `0 8px 24px -4px ${alpha(theme.palette.secondary.main, 0.45)}`,
        },
      },
      outlined: {
        borderWidth: 1.5,
        borderColor: theme.palette.divider,
        color: theme.palette.text.primary,
        '&:hover': {
          borderWidth: 1.5,
          borderColor: theme.palette.primary.main,
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          transform: 'translateY(-1px)',
        },
      },
      text: {
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.06),
        },
      },
      sizeLarge: {
        padding: theme.spacing(1.4, 3.2),
        fontSize: '0.95rem',
        borderRadius: 12,
      },
      sizeSmall: {
        padding: theme.spacing(0.6, 1.6),
        fontSize: '0.8rem',
        borderRadius: 8,
      },
    },
  },

  // ===== CARDS =====
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 14,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.palette.mode === 'light'
          ? '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 6px 16px -4px rgba(15, 23, 42, 0.06)'
          : '0 4px 20px rgba(0, 0, 0, 0.4)',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 240ms cubic-bezier(0.16, 1, 0.3, 1), border-color 240ms ease',
        willChange: 'transform, box-shadow',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.3),
        },
      },
    },
  },

  // ===== ICON BUTTONS =====
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        transition: 'all 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          transform: 'scale(1.06)',
        },
        '&:active': {
          transform: 'scale(0.95)',
        },
      },
    },
  },

  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: theme.spacing(2.2),
        '&:last-child': {
          paddingBottom: theme.spacing(2.2),
        },
      },
    },
  },

  // ===== TEXT FIELDS =====
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 10,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          transition: 'border-color 200ms ease, box-shadow 200ms ease',
          '& fieldset': {
            borderColor: theme.palette.divider,
          },
          '&:hover fieldset': {
            borderColor: theme.palette.primary.light,
          },
          '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
            borderWidth: 2,
          },
          '&.Mui-focused': {
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
          },
        },
        '& .MuiInputLabel-root': {
          '&.Mui-focused': {
            color: theme.palette.primary.main,
          },
        },
      },
    },
  },

  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        '& fieldset': {
          borderColor: theme.palette.divider,
        },
        '&:hover fieldset': {
          borderColor: theme.palette.primary.light,
        },
        '&.Mui-focused fieldset': {
          borderColor: theme.palette.primary.main,
          borderWidth: 2,
        },
        '&.Mui-focused': {
          boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
        },
      },
    },
  },

  // ===== APP BAR =====
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: alpha(theme.palette.background.paper, 0.85),
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        color: theme.palette.text.primary,
        boxShadow: theme.palette.mode === 'light'
          ? '0 1px 3px 0 rgba(15, 23, 42, 0.05)'
          : '0 2px 10px rgba(0, 0, 0, 0.5)',
        borderBottom: `1px solid ${theme.palette.divider}`,
      },
    },
  },

  // ===== TOOLBAR =====
  MuiToolbar: {
    styleOverrides: {
      root: {
        minHeight: '68px !important',
        padding: theme.spacing(0, 2),
        [theme.breakpoints.up('sm')]: {
          padding: theme.spacing(0, 3),
        },
      },
    },
  },

  // ===== CHIPS =====
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontSize: '0.75rem',
        fontWeight: 600,
        height: 28,
        transition: 'all 160ms ease',
      },
      filled: {
        '&.MuiChip-colorPrimary': {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.common.white,
        },
        '&.MuiChip-colorSecondary': {
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.common.white,
        },
      },
      outlined: {
        borderWidth: 1.5,
        borderColor: theme.palette.divider,
      },
    },
  },

  // ===== PAPER =====
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        backgroundImage: 'none',
      },
      outlined: {
        border: `1px solid ${theme.palette.divider}`,
      },
      elevation1: {
        boxShadow: theme.palette.mode === 'light'
          ? '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 4px 12px -2px rgba(15, 23, 42, 0.05)'
          : '0 2px 8px rgba(0, 0, 0, 0.3)',
      },
      elevation2: {
        boxShadow: theme.palette.mode === 'light'
          ? '0 4px 16px -2px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.04)'
          : '0 4px 16px rgba(0, 0, 0, 0.4)',
      },
      elevation4: {
        boxShadow: theme.palette.mode === 'light'
          ? '0 12px 32px -4px rgba(15, 23, 42, 0.1), 0 4px 8px -2px rgba(15, 23, 42, 0.04)'
          : '0 8px 24px rgba(0, 0, 0, 0.5)',
      },
    },
  },

  // ===== DIALOGS =====
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 16,
        boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.18)',
        border: `1px solid ${theme.palette.divider}`,
        padding: 0,
      },
    },
  },

  MuiDialogTitle: {
    styleOverrides: {
      root: {
        fontSize: '1.25rem',
        fontWeight: 700,
        padding: theme.spacing(2.5, 3, 2),
        borderBottom: `1px solid ${theme.palette.divider}`,
      },
    },
  },

  MuiDialogContent: {
    styleOverrides: {
      root: {
        padding: theme.spacing(3),
      },
    },
  },

  MuiDialogActions: {
    styleOverrides: {
      root: {
        padding: theme.spacing(2, 3, 2.5),
        borderTop: `1px solid ${theme.palette.divider}`,
        gap: theme.spacing(1),
      },
    },
  },

  // ===== DRAWER =====
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRadius: 0,
        borderRight: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      },
    },
  },

  // ===== TABS =====
  MuiTabs: {
    styleOverrides: {
      root: {
        borderBottom: `1px solid ${theme.palette.divider}`,
      },
      indicator: {
        backgroundColor: theme.palette.primary.main,
        height: 3,
        borderRadius: '3px 3px 0 0',
      },
    },
  },

  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontSize: '0.875rem',
        fontWeight: 600,
        minHeight: 48,
        color: theme.palette.text.secondary,
        transition: 'color 180ms ease, background-color 180ms ease',
        '&.Mui-selected': {
          color: theme.palette.primary.main,
        },
        '&:hover': {
          color: theme.palette.primary.main,
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
        },
      },
    },
  },

  // ===== LISTS =====
  MuiListItem: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        margin: theme.spacing(0.25, 0),
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
        },
      },
    },
  },

  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        transition: 'background-color 150ms ease',
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
        },
        '&.Mui-selected': {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          color: theme.palette.primary.main,
          fontWeight: 600,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
          },
        },
      },
    },
  },

  // ===== BADGES =====
  MuiBadge: {
    styleOverrides: {
      badge: {
        fontSize: '0.75rem',
        fontWeight: 700,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      },
      colorPrimary: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
      },
      colorSecondary: {
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.common.white,
      },
      colorError: {
        backgroundColor: theme.palette.error.main,
        color: theme.palette.common.white,
      },
    },
  },

  // ===== ALERTS =====
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        fontSize: '0.875rem',
        fontWeight: 500,
      },
    },
  },

  // ===== SKELETON =====
  MuiSkeleton: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        backgroundColor: theme.palette.mode === 'light' ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.08)',
      },
      rectangular: {
        borderRadius: 10,
      },
    },
  },
});
