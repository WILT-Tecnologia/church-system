import { GlobalStyles as MUIGlobalStyles, useTheme } from '@mui/material';

const GlobalStyles = () => {
  const theme = useTheme();

  return (
    <MUIGlobalStyles
      styles={{
        '*': {
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
          outline: 'none',
        },
        html: {
          height: '100%',
          width: '100%',
          scrollBehavior: 'smooth',
        },
        body: {
          backgroundColor: theme.palette.background.default,
        },
        '::selection': {
          backgroundColor: theme.palette.primary.light,
          color: theme.palette.text.disabled,
        },
        a: {
          textDecoration: 'none',
          color: 'inherit',
        },
      }}
    />
  );
};

export default GlobalStyles;
