import { useEffect, useState } from "react";

const FetchPrimaryColor = () => {
  const [primaryColor, setPrimaryColor] = useState("#0393BE");

  useEffect(() => {
    async function fetchPrimaryColor() {
      const response = await fetch("/api/main_settings");
      const data = await response.json();
      setPrimaryColor(data.color);
    }

    fetchPrimaryColor();
  }, []);

  return primaryColor;
};

export default FetchPrimaryColor;
