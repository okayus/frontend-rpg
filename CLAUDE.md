# Frontend RPG — フロントエンド学習RPG

## プロジェクト概要

ブラウザ標準の最新機能、HTML/CSSの最新仕様、Reactのベストプラクティスを楽しく学ぶための学習用ブラウザゲーム。

ゲームの形式はグリッドレイアウトのマップ移動 + シンボルエンカウント + ターン制コマンドバトルのRPG。
**ゲームそのものではなく、フロントエンド技術の学習が目的。** ただし世界観やゲーム体験はファンタジーRPGとして楽しめるものにする。

## コンセプト

- マップ移動は CSS Grid Layout で構築する。Canvas は使わない
- 世界観はファンタジーRPG。敵やストーリーは普通にファンタジー
- 学習要素はゲームの「実装そのもの」に埋め込む — UIはすべて HTML/CSS/React で描画し、学習対象の最新技術を実際にゲームUI内で活用する（＝ソースコードを読むことで実装例に触れられる）
- 各機能の実装で意図的に最新のブラウザAPI・CSS機能・Reactパターンを使い、コードが教材になるようにする

## 技術スタック

- **Runtime**: ブラウザ（モダンブラウザのみ対応）
- **Language**: TypeScript (strict mode)
- **Framework**: React 19
- **Build**: Vite
- **Package Manager**: pnpm
- **Styling**: CSS Modules（vanilla CSS、プリプロセッサ不使用）
- **Canvas不使用**: すべてDOM + CSSで描画

## 開発コマンド

```bash
pnpm dev      # 開発サーバー起動
pnpm build    # プロダクションビルド
pnpm preview  # ビルドプレビュー
pnpm lint     # ESLint
```

## アーキテクチャ方針

- コンポーネントは機能単位でディレクトリ分割（`src/features/`）
- ゲーム状態管理は React の組み込み機能（useReducer + Context）を優先し、外部ライブラリは最小限にする
- 型安全を徹底する（`any` 禁止、`strict: true`）
- ゲームデータ（マップ、敵など）はJSONまたはTSファイルで静的に定義する
- CSS の最新機能を積極的に使う（Grid, Container Queries, `@layer`, `color-mix()`, View Transitions など）

## 開発ワークフロー

- **mainブランチは保護する** — mainに直接コミット・プッシュしない
- 新しい機能や変更は必ず **featureブランチ** を作成して行う
  1. `git checkout -b feature/<機能名>` でブランチ作成
  2. 空コミット (`git commit --allow-empty -m "feat: <機能名>"`) を作成
  3. 実装計画を本文に書いた **Draft PR** を作成（`gh pr create --draft`）
  4. 実装を進め、完了したらレビュー依頼
- ブランチ名規則: `feature/<機能名>`, `fix/<修正内容>`, `refactor/<対象>`

## Claude Code 利用ルール

- **React コンポーネントの実装・レビュー・リファクタ時は、必ず `vercel-react-best-practices` スキルを使用すること**（`/vercel-react-best-practices`）
- これにより Vercel Engineering のパフォーマンス最適化ガイドラインに準拠した実装を保つ

## ディレクトリ構成（予定）

```
src/
  features/
    map/          # グリッドマップ・移動
    battle/       # ターン制コマンドバトル
    player/       # プレイヤー状態
  data/           # ゲームデータ定義（マップ、敵など）
  components/     # 汎用UIコンポーネント
  hooks/          # 共通カスタムフック
  styles/         # グローバルスタイル・CSS変数
  types/          # 共通型定義
```
