// Palette colors matching wheel block
export const WHEEL_COLORS = [
  "#2F6BFF", // синий
  "#FF7B6E", // красно-коралловый
  "#7CFF7A", // салатовый/зелёный
  "#E6B9FF", // сиреневый
  "#F6E7B2", // бежевый/песочный
];

export function getColor(index: number): string {
  return WHEEL_COLORS[index % WHEEL_COLORS.length];
}
