export const pagination = (page, size) => {
  if (page <= 0 || !page) page = 1;
  if (size <= 0 || !size) size = 5;
  const skip = size * (page - 1);
  return { skip, limit: size };
};
