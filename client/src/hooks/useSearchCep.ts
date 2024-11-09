import axios from 'axios';
import { toast } from 'react-toastify';

export const useSearchCep = async (cep: string) => {
  const urls = [
    `https://brasilapi.com.br/api/cep/v1/${cep}`,
    `https://brasilapi.com.br/api/cep/v2/${cep}`,
    `https://viacep.com.br/ws/${cep}/json/`,
  ];

  for (const url of urls) {
    try {
      const response = await axios.get(url);

      // Verifica se o CEP foi encontrado (algumas APIs retornam erro 200 mas com mensagem de não encontrado)
      if (response.data && !response.data.erro) {
        return response.data;
      }
    } catch (error) {
      console.error(`Error fetching from ${url}`, error);
      continue;
    }
  }

  // Exibe o Toastify se o CEP não for encontrado em nenhuma API
  toast.error('CEP não encontrado. Por favor, verifique e tente novamente.', {
    position: 'bottom-center',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });

  throw new Error('CEP não encontrado em nenhuma das APIs');
};

/* import axios from 'axiimport { error } from 'console';
import { get } from 'http';
os';

export const useSearchCep = async (cep: string) => {
  const urls = [
    `https://brasilapi.com.br/api/cep/v1/${cep}`,
    `https://brasilapi.com.br/api/cep/v2/${cep}`,
    `https://viacep.com.br/ws/${cep}/json/`,
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
  throw new Error('CEP not found in both API');
};
 */
