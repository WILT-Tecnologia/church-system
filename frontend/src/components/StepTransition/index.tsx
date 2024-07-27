import { Box } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";

type StepProps = {
  children: React.ReactNode;
  key: string;
};

const StepTransition = ({ children, key }: StepProps) => {
  return (
    <AnimatePresence>
      <Box
        component={motion.div}
        key={key}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </Box>
    </AnimatePresence>
  );
};

export default StepTransition;
