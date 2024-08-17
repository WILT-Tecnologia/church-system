import axios from "axios";
import { useEffect, useState } from "react";

export default function useFetchPrimaryColor(): string {
  const [primaryColor, setPrimaryColor] = useState<string>("#0DBF87");

  useEffect(() => {
    const fetchColor = async () => {
      try {
        const response = await axios.get("/admin/users");
        const color = response.data.color || primaryColor;
        setPrimaryColor(color);
      } catch (error) {
        console.error("Deu erro em buscar a cor primária");
      }
    };

    fetchColor();
  }, []);

  return primaryColor;
}
