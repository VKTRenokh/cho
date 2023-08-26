export const sleep = async (ms: number): Promise<void> => {
  return await new Promise<void>((res) => {
    setTimeout(() => res(), ms);
  });
};
