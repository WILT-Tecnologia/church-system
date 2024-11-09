export const cpfValidator = (cpf: string): boolean => {
  const cleanedCpf = cpf?.replace(/\D/g, '');

  if (!cleanedCpf || cleanedCpf.length !== 11) {
    return false;
  }

  if (/^(\d)\1+$/.test(cleanedCpf)) {
    return false;
  }

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanedCpf.charAt(i - 1), 10) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  if (remainder !== parseInt(cleanedCpf.charAt(9), 10)) {
    return false;
  }

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanedCpf.charAt(i - 1), 10) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  return remainder === parseInt(cleanedCpf.charAt(10), 10);
};
