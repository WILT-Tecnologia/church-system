import axios from "axios";

export const useSearchCep = async (cep: string) => {
  const urls = [
    `https://brasilapi.com.br/api/cep/v1/${cep}`,
    `https://brasilapi.com.br/api/cep/v2/${cep}`,
  ];

  for (const url of urls) {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching from ${url}`, error);
      continue;
    }
  }
  throw new Error("CEP not found in both API");
};
