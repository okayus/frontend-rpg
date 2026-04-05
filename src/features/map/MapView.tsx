/*
 * MapView.tsx — マップを画面に描画する React コンポーネント。
 *
 * このファイルは「表示（View）」だけに専念する。
 * データの管理やキー入力の処理はここにはなく、App.tsx から props で受け取る。
 * → 「プレゼンテーショナルコンポーネント」と呼ばれるパターン。
 *
 * なぜ表示とロジックを分ける？:
 * - MapView は「データを渡せば描画する」だけのシンプルな関数になる
 * - テスト時にキーボードイベントを用意しなくても、座標を渡すだけで表示確認できる
 * - 同じ MapView をミニマップ表示や戦闘画面の背景にも再利用できる
 */

/*
 * import { type MapData, TileType, type Position } from '../../types/map'
 *
 * type MapData, type Position — 型だけのインポート。
 * TileType — 値としても型としても使うので type をつけない。
 * → TILE_CLASS のキーとして TileType.Grass（値）を使いつつ、
 *   Record<TileType, string> で型としても使っている。
 *
 * import styles from './MapView.module.css'
 * CSS Modules のインポート。styles はオブジェクトで:
 * { mapContainer: "MapView_mapContainer_a1b2c", grid: "MapView_grid_d4e5f", ... }
 * のようにクラス名がキー、変換後のユニークなクラス名が値になる。
 */
import { type MapData, TileType, type Position } from '../../types/map';
import styles from './MapView.module.css';

/*
 * TILE_CLASS — タイル種別と CSS クラス名の対応表。
 *
 * Record<TileType, string> 型:
 * - 「TileType のすべての値（0, 1, 2, 3, 4）をキーに持ち、値は string」という型
 * - もし TileType.Tree のマッピングを書き忘れたら型エラーになる
 * - → 新しいタイル種別を追加したとき、ここの定義漏れを防げる
 *
 * [TileType.Grass]: styles.tileGrass — コンピューテッドプロパティ名。
 * [] の中に式を書くと、その評価結果がキーになる。
 * TileType.Grass は 0 なので、実質 { 0: "MapView_tileGrass_xxx" } と同じ。
 * なぜ直接 0 と書かない？: TileType.Grass のほうが「何のタイルか」が明確で読みやすい。
 *
 * なぜコンポーネントの外に定義する？:
 * - この対応表は変わらない定数
 * - コンポーネント内に書くと、レンダリングのたびにオブジェクトが生成されて無駄
 * - モジュールレベルに置くことで、一度だけ生成される
 */
/** タイル種別 → CSS クラスの対応 */
const TILE_CLASS: Record<TileType, string> = {
  [TileType.Grass]: styles.tileGrass,
  [TileType.Wall]: styles.tileWall,
  [TileType.Water]: styles.tileWater,
  [TileType.Path]: styles.tilePath,
  [TileType.Tree]: styles.tileTree,
};

/*
 * MapViewProps — このコンポーネントが受け取る props（引数）の型定義。
 *
 * なぜ interface で型を定義する？:
 * - コンポーネントを使う側が「何を渡せばいいか」を型で明確にする
 * - map={123} のような間違った値を渡すと、エディタ上で即座にエラーが表示される
 * - Props の型定義は React コンポーネントの「API仕様書」の役割を果たす
 *
 * なぜ MapViewProps という命名？:
 * - React のコミュニティでは {コンポーネント名}Props が慣習
 * - MapView の Props → MapViewProps
 */
interface MapViewProps {
  map: MapData;
  playerPos: Position;
}

