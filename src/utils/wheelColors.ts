// Palette colors matching wheel block
export const WHEEL_COLORS = [
  "#98FB98", // Pale Green
  "#FA8072", // Salmon
  "#4169E1", // Royal Blue
  "#F5DEB3", // Wheat
  "#DDA0DD", // Plum
];

export function getColor(index: number): string {
  return WHEEL_COLORS[index % WHEEL_COLORS.length];
}
