import { Typography } from "@mui/material";

const ErrorMessage = ({ children }: { children: React.ReactNode }) => {
  return (
    <Typography
      color="error"
      sx={{ mt: "0.1875rem", ml: "0.875rem" }}
      variant="caption"
      component="p"
      gutterBottom
    >
      {children}
    </Typography>
  );
};

export default ErrorMessage;
