export const phoneValidator = (numero: string): boolean => {
  const cleanedNumero = numero?.replace(/\D/g, '');

  if (!cleanedNumero) {
    return true; // Retorna true se o campo estiver vazio, ou seja, sem erros
  }

  // Verifica se o número possui a quantidade correta de dígitos
  if (cleanedNumero.length < 10 || cleanedNumero.length > 11) {
    return false;
  }

  // Verifica se o número começa com o dígito 9 (caso tenha 11 dígitos)
  if (cleanedNumero.length === 11 && cleanedNumero.charAt(2) !== '9') {
    return false;
  }

  // Verifica se todos os dígitos são iguais, o que indica um número inválido
  const allDigitsEqual = /^(\d)\1{9,10}$/.test(cleanedNumero);
  if (allDigitsEqual) {
    return false;
  }

  // Se todas as validações passaram, o número é considerado válido
  return true;
};
