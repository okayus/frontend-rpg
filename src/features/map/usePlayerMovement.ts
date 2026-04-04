import { useReducer, useEffect, useCallback } from 'react';
import { type MapData, type Position, type Direction, isPassable } from '../../types/map';

// ── State & Actions ──

interface PlayerState {
  readonly position: Position;
  readonly direction: Direction;
}

type PlayerAction =
  | { type: 'move'; direction: Direction };

// ── Direction → Position delta ──

const DELTA: Record<Direction, Position> = {
  up:    { x: 0,  y: -1 },
  down:  { x: 0,  y: 1 },
  left:  { x: -1, y: 0 },
  right: { x: 1,  y: 0 },
};

// ── Key → Direction mapping ──
// Map を module-level で定義 (js-index-maps)

const KEY_TO_DIRECTION = new Map<string, Direction>([
  ['ArrowUp', 'up'],
  ['ArrowDown', 'down'],
  ['ArrowLeft', 'left'],
  ['ArrowRight', 'right'],
  ['w', 'up'],
  ['W', 'up'],
  ['s', 'down'],
  ['S', 'down'],
  ['a', 'left'],
  ['A', 'left'],
  ['d', 'right'],
  ['D', 'right'],
]);

/**
 * プレイヤー移動を管理するカスタムフック
 *
 * 学習ポイント:
 * - useReducer によるゲーム状態管理パターン
 * - useCallback でイベントハンドラを安定化 (rerender-functional-setstate 的発想)
 * - module-level Map でキーマッピング (js-index-maps)
 * - passive でない keydown リスナ（preventDefault が必要なため）
 */
export function usePlayerMovement(map: MapData) {
  function createReducer(mapData: MapData) {
    return function reducer(state: PlayerState, action: PlayerAction): PlayerState {
      switch (action.type) {
        case 'move': {
          const delta = DELTA[action.direction];
          const nextX = state.position.x + delta.x;
          const nextY = state.position.y + delta.y;

          // マップ範囲外チェック
          if (nextX < 0 || nextX >= mapData.width || nextY < 0 || nextY >= mapData.height) {
            return { ...state, direction: action.direction };
          }

          // 通行不可タイルチェック
          const tile = mapData.tiles[nextY]![nextX]!;
          if (!isPassable(tile)) {
            return { ...state, direction: action.direction };
          }

          return {
            position: { x: nextX, y: nextY },
            direction: action.direction,
          };
        }
      }
    };
  }

  const [state, dispatch] = useReducer(createReducer(map), {
    position: map.playerStart,
    direction: 'down' as Direction,
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const direction = KEY_TO_DIRECTION.get(e.key);
    if (direction) {
      e.preventDefault();
      dispatch({ type: 'move', direction });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return state;
}
