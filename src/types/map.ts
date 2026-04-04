/** タイルの種類 */
export const TileType = {
  Grass: 0,
  Wall: 1,
  Water: 2,
  Path: 3,
  Tree: 4,
} as const;

export type TileType = (typeof TileType)[keyof typeof TileType];

/** タイルが通行可能かどうか */
export function isPassable(tile: TileType): boolean {
  return tile !== TileType.Wall && tile !== TileType.Water && tile !== TileType.Tree;
}

/** マップデータの型 */
export interface MapData {
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly tiles: readonly (readonly TileType[])[];
  readonly playerStart: Position;
}

/** 座標 */
export interface Position {
  readonly x: number;
  readonly y: number;
}

/** 移動方向 */
export type Direction = 'up' | 'down' | 'left' | 'right';
