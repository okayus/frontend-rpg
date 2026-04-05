/*
 * usePlayerMovement.ts — プレイヤーの移動を管理するカスタムフック。
 *
 * 「カスタムフック」とは？:
 * - React の Hook（useState, useEffect など）を組み合わせて、
 *   再利用可能なロジックを1つの関数にまとめたもの
 * - 命名規則: 必ず use で始める（usePlayerMovement, useFetch など）
 * - なぜ use で始める？: React がフックであることを認識して、
 *   ルール違反（if 文の中で呼ぶなど）を検出するため
 *
 * なぜカスタムフックにまとめる？:
 * - キー入力の監視、状態管理、移動判定をコンポーネントに直接書くと読みにくくなる
 * - フックに分離すれば、App.tsx は「何を表示するか」だけに集中できる
 * - ロジックの単体テストもしやすくなる
 */

/*
 * useReducer — 複雑な状態管理のための React Hook。
 * useEffect — 副作用（DOMイベントリスナーの登録など）を扱う React Hook。
 * useCallback — 関数をメモ化（キャッシュ）する React Hook。
 * → 各フックの詳細は使用箇所で解説。
 */
import { useReducer, useEffect, useCallback } from 'react';
import { type MapData, type Position, type Direction, isPassable } from '../../types/map';

// ── State & Actions ──

/*
 * PlayerState — プレイヤーの状態を表すインターフェース。
 *
 * なぜ position と direction を分けて持つ？:
 * - 壁にぶつかったとき、position は変わらないが direction は変わる
 *   （壁の方を向くが、移動はしない）
 * - 将来キャラクターの向きに応じたスプライト表示をする場合にも必要
 *
 * なぜ readonly？:
 * - React では状態を直接変更（ミューテーション）してはいけない
 *   （state.position.x = 5 のように直接代入するのはNG）
 * - 必ず新しいオブジェクトを作って返す（イミュータブル更新）
 * - readonly をつけておくと、うっかり直接変更しようとしたときに型エラーが出る
 */
interface PlayerState {
  readonly position: Position;
  readonly direction: Direction;
}

/*
 * PlayerAction — プレイヤーに対して行える操作（アクション）の型。
 *
 * なぜ { type: 'move'; direction: Direction } という構造？:
 * - これは「判別可能な Union 型（Discriminated Union）」というパターン
 * - type フィールドでアクションの種類を判別する
 * - 将来 { type: 'attack' } や { type: 'interact' } を追加できる
 *   → switch (action.type) で TypeScript が型を絞り込んでくれる
 *
 * 現在は 'move' しかないが、拡張を見据えた設計。
 */
type PlayerAction =
  | { type: 'move'; direction: Direction };

// ── Direction → Position delta ──

/*
 * DELTA — 方向ごとの座標変化量を定義するマッピング。
 *
 * なぜ Record<Direction, Position> 型？:
 * - Record<K, V> は「キーが K 型、値が V 型のオブジェクト」を表すユーティリティ型
 * - Record<Direction, Position> は「up, down, left, right すべてのキーが必須」という意味
 * - もし right を書き忘れたら型エラーになる → 定義漏れを防げる
 *
 * なぜモジュールレベル（関数の外）に定義する？:
 * - この値は変更されない定数なので、コンポーネントの再レンダリングのたびに
 *   作り直す必要がない
 * - 関数内に書くと、関数が呼ばれるたびにオブジェクトが生成されて無駄
 */
const DELTA: Record<Direction, Position> = {
  up:    { x: 0,  y: -1 },
  down:  { x: 0,  y: 1 },
  left:  { x: -1, y: 0 },
  right: { x: 1,  y: 0 },
};

// ── KeyboardEvent.code → Direction mapping ──

/*
 * CODE_TO_DIRECTION — キーボードの物理キーと方向の対応表。
 *
 * なぜ Map を使う？:
 * - Map はキーと値のペアを格納するデータ構造
 * - 通常のオブジェクト {} でも同じことができるが、Map のほうが:
 *   1. .get() が undefined を返すので「キーが見つからない」ケースが型安全
 *   2. .has() で存在チェックが明確
 *   3. キーの型を厳密に指定できる（new Map<string, Direction>）
 *
 * なぜ e.key ではなく e.code で判定する？:
 * - e.key は「入力される文字」を返す（IMEオンだと 'Process' になる）
 * - e.code は「物理的に押されたキーの位置」を返す（IMEに影響されない）
 * - 日本語入力がオンのままでも WASD で移動できるようにするため e.code を使う
 * - 例: 'KeyW' は物理的なWキーの位置 → どの言語のキーボードでも同じ
 */
