/*
 * grassland.ts — 最初のマップ「始まりの草原」のデータ定義。
 *
 * なぜマップデータを別ファイルにする？:
 * - データとロジックを分離する（関心の分離）
 * - マップデータだけを見て、ゲームのステージ設計を把握できる
 * - 新しいマップを追加するときは、このファイルをコピーして編集すればよい
 * - 将来的にはマップエディタからの出力を受け取ることも可能
 *
 * なぜ data/ ディレクトリに置く？:
 * - features/ はコンポーネントやロジック（動くコード）を置く場所
 * - data/ は静的なゲームデータ（変わらない定義）を置く場所
 * - この区別があると「このファイルにはUIロジックはない」と一目でわかる
 */

/*
 * import { TileType as T, type MapData } from '../../types/map'
 *
 * TileType as T — インポート時にエイリアス（別名）をつけている。
 * なぜ？:
 * - マップデータ定義では TileType.Grass, TileType.Wall... を大量に書く
 * - TileType は長いので T と短縮することで、タイル配列が見やすくなる
 * - T.Grass, T.Wall のように短く書ける
 *
 * type MapData — type キーワード付きインポート。
 * なぜ type をつける？:
 * - MapData は型情報のみに使われる（実行時には存在しない）
 * - type をつけると「これは型だけのインポートです」と明示できる
 * - ビルド時に不要なコードが含まれないよう、バンドラーが最適化しやすくなる
 */
import { TileType as T, type MapData } from '../../types/map';

/*
 * 分割代入（Destructuring）でタイル種別を1文字の変数に展開する。
 * const { Grass: G, Wall: W, ... } = T は:
 * - T.Grass を G に、T.Wall を W に…… と短い名前で取り出す
 *
 * なぜこうする？:
 * - 下の tiles 配列は 16×12 = 192 個のタイルで構成される
 * - TileType.Grass と毎回書くと、1行が非常に長くなり全体が見渡せない
 * - 1文字にすることで、マップの形状がアスキーアートのように視覚的に把握できる
 *
 * A = Water（Aqua）, R = Tree（木 ≒ foRest の R）にしている。
 * W は Wall に使いたいので Water には A を割り当てている。
 */
const { Grass: G, Wall: W, Water: A, Path: P, Tree: R } = T;

/*
 * grasslandMap — マップデータオブジェクト。MapData 型に従う。
 *
 * export const — この変数を他のファイルからインポートできるようにする。
 * const なので再代入はできない（grasslandMap = 別の値 はエラー）。
 *
 * : MapData — 型アノテーション。
 * なぜ型を明示する？:
 * - TypeScript が「この値は MapData の形に合っているか」をチェックしてくれる
 * - width が足りない、tiles の型が違うなどのミスを事前に検出できる
 * - 型を書かなくても動くが、データ定義ファイルでは明示するのがベストプラクティス
 *
 * satisfies MapData でも似たことができるが、ここでは普通の型アノテーションで十分。
 */
/**
 * 草原マップ — 最初のエリア
 * 16×12 のグリッド
 */
export const grasslandMap: MapData = {
  name: '始まりの草原',

  /*
   * width: 16, height: 12 — マップのサイズ。
   * なぜ tiles 配列から計算せずに明示する？:
   * - CSS Grid の列数・行数を設定するために JavaScript 側で数値が必要
   * - tiles.length（行数）や tiles[0].length（列数）でも取得できるが、
   *   明示的に書くことで「このマップは16×12として設計された」という意図が伝わる
   * - tiles 配列の行数と height が一致しない場合、型チェックで検出できる
   *   （ただし現状のMapData型では配列の長さまではチェックされないので、手動で確認が必要）
   */
  width: 16,
  height: 12,

  /*
   * playerStart — プレイヤーの初期位置。
   * なぜマップデータに含める？:
   * - マップごとにスタート地点は異なるので、マップデータの一部として定義する
   * - usePlayerMovement がこの値を初期状態として使う
   * - { x: 3, y: 5 } は左から4番目(0始まり)、上から6番目のタイル
   */
  playerStart: { x: 3, y: 5 },

  /*
   * tiles — マップの2次元配列。各要素がタイルの種類を表す。
   *
   * なぜ2次元配列？:
   * - マップは行(y)×列(x)の2次元構造 → 2次元配列が直感的に対応する
   * - tiles[y][x] で座標(x, y)のタイルにアクセスできる
   * - なぜ [y][x] の順？: 配列の外側が「行（縦方向）」、内側が「列（横方向）」
   *   → 見た目のレイアウトとコードの構造が一致する（下のコードを見ると地図の形がわかる）
   *
   * 1文字変数のおかげで、マップの形状が視覚的に把握できる:
   * - R(木) が外周を囲んでいる → 森に囲まれたエリア
   * - P(道) が蛇行している → 歩ける道路
   * - A(水) が右寄りにある → 池
   * - W(壁) が左下にある → 石の構造物
   * - G(草) がベースの地面
   */
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
