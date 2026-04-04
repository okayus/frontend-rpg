import { type MapData, TileType, type Position } from '../../types/map';
import styles from './MapView.module.css';

/** タイル種別 → CSS クラスの対応 */
const TILE_CLASS: Record<TileType, string> = {
  [TileType.Grass]: styles.tileGrass,
  [TileType.Wall]: styles.tileWall,
  [TileType.Water]: styles.tileWater,
  [TileType.Path]: styles.tilePath,
  [TileType.Tree]: styles.tileTree,
};

interface MapViewProps {
  map: MapData;
  playerPos: Position;
}

/**
 * CSS Grid Layout でタイルマップを描画するコンポーネント
 *
 * 学習ポイント:
 * - CSS Grid の grid-template-columns/rows を CSS Custom Properties で動的に設定
 * - CSS Modules でスコープ付きスタイル
 * - ternary による条件付きレンダリング (rendering-conditional-render)
 */
export function MapView({ map, playerPos }: MapViewProps) {
  return (
    <div className={styles.mapContainer}>
      <h2 className={styles.mapTitle}>{map.name}</h2>
      <div
        className={styles.grid}
        style={{
          '--map-cols': map.width,
          '--map-rows': map.height,
        } as React.CSSProperties}
        role="grid"
        aria-label={`${map.name} マップ ${map.width}×${map.height}`}
      >
        {map.tiles.flatMap((row, y) =>
          row.map((tile, x) => {
            const isPlayer = x === playerPos.x && y === playerPos.y;
            return (
              <div
                key={`${x}-${y}`}
                className={`${styles.tile} ${TILE_CLASS[tile]}`}
                role="gridcell"
                aria-label={isPlayer ? 'プレイヤー' : undefined}
              >
                {isPlayer ? <div className={styles.player} /> : null}
              </div>
            );
          }),
        )}
      </div>
      <p className={styles.controls}>
        <kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> または
        <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> で移動
      </p>
    </div>
  );
}
