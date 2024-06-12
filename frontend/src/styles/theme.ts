import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0393BE",
    },
    secondary: {
      main: "#0DBF87",
    },
    error: {
      main: "#EE4C4C",
    },
    warning: {
      main: "#F4DA85",
    },
    common: {
      black: "#13110C",
      white: "#F8FAFA",
    },
  },
});

export default theme;
