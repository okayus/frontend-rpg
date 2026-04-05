/*
 * map.ts — マップに関する型定義をまとめたファイル。
 *
 * なぜ型定義を別ファイルに分ける？:
 * - 型は複数のファイルから参照される（MapView, usePlayerMovement, grassland.ts など）
 * - 1箇所にまとめておくと、型の変更が全体に一貫して反映される
 * - コンポーネントやロジックのファイルが型定義で長くなるのを防ぐ
 *
 * なぜ types/ ディレクトリ？:
 * - プロジェクト全体で共有される型は types/ に置く慣習
 * - 特定の feature（map, battle など）にしか使わない型は feature 内に置くこともある
 */

/*
 * TileType — タイルの種類を定義するオブジェクト。
 *
 * なぜ enum ではなく const オブジェクト + as const？:
 * - TypeScript の enum は JavaScript にコンパイルすると余分なコードが生成される
 * - as const を使うと、値が readonly（変更不可）のリテラル型になる
 *   → TileType.Grass は number ではなく 0 という「リテラル型」になる
 * - Tree Shaking（使われていないコードの除去）が enum より効きやすい
 * - これは TypeScript コミュニティで広く使われるパターン（const assertion）
 *
 * なぜ数値（0, 1, 2...）を値にする？:
 * - マップデータを2次元配列で定義するとき、数値のほうがコンパクトに書ける
 * - 数値は比較が高速（文字列より効率的）
 * - 将来的にマップデータをJSONファイルに移す際、数値のほうが扱いやすい
 */
/** タイルの種類 */
export const TileType = {
  Grass: 0,
  Wall: 1,
  Water: 2,
  Path: 3,
  Tree: 4,
} as const;

/*
 * type TileType = (typeof TileType)[keyof typeof TileType]
 *
 * これは TypeScript の高度なテクニック。順を追って解説:
 *
 * 1. typeof TileType
 *    → TileType オブジェクトの型を取得
 *    → { readonly Grass: 0; readonly Wall: 1; readonly Water: 2; ... }
 *
 * 2. keyof typeof TileType
 *    → そのオブジェクトのキー名の型を取得
 *    → "Grass" | "Wall" | "Water" | "Path" | "Tree"
 *
 * 3. (typeof TileType)[keyof typeof TileType]
 *    → そのキーに対応する値の型を取得
 *    → 0 | 1 | 2 | 3 | 4
 *
 * 結果: type TileType = 0 | 1 | 2 | 3 | 4
 *
 * なぜ同じ名前 TileType を使う？:
 * - TypeScript では「値」と「型」の名前空間が別なので、同名でも衝突しない
 * - const TileType = 値として使う（TileType.Grass → 0）
 * - type TileType = 型として使う（tile: TileType → 0|1|2|3|4 のどれか）
 * - 利用者は TileType だけ import すれば、値としても型としても使える → 便利
 */
export type TileType = (typeof TileType)[keyof typeof TileType];

/*
 * isPassable — タイルが通行可能かどうかを判定する関数。
 *
 * なぜ関数にする？:
 * - 「通行不可」の条件が変わったとき（例: 氷タイルを追加）、ここだけ修正すればよい
 * - usePlayerMovement.ts やバトル判定など、複数の場所で同じ判定を使い回せる
 * - 条件をコードで読める形にすることで、「なぜ通行不可か」が自明になる
 *
 * なぜ引数の型が TileType？:
 * - TileType = 0 | 1 | 2 | 3 | 4 なので、これ以外の数値を渡すと型エラーになる
 * - 「有効なタイル種別しか受け取らない」ことをコンパイル時に保証できる
 *
 * なぜ戻り値の型 boolean を明示する？:
 * - TypeScript は戻り値を推論できるが、明示すると「この関数は真偽値を返す」が一目でわかる
 * - 公開 API（export する関数）は型を明示するのがベストプラクティス
 */
/** タイルが通行可能かどうか */
export function isPassable(tile: TileType): boolean {
  return tile !== TileType.Wall && tile !== TileType.Water && tile !== TileType.Tree;
}

/*
 * MapData — マップ全体のデータ構造を定義するインターフェース。
 *
 * なぜ interface？:
 * - interface はオブジェクトの「形」を定義する TypeScript の仕組み
 * - type でも同じことができるが、interface は拡張（extends）しやすい
 * - 「データの構造」を定義するには interface が一般的な選択
 *
 * なぜ readonly？:
 * - マップデータは一度定義したら変更されるべきではない（ゲーム中に壁が消えたら困る）
 * - readonly を付けると、代入しようとした時点で TypeScript がエラーを出す
 * - 「このデータは読み取り専用です」という意図がコードから伝わる
 *
 * readonly (readonly TileType[])[]
 * → 二重の readonly。外側の配列（行のリスト）も、内側の配列（各行のタイル）も変更不可。
 * なぜ二重？: tiles[0] = [...] も tiles[0][0] = 1 も両方禁止したいため。
 */
/** マップデータの型 */
export interface MapData {
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly tiles: readonly (readonly TileType[])[];
  readonly playerStart: Position;
}

/*
 * Position — x, y 座標を表すインターフェース。
 *
 * なぜ { x: number; y: number } を毎回書かずに型を作る？:
 * - 同じ構造を何度も書くのは冗長で、間違いの元（typo: { x: number; z: number } など）
 * - 型に名前をつけることで、「この値は座標を表す」という意味が伝わる
 * - Position 型の定義を変更すれば、使用箇所すべてに反映される
 */
/** 座標 */
export interface Position {
  readonly x: number;
  readonly y: number;
}

/*
 * Direction — 移動方向を表す型。
 *
 * なぜ string ではなく Union 型（ 'up' | 'down' | ... ）？:
 * - string だと direction = 'upp'（typo）でもエラーにならない
 * - Union 型なら 'up' | 'down' | 'left' | 'right' 以外の値を代入するとエラーになる
 * - switch 文で全ケースを網羅しているかどうかも TypeScript がチェックできる
 *
 * なぜ type であって interface ではない？:
 * - interface はオブジェクトの形を定義するもの
 * - 文字列の Union 型は type でしか定義できない
 */
/** 移動方向 */
export type Direction = 'up' | 'down' | 'left' | 'right';
