import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from "@mui/material";

type PopupProps = {
  open: boolean;
  onSubmit: any;
  setSelectData: React.Dispatch<React.SetStateAction<any>>;
  handleClose: () => void;
  title: string | React.ReactNode;
  data: any[];
  dataView?: string[];
};

const Popup = ({
  onSubmit,
  open,
  setSelectData,
  handleClose,
  title,
  data,
  dataView,
}: PopupProps) => {
  return (
    <Dialog maxWidth="md" fullWidth open={open} onClose={handleClose}>
      <DialogTitle sx={{ fontWeight: "bold" }} color="primary">
        {title}
      </DialogTitle>
      <DialogContent>
        {data.map((data) => (
          <Box key={data.id}>
            <Typography
              variant="body1"
              color="grey"
              sx={{ fontWeight: "bold", m: 1 }}
              onClick={() => {
                setSelectData(data);
                onSubmit({
                  onSubmit,
                });
                handleClose();
              }}
            >
              {data + dataView}
            </Typography>
            <Divider />
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default Popup;
