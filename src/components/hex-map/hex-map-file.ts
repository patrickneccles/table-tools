/**
 * Hex map save/load format (v1).
 */

export type HexFileV1 = {
  version: 1;
  hexes: unknown[];
  stroke: string;
  strokeWidth: number;
  spacing: number;
  orientation: "flat" | "pointy";
};

export type HexFile = HexFileV1;

export function exportHexGridV1(
  data: Omit<HexFileV1, "version">
): HexFileV1 {
  return { version: 1, ...data };
}

export function importHexGrid(json: unknown): HexFile {
  const o = json as Record<string, unknown>;
  if (o.version === 1 || (!o.version && Array.isArray(o.hexes))) {
    return { version: 1, ...o } as HexFileV1;
  }
  throw new Error("Unsupported hex file version");
}
