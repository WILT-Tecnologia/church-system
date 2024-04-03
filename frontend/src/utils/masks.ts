export const masks = {
  time: (value?: string) => {
    if (!value) return value;

    const newValue = value.replace(/\D/g, "");

    if (newValue.length <= 2) return newValue;

    const start = newValue.substring(0, 2);
    const end = newValue.substring(2, 4);

    return `${start}:${end}`;
  },
  date: (value: string) => {
    const newValue = value
      .replace(/\D/g, "")
      .replace(/(^[0-9]{2})/, "$1/")
      .replace(/(^[0-9]{2})\/([0-9]{2})/, "$1/$2/")
      .replace(/(^[0-9]{2})\/([0-9]{2})\/([0-9]{4})$/, "$1/$2/$3")
      .replace(/(^[0-9]{2}\/[0-9]{2}\/[0-9]{4})\d+?$/, "$1");

    return newValue;
  },
  cpf: (value: string) => {
    const newValue = value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
    // const newValue = value.replace(
    //   /(\d{3})(\d{3})(\d{3})(\d{2})/,
    //   "$1.$2.$3-$4",
    // );

    return newValue;
  },
  cnpj: (value: string) => {
    const newValue = value.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5",
    );

    return newValue;
  },
  phone: (value: string) => {
    const newValue = value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{4})/, "$1-$2");

    return newValue;
  },
};
