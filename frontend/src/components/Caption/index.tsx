import { Typography } from "@mui/material";

type CaptionProps = {
  children: React.ReactNode;
};
const Caption = ({ children }: CaptionProps) => {
  return (
    <Typography variant="caption" component="p">
      {children}
    </Typography>
  );
};

export default Caption;
