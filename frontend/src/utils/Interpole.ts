export const Interpole = (...fields: string[]) => {
  return fields.map((field) => field.replace(/\D/g, ""));
};
