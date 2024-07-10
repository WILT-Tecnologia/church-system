import axios from "axios";
import { useEffect, useState } from "react";

const FetchPrimaryColor = () => {
  const [primaryColor, setPrimaryColor] = useState("#0393BE");

  useEffect(() => {
    async function fetchPrimaryColor() {
      const response = await axios.get("/api/main_settings");
      const data = await response.data;
      setPrimaryColor(data.color);
    }

    fetchPrimaryColor();
  }, []);

  return primaryColor;
};

export default FetchPrimaryColor;