/*
 * export function MapView({ map, playerPos }: MapViewProps)
 *
 * export — 他のファイルからインポートできるようにする。
 * 名前付きエクスポート（export function）を使っている。
 * → import { MapView } from './MapView' でインポートする。
 *
 * { map, playerPos } — 引数の分割代入（Destructuring）。
 * props.map, props.playerPos と書く代わりに、直接 map, playerPos として取り出す。
 * なぜ？: コンポーネント内で props.map と毎回書くのは冗長。分割代入で簡潔に���ける。
 *
 * : MapViewProps — この関数の引数が MapViewProps 型であることを宣言。
 * map が MapData 型、playerPos が Position 型であることが保証される。
 */
/**
 * CSS Grid Layout でタイルマップを描画するコンポーネント
 */
export function MapView({ map, playerPos }: MapViewProps) {
  return (
    /*
     * <div className={styles.mapContainer}>
     * なぜ className で styles.mapContainer と書く？:
     * - CSS Modules では import styles from './MapView.module.css' でスタイルを読み込む
     * - styles.mapContainer は実際には "MapView_mapContainer_a1b2c" のような
     *   ユニークな���ラス名に変換される → 他のコンポーネ���トと名前が衝突しない
     * - 通常のHTMLでは class="..." だが、JSXでは class が予約語のため className を使う
     */
    <div className={styles.mapContainer}>
      {/*
       * <h2> — 見出しタグ。マップ名を表示する��
       * なぜ <h2>？:
       * - <h1> はページ全体のタイトル（通常1つだけ）
       * - マップ名はページ内のセクション見出しなので <h2> が適切
       * - 見出しタグを正しく使うと、スクリーンリーダー��ページ構造を理解できる
       * - <div> + font-size で見た目だけ大きくするのはNG（意味が伝わらない）
       *
       * {map.name} — JSX 内で JavaScript の式を埋め込む。
       * {} で囲むと、中の式が評価されて文字列として表示される。
       * map.name は MapData の name プロパティ → 「始まりの草原」が表示される。
       */}
      <h2 className={styles.mapTitle}>{map.name}</h2>

      {/*
       * マップ本体のグリッド。
       *
       * style={{ '--map-cols': map.width, '--map-rows': map.height }}
       * → JSからCSS変数（カスタムプロパティ）を設定している。
       * なぜ？:
       * - CSSの grid-template-columns で var(--map-cols) を参照している
       * - マップサイズはJSのデータで決まるので、CSS側に値を渡す必要がある
       * - style属性でCSS変数を設定すれば、CSSファイルを書き換えずに動的な値を渡せる
       *
       * as React.CSSProperties — TypeScriptの型アサーション。
       * なぜ必要？:
       * - React の CSSProperties 型には --map-cols のようなCSS変数が定義されていない
       * - そのまま書くと TypeScript が「--map-cols は CSSProperties に存在しない」とエラーを出す
       * - as React.CSSProperties で「この値はCSSプロパティとして正しい」と TypeScript に伝える
       * - これはCSS変数を React で使う際の定番��ターン
       *
       * role="grid" — WAI-ARIA ロール。
       * なぜ？:
       * - スクリーンリ���ダーに「この要素はグリッド（表のような構造）です」と伝える
       * - <div> だけでは意味が不明だが、role を付けるとアクセシビリティツールが
       *   「○行×○列のグリッド」と認識してくれる
       *
       * aria-label — 要素の説明テキスト。画面には表示されないが、
       * スクリーンリーダーが「始まりの草原 マップ 16×12」と読み上げてくれる。
       *
       * テンプレートリテラル `${map.name} マップ ${map.width}��${map.height}`
       * → バッククォート(`)で囲み、${} で変数を埋め込む JavaScript の文字列構文。
       */}
      <div
        className={styles.grid}
        style={{
          '--map-cols': map.width,
          '--map-rows': map.height,
        } as React.CSSProperties}
        role="grid"
        aria-label={`${map.name} マップ ${map.width}×${map.height}`}
      >
        {/*
         * map.tiles.flatMap() + row.map() — 2次元配列をJSX要素のリストに変換。
         *
         * .map() は配列の各要素を変換する関数:
         *   [1, 2, 3].map(x => x * 2) → [2, 4, 6]
         *   ここでは各タイルデータを <div> に変換している。
         *
         * .flatMap() は map() + flat() — map した結果を平坦化する:
         *   [[a, b], [c, d]].flatMap(row => row) → [a, b, c, d]
         *   tiles は2次元配列だが、CSS Grid は1次元の子要素リストから
         *   自動的にグリッド配置するため、フラットにして渡す。
         *
         * (row, y) と (tile, x):
         *   第2引数はインデックス（0始まりの番号）。
         *   外側のループの y が行番号、内側の x が列番号。
         *
         * key={`${x}-${y}`} — React のリストレンダリングに必須の一意な識別子。
         * なぜ key が必要？:
         * - React は仮想DOM（Virtual DOM）で差分を計算して効率的に更新する
         * - key があると「この要素は座標(3,5)のタイル」と識別できる
         * - key がないと、全タイルを比較し直すことになりパ���ォーマンスが落ちる
         * - 座標 "3-5" は各タイルで一意なので、key として適切
         */}
        {map.tiles.flatMap((row, y) =>
          row.map((tile, x) => {
            /*
             * const isPlayer = x === playerPos.x && y === playerPos.y
             * 現在のタイル座標とプレイヤーの座標が一致するか判定。
             * === は「厳密等価演算子」— 型変換なしで値が等しいか比較する。
             * == だと "3" == 3 が true になるなど予期しない型変換が起きるため、=== を使う。
             */
            const isPlayer = x === playerPos.x && y === playerPos.y;
            return (
              <div
                key={`${x}-${y}`}
                /*
                 * className={`${styles.tile} ${TILE_CLASS[tile]}`}
                 * テンプレートリテラルで2つのCSS Modulesクラスを結合。
                 * → "MapView_tile_abc MapView_tileGrass_def" のような文字列になる。
                 * HTMLでは class="foo bar" のようにスペース区切りで複数クラスを指定できる。
                 * .tile = 全タイル共通のスタイル（サイズ、position: relative）
                 * TILE_CLASS[tile] = タイル種別固有のスタイル（背景色など）
                 */
                className={`${styles.tile} ${TILE_CLASS[tile]}`}
                role="gridcell"
                /*
                 * aria-label={isPlayer ? 'プレイ���ー' : undefined}
                 * 三項演算子（条件 ? 真の値 : 偽の値）で条件付きの属性設定。
                 * React では属性に undefined を渡すと、その属性自体がDOMに出力されない。
                 * → プレイヤーがいないタイルには aria-label 属性が付かない（クリーンなHTML）。
                 */
                aria-label={isPlayer ? 'プレイヤー' : undefined}
              >
                {/*
                 * {isPlayer ? <div className={styles.player} /> : null}
                 * React の条件付きレンダリング。
                 *
                 * null — React では null を返すと「何も描画しない」。
                 * false や undefined でも同様だが、null が最も意図が明確。
                 *
                 * <div className={styles.player} /> — 自己閉じタグ。
                 * 子要素がない場合は <div></div> の代わりに <div /> と書ける（JSX の構文）。
                 *
                 * なぜプレイヤーを別の <div> で表現する？:
                 * - タイルの背景色（草、水など）の上にプレイヤーを重ねたい
                 * - CSS の position: absolute でタイルの上に配置する
                 * - タイル自体のスタイルを変えないので、プレイヤーの移動時に
                 *   元のタイルを復元する処理が不要
                 */}
                {isPlayer ? <div className={styles.player} /> : null}
              </div>
            );
          }),
        )}
      </div>

      {/*
       * <p> — 段落タグ。操作説明のテキスト。
       * <kbd> — キーボード入力を表すセマンティック HTML タグ。
       * 詳細は MapView.module.css のコメント参照。
       */}
      <p className={styles.controls}>
        <kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> または
        <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> で移動
      </p>
    </div>
  );
}
