import { Button } from "@mui/material";

type CTAProps = {
  labelCancel: React.ReactNode;
  labelConfirm: React.ReactNode;
  isSubmitting?: boolean;
  handleBack?: () => void;
};

const CTA = ({
  isSubmitting,
  labelCancel,
  labelConfirm,
  handleBack,
}: CTAProps) => {
  return (
    <>
      <Button
        type="reset"
        variant="outlined"
        color="inherit"
        disabled={isSubmitting}
        onClick={handleBack}
      >
        {labelCancel}
      </Button>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={isSubmitting}
      >
        {labelConfirm}
      </Button>
    </>
  );
};
export default CTA;
