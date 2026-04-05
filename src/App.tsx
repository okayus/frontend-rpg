/*
 * App.tsx — アプリケーションのルート（最上位）コンポーネント。
 *
 * なぜ App コンポーネントが必要？:
 * - main.tsx は「React を起動する」だけの役割
 * - App は「アプリ全体の構成・レイアウト」を担当する
 * - 将来ページが増えても、App にルーティングやグローバルな状態管理を追加できる
 * - この「起動」と「構成」を分離するのが React のベストプラクティス
 */

/*
 * import { MapView } from './features/map/MapView'
 * なぜ features/ ディレクトリ？:
 * - 機能単位でディレクトリを分ける「Feature-based」構成
 * - map/ の中にコンポーネント(MapView)、フック(usePlayerMovement)、スタイルがまとまる
 * - 関連するファイルが近くにあるので、機能の追加・修正がしやすい
 *
 * なぜ名前付きインポート { MapView }？:
 * - MapView は export function MapView で公開されている（名前付きエクスポート）
 * - 名前付きエクスポートは「このモジュールが公開するもの」が明確になる
 * - IDEの自動補完が効きやすい・リネーム時に追跡できるという利点がある
 */
import { MapView } from './features/map/MapView';
import { usePlayerMovement } from './features/map/usePlayerMovement';
import { grasslandMap } from './data/maps/grassland';

/*
 * function App() — React コンポーネント。
 * なぜ関数で書く？:
 * - React のコンポーネントは「関数」として定義するのが現在の標準（関数コンポーネント）
 * - 以前は class App extends React.Component と書いていたが、
 *   関数のほうがシンプルで、Hooks（useReducer, useEffect など）が使える
 * - 関数コンポーネント = 「props を受け取り、JSX を返す関数」
 */
function App() {
  /*
   * const player = usePlayerMovement(grasslandMap)
   *
   * usePlayerMovement は「カスタムフック」— 自分で作った React Hook。
   * なぜカスタムフックにする？:
   * - キーボード入力の監視、プレイヤー座標の管理、移動の判定…… これらのロジックを
   *   App コンポーネントに直接書くと、App が肥大化して読みにくくなる
   * - カスタムフックに切り出すことで:
   *   1. App は「何を表示するか」だけに集中できる（関心の分離）
   *   2. 移動ロジックを単体テストしやすくなる
   *   3. 別のコンポーネントでも再利用できる
   *
   * grasslandMap を引数に渡すことで、マップに応じた移動制限（壁の判定など）が機能する。
   * → フックがマップデータに依存しているため、別のマップを渡せば別のマップで動く。
   */
  const player = usePlayerMovement(grasslandMap);

  return (
    /*
     * <main> — ページのメインコンテンツを示すセマンティック HTML タグ。
     * なぜ <div> ではなく <main>？:
     * - <main> は「このページの主要なコンテンツ」を意味する
     * - スクリーンリーダーが <main> を認識して「メインコンテンツにスキップ」できる
     * - SEO にも有利（検索エンジンがコンテンツの中心部分を把握しやすい）
     * - <div> には意味がないが、<main> には「ここがメイン」という意味がある
     */
    <main>
      {/*
       * <MapView map={grasslandMap} playerPos={player.position} />
       *
       * React の「props（プロパティ）」でデータを子コンポーネントに渡している。
       * なぜ props で渡す？:
       * - React は「データは上から下に流れる」（単方向データフロー）が基本原則
       * - App が「どのマップを表示するか」「プレイヤーがどこにいるか」を決め、
       *   MapView は「渡されたデータを描画するだけ」に徹する
       * - MapView は自分でデータを取得しない → テストしやすく、再利用しやすい
       *
       * map と playerPos を別々の props にしている理由:
       * - map はマップデータ（変わらない）、playerPos はプレイヤー位置（変わる）
       * - 将来 React.memo で最適化する際、「何が変わったか」を個別に判定できる
       */}
      <MapView map={grasslandMap} playerPos={player.position} />
    </main>
  );
}

/*
 * export default App
 * なぜ default エクスポート？:
 * - main.tsx が import App from './App' でシンプルにインポートできる
 * - ルートコンポーネントは1ファイルに1つなので、default が自然
 * - 一方で MapView など複数エクスポートがあるファイルでは名前付きエクスポートを使う
 *
 * default vs 名前付きの使い分け:
 * - default: ファイルの「メインの公開物」が1つのとき（App, ページコンポーネントなど）
 * - 名前付き: 複数のものを公開するとき、または明示的な名前で import したいとき
 */
export default App;
