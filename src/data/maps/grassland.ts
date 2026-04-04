import { TileType as T, type MapData } from '../../types/map';

const { Grass: G, Wall: W, Water: A, Path: P, Tree: R } = T;

/**
 * 草原マップ — 最初のエリア
 * 16×12 のグリッド
 */
export const grasslandMap: MapData = {
  name: '始まりの草原',
  width: 16,
  height: 12,
  playerStart: { x: 3, y: 5 },
  tiles: [
    [R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R],
    [R, G, G, G, G, G, G, G, G, G, G, G, G, G, G, R],
    [R, G, G, G, G, P, P, P, G, G, G, G, G, G, G, R],
    [R, G, G, G, G, P, G, P, G, G, A, A, G, G, G, R],
    [R, G, G, G, G, P, G, P, P, P, A, A, A, G, G, R],
    [R, G, G, G, P, P, G, G, G, P, G, A, G, G, G, R],
    [R, G, G, G, P, G, G, G, G, P, G, G, G, G, G, R],
    [R, G, W, W, P, G, G, G, G, P, P, P, G, G, G, R],
    [R, G, W, W, P, G, G, G, G, G, G, P, G, G, G, R],
    [R, G, G, G, P, P, P, P, P, P, P, P, G, G, G, R],
    [R, G, G, G, G, G, G, G, G, G, G, G, G, G, G, R],
    [R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R],
  ],
};
