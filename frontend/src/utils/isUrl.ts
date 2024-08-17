export const isUrl = (address: string): boolean => {
  let url;
  try {
    url = new URL(address);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
};
