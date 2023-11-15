export const splitWithModifier = (
  stringWithModifier: string,
  modifier: string,
): string[] => {
  return stringWithModifier
    .slice(stringWithModifier.indexOf(modifier) + 1)
    .split(' ')
}
