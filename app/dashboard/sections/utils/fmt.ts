export function fmt(n: number) {
  return n.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}