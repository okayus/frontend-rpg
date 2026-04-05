/*
 * main.tsx — React アプリケーションの起動ファイル（エントリーポイント）。
 * index.html の <script type="module" src="/src/main.tsx"> から読み込まれ、
 * ブラウザが最初に実行する JavaScript がこのファイル。
 *
 * やっていること:
 * 1. React をインポートする
 * 2. HTML 内の <div id="root"> を取得する
 * 3. その中に React コンポーネントを描画（レンダリング）する
 */

/*
 * import { StrictMode } from 'react'
 * なぜ StrictMode？:
 * - 開発中にコードの問題を早期発見するための React の仕組み
 * - コンポーネントを意図的に2回レンダリングして、副作用（意図しない動作）を検出する
 * - 非推奨APIの使用を警告してくれる
 * - 本番ビルドでは自動的に無効化されるため、パフォーマンスに影響しない
 */
import { StrictMode } from 'react'

/*
 * import { createRoot } from 'react-dom/client'
 * なぜ 'react-dom/client'？:
 * - React 18 以降の新しい API。以前は ReactDOM.render() を使っていた
 * - createRoot は Concurrent Mode（並行レンダリング）に対応しており、
 *   UIの応答性が向上する（重い更新中でもユーザー操作を中断しない）
 * なぜ 'react' とは別パッケージ？:
 * - react = コンポーネント定義のためのコアライブラリ（プラットフォーム非依存）
 * - react-dom = ブラウザのDOMに描画するためのライブラリ
 * - React は React Native（モバイル）など DOM 以外でも使えるため、分離されている
 */
import { createRoot } from 'react-dom/client'

/*
 * import './index.css'
 * なぜ CSS をインポートする？:
 * - Vite がこの import を見て、index.css をバンドル（ビルド成果物に含める）する
 * - CSSファイルを直接 import すると、グローバルスタイルとしてページ全体に適用される
 * - ここではページ全体の背景色・フォント・レイアウトなど基盤のスタイルを読み込んでいる
 */
import './index.css'

/*
 * import App from './App.tsx'
 * なぜ App を別ファイルにする？:
 * - main.tsx はアプリの「起動処理」だけに専念させる（関心の分離）
 * - App コンポーネントにアプリ全体のレイアウト・状態管理をまとめる
 * - テストや Storybook でも App を単独で使い回せる
 */
import App from './App.tsx'

/*
 * document.getElementById('root')!
 * なぜ ! をつける？:
 * - getElementById は HTMLElement | null を返す（要素が見つからない可能性があるため）
 * - ! は TypeScript の Non-null assertion — 「ここでは null ではないと保証する」という意味
 * - index.html に <div id="root"> が必ず存在するので、null にはならない
 * - ! を使わないと createRoot(null) になり型エラーになる
 * 注意: ! は「開発者が責任を持つ」宣言。root が存在しなければ実行時エラーになる。
 *
 * createRoot(...).render(...)
 * なぜこの書き方？:
 * - createRoot() で「React がDOMを管理する領域（ルート）」を作る
 * - .render() でそのルートに React コンポーネントツリーを描画する
 * - 一度 render を呼べば、以降は React が状態変更に応じて自動的に再描画する
 */
createRoot(document.getElementById('root')!).render(
  /*
   * <StrictMode> で <App /> を囲む。
   * → App 以下の全コンポーネントに対して、開発時の厳格チェックが有効になる。
   * 外しても動作は変わらないが、バグの早期発見のため付けておくのがベストプラクティス。
   */
  <StrictMode>
    <App />
  </StrictMode>,
)