const CODE_TO_DIRECTION = new Map<string, Direction>([
  ['ArrowUp', 'up'],
  ['ArrowDown', 'down'],
  ['ArrowLeft', 'left'],
  ['ArrowRight', 'right'],
  ['KeyW', 'up'],
  ['KeyS', 'down'],
  ['KeyA', 'left'],
  ['KeyD', 'right'],
]);

/**
 * プレイヤー移動を管理するカスタムフック
 */
export function usePlayerMovement(map: MapData) {
  /*
   * createReducer — reducer 関数を生成するファクトリ関数。
   *
   * なぜ reducer 関数を「生成する関数」にする？:
   * - reducer はマップデータ（mapData）を参照して壁判定をする必要がある
   * - useReducer に渡す reducer は純粋関数であるべき（外部の変数に依存しない）
   * - クロージャで mapData を閉じ込めることで、reducer が mapData を安全に参照できる
   *
   * 「reducer」とは？:
   * - (現在の状態, アクション) → 新しい状態 という形の関数
   * - 名前は Array.reduce() に由来する
   * - 状態の更新ロジックをコンポーネントの外に出せるのが利点
   */
  function createReducer(mapData: MapData) {
    return function reducer(state: PlayerState, action: PlayerAction): PlayerState {
      /*
       * switch (action.type) — アクションの種類に応じて処理を分岐。
       * なぜ if ではなく switch？:
       * - アクションの種類が増えたとき、switch のほうが見通しが良い
       * - TypeScript の exhaustiveness check（全ケース網羅チェック）が効く
       *   → 新しい action.type を追加したのに case を書き忘れるとエラーになる
       */
      switch (action.type) {
        case 'move': {
          const delta = DELTA[action.direction];
          const nextX = state.position.x + delta.x;
          const nextY = state.position.y + delta.y;

          /*
           * マップ範囲外チェック。
           * なぜ先にチェックする？:
           * - 範囲外の座標で tiles[nextY][nextX] にアクセスすると undefined になり、
           *   実行時エラーの原因になる
           * - 移動できない場合でも direction は更新する（キャラが向きだけ変える）
           *
           * { ...state, direction: action.direction } — スプレッド構文。
           * state の全プロパティをコピーし、direction だけ上書きした新しいオブジェクトを作る。
           * なぜ新しいオブジェクトを作る？:
           * - React は「オブジェクトの参照が変わったかどうか」で再レンダリングを判定する
           * - state.direction = 'up' のように直接変更しても、React は変化を検知できない
           * - 新しいオブジェクトを返すことで「状態が変わった」と React に伝える
           */
          if (nextX < 0 || nextX >= mapData.width || nextY < 0 || nextY >= mapData.height) {
            return { ...state, direction: action.direction };
          }

          /*
           * mapData.tiles[nextY]![nextX]!
           * なぜ ! が2つ？:
           * - tiles[nextY] は readonly TileType[] | undefined（配列の範囲外の可能性）
           * - 上のチェックで範囲内であることを確認済みなので、! で「null/undefined ではない」と宣言
           * - TypeScript の型チェッカーは制御フロー解析で配列のインデックスアクセスまでは追えない
           */
          const tile = mapData.tiles[nextY]![nextX]!;

          /*
           * isPassable() で通行可能かチェック。
           * なぜここで isPassable 関数を使う？:
           * - 通行不可の判定ロジックが types/map.ts に一元化されている
           * - 新しいタイル種別を追加したとき、isPassable だけ修正すればよい
           */
          if (!isPassable(tile)) {
            return { ...state, direction: action.direction };
          }

          /*
           * 移動成功: position と direction の両方を更新した新しいオブジェクトを返す。
           */
          return {
            position: { x: nextX, y: nextY },
            direction: action.direction,
          };
        }
      }
    };
  }

  /*
   * useReducer — 状態管理のための React Hook。
   *
   * なぜ useState ではなく useReducer？:
   * - useState はシンプルな値（数値、文字列、フラグなど）に適している
   * - useReducer は「複数の値が関連して変化する」場合に適している
   *   → position と direction は移動操作で同時に変化するため、一つの reducer でまとめて管理
   * - reducer パターンは「状態の更新ロジック」を関数に集約できるため、
   *   ロジックのテストがしやすい
   *
   * 引数:
   * - 第1引数: reducer 関数（状態の更新ロジック）
   * - 第2引数: 初期状態
   *
   * 戻り値:
   * - state: 現在の状態
   * - dispatch: アクションを送信する関数（dispatch({ type: 'move', direction: 'up' })）
   *
   * 'down' as Direction — 初期状態でプレイヤーが下を向いている。
   * なぜ as Direction？: TypeScript は 'down' を string 型と推論してしまうため、
   * Direction 型であることを明示する。
   */
  const [state, dispatch] = useReducer(createReducer(map), {
    position: map.playerStart,
    direction: 'down' as Direction,
  });

  /*
   * useCallback — 関数をメモ化（キャッシュ）する React Hook。
   *
   * なぜ useCallback？:
   * - コンポーネントが再レンダリングされるたびに、関数は新しく生成される
   * - useCallback を使うと「依存配列が変わらない限り、同じ関数の参照を返す」
   * - handleKeyDown は useEffect の依存配列に入っているため、
   *   関数の参照が毎回変わると useEffect も毎回再実行されてしまう
   * - useCallback で安定化すれば、useEffect は初回マウント時にだけ実行される
   *
   * 依存配列 [] — 空配列 = 依存するものが何もない = 関数は一度だけ生成される。
   * なぜ空で安全？:
   * - dispatch は React が保証する安定した関数（参照が変わらない）
   * - CODE_TO_DIRECTION はモジュールレベルの定数（変わらない）
   * - したがって、この関数が依存する値は再レンダリングで変化しない
   */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const direction = CODE_TO_DIRECTION.get(e.code);
    if (direction) {
      /*
       * e.preventDefault() — ブラウザのデフォルト動作を無効化する。
       * なぜ？:
       * - 矢印キーを押すとブラウザはページをスクロールしようとする
       * - ゲームでは矢印キーをキャラクター移動に使いたいので、スクロールを防ぐ
       * - direction が有効な場合のみ preventDefault するので、
       *   他のキー（Tab, Escape など）のデフォルト動作は妨げない
       */
      e.preventDefault();
      dispatch({ type: 'move', direction });
    }
  }, []);

  /*
   * useEffect — 副作用（Side Effect）を扱う React Hook。
   *
   * 「副作用」とは？:
   * - React の「画面を描画する」という本来の仕事以外の処理のこと
   * - 例: DOMイベントリスナーの登録、API呼び出し、タイマーの設定
   *
   * なぜ useEffect を使う？:
   * - window.addEventListener は React の管理外の DOM 操作
   * - useEffect の中に書くことで:
   *   1. コンポーネントがマウント（画面に表示）されたときにリスナーを登録
   *   2. アンマウント（画面から消える）ときにリスナーを解除
   * - リスナーの登録/解除のライフサイクルを React が管理してくれる
   *
   * return () => window.removeEventListener(...)
   * → これは「クリーンアップ関数」。useEffect が再実行される前、または
   *   コンポーネントがアンマウントされるときに呼ばれる。
   * なぜクリーンアップが必要？:
   * - removeEventListener しないと、コンポーネントが消えてもリスナーが残り続ける
   * - メモリリーク（使われないのにメモリを占有し続ける状態）の原因になる
   * - 再登録されるたびにリスナーが重複し、1回のキー入力で2回移動するバグの原因にもなる
   *
   * 依存配列 [handleKeyDown]:
   * - handleKeyDown が変わったときだけ useEffect を再実行する
   * - useCallback で安定化しているので、実質的に初回マウント時のみ実行される
   * - 空配列 [] でも同じ結果だが、ESLint の react-hooks/exhaustive-deps ルールが
   *   「useEffect 内で参照している値は依存配列に入れろ」と警告するため、明示している
   */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /*
   * return state — フックの戻り値。
   * App.tsx で const player = usePlayerMovement(grasslandMap) として受け取り、
   * player.position や player.direction でアクセスする。
   *
   * なぜ state をそのまま返す？:
   * - PlayerState の構造（position, direction）がそのまま利用者にとって使いやすい
   * - 将来、HP や レベルなどの情報を state に追加しても、呼び出し側の変更は最小限で済む
   */
  return state;
}
