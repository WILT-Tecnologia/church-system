import { routes } from '@/config/routes';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';

export const Navbar = () => {
  const router = useRouter();

  const handleChurch = () => {
    router.push(routes.church.index);
  };

  const handleAdministrative = () => {
    router.push(routes.administrative.index);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="inherit">
        <Toolbar>
          <Typography
            variant="h6"
            component="a"
            href={routes.index}
            sx={{ flexGrow: 1 }}
          >
            {process.env.customKey}
          </Typography>
          <Box className="flex gap-2">
            <Button variant="contained" color="primary" onClick={handleChurch}>
              Church
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAdministrative}
            >
              Adminstrativo
            </Button>
            <Button variant="outlined" color="primary">
              Login
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};
