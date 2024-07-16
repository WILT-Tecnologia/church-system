import axios from "axios";
import { useEffect, useState } from "react";

export default function useFetchPrimaryColor(): string {
  const [primaryColor, setPrimaryColor] = useState<string>("#0393BE");

  useEffect(() => {
    const fetchColor = async () => {
      try {
        const response = await axios.get("/api/color");
        const color = response.data.color || primaryColor;
        setPrimaryColor(color);
      } catch (error) {
        console.error("Failed to fetch primary color", error);
      }
    };

    fetchColor();
  }, []);

  return primaryColor;
}
