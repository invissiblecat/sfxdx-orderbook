export const getFromEnv = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Field ${name} not found in .env`);
  return value;
};
