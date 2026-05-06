import { createTheme, responsiveFontSizes } from '@mui/material/styles'
import type {} from '@mui/lab/themeAugmentation'
declare module '@mui/material/styles/createPalette' {
  interface PaletteOptions {
    red?: PaletteColorOptions
  }
}

export const grey = {
  900: '#1F2A44', // Navy — primary text, headers
  700: '#2F4A6D', // Steel Blue — secondary headings
  600: '#5A6B7A', // Gray — secondary text, labels
  500: '#B0BEC5', // Thin borders, placeholder text
  400: '#C8D0D7', // Header accent, page separator
  300: '#E6E9ED', // Light Gray — page background, cards
  100: '#F2F4F6', // Order summary background
  50: '#FAFAFA', // Secondary button background
}

export const red = {
  900: '#bb2500',
  // wishlist color
  700: '#e13b0e',
  600: '#ef4214',
  500: '#fa4818',
  300: '#fc825e',
  100: '#fec9b9',
  50: '#fbe8e6',
}

const buttonStyleOverrides = {
  root: {
    textTransform: 'capitalize' as any,

    '&:hover': {
      boxShadow: 'none',
    },
  },
  containedPrimary: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
    ...(ownerState.disabled && {
      backgroundColor: `${theme.palette.primary.light} !important`,
      color: `${theme.palette.common.white} !important`,
    }),
  }),
  containedSecondary: {
    backgroundColor: grey[50],
    color: '#1F2A44',
    borderColor: grey[500],
    borderWidth: 1,
    borderStyle: 'solid',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: grey[300],
      color: '#1F2A44',
    },
  },
  containedInherit: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderStyle: 'solid',
    boxShadow: 'none',
    color: '#fff',
    '&:hover': {
      backgroundColor: grey[900],
    },
  },
}
// Create a base theme instance and define the basic design options
let theme = createTheme({
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h1: {
      fontSize: '1.75rem', // 28px
      fontWeight: 'bold',
      '@media (max-width:600px)': {
        fontSize: '1.5rem', // 24px
      },
    },
    h2: {
      fontSize: '1.5rem', // 24px
      fontWeight: 'bold',
      '@media (max-width:600px)': {
        fontSize: '1.25rem', // 20px
      },
    },
    h3: {
      fontSize: '1.25rem', // 20px
      '@media (max-width:600px)': {
        fontSize: '1rem', // 16px
      },
    },
    subtitle1: {
      fontSize: '1.125rem', // 18px
    },
    subtitle2: {
      fontSize: '1rem', // 16px
    },
    // body1: {
    //   fontSize: '1rem', // 16px
    // },
    // body2: {
    //   fontSize: '0.875rem', // 14px
    // },
  },
  palette: {
    primary: {
      main: '#1F2A44', // Navy
      dark: '#2F4A6D', // Steel Blue
      light: '#8D9CB5', // Muted navy for disabled states
    },
    secondary: {
      main: '#F25C05', // Orange Accent
      light: '#FFFFFF',
    },
    background: {
      default: '#E6E9ED', // Light Gray
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F2A44', // Navy
      secondary: '#5A6B7A', // Gray
    },
    warning: {
      main: '#F25C05', // Orange (reuse accent for warnings)
    },
    error: {
      main: '#e42d00',
    },
    grey: { ...grey },
    red: { ...red },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        ...buttonStyleOverrides,
      },
    },
    MuiLoadingButton: {
      styleOverrides: {
        ...buttonStyleOverrides,
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          zIndex: 2000,
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          '& .Mui-selected': {
            backgroundColor: `${grey[900]} !important`,
            color: '#FFFFFF',
          },
        },
      },
    },
  },
})
// compose theme (place theme options that depend on the base theme here)
theme = createTheme(theme)
export default responsiveFontSizes(theme)
