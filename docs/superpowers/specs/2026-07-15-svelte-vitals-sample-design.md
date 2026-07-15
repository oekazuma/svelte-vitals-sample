# svelte-vitals-sample デザイン

## 背景・目的

svelte-vitals を紹介する15分間の発表向けに、実際に動かして見せるデモ環境を新しい別リポジトリ `svelte-vitals-sample` として用意する。発表では以下の4点を実演する:

1. CLI 実行（console reporter）と Health スコア
2. ライブダッシュボード（`vite dev` 中の `/__svelte-vitals/`）
3. その場での軽い修正とスコア改善の再確認
4. GitHub PR インテグレーション（インライン注釈 + サマリコメント）

MCP サーバーのデモは今回のスコープ外。

## リポジトリ

- 場所: `~/localRepo/svelte-vitals-sample`（`svelte-vitals` の隣、独立した git リポジトリ）
- GitHub: `oekazuma/svelte-vitals-sample` として新規作成し push（`gh repo create`、認証済みアカウント `oekazuma` を使用）
- svelte-vitals 本体パッケージ（`svelte-vitals` CLI, `@svelte-vitals/vite`）は npm 公開版ではなく、このモノレポを `pnpm link --global` でローカル参照する。発表直前まで core/cli に手を入れても即座に反映されるようにするため。
  - 事前準備として `svelte-vitals` リポジトリ側で `pnpm build` 済みであることが前提。発表当日にモノレポを更新した場合は再ビルドが必要（チートシートに明記）。

## サンプルアプリの中身

3〜5ページの小規模なミニブログ/EC 風 SvelteKit アプリ。ページ構成そのものを自然なコンテンツにすることで、5カテゴリ（SEO / Performance / Correctness / Security / Architecture）の問題を「デモ専用の不自然なコンポーネント」ではなく実アプリのコードとして仕込む。

想定ページ:
- `/`（トップ、記事＋商品のハイライト）
- `/blog`（記事一覧）
- `/blog/[slug]`（記事詳細）
- `/products/[id]`（商品詳細）
- `/contact`（問い合わせフォーム）

### 仕込む問題（`main` ブランチ = 発表の初期状態）

各カテゴリから少なくとも1件、CLI実行で一目で分かる代表的な問題を仕込む。具体的なルールIDは実装時に `docs/src/content/docs/rules/` を参照して選定するが、方向性は以下の通り:

- **SEO**: 一部ページで `<title>` 欠落 or 重複、`meta description` なし、OGP画像なし
- **Performance**: 大きな `<img>` に `loading`/サイズ指定なし、不要に重い `load` 処理
- **Correctness**: Svelte 5 移行漏れ（`export let` と `$props()` の混在など）
- **Security**: 外部リンクの `target="_blank"` に `rel="noopener"` 欠如、フォーム周りでの `{@html}` 誤用
- **Architecture**: サーバー専用処理のクライアント漏れなど

Health スコアが「良すぎず悪すぎない」— 発表中に一目で課題が分かり、かつ軽い修正で目に見えて改善する状態に調整する。

## デモフロー

1. **CLI + Health スコア**: `npx svelte-vitals`（pnpm link 経由でローカルビルドが動く）を実行し、console reporter で5カテゴリ内訳とHealthスコアを見せる。
2. **ライブダッシュボード**: `pnpm dev` で `/__svelte-vitals/` を開き、検索・フィルタ、findingごとのAIエージェント向けコピー用プロンプトを見せる。
3. **ライブ修正**: ダッシュボードまたはCLI出力から1〜2件を選んでその場で直し、再実行でスコアが上がることを見せる。
4. **GitHub PR連携**: 事前に用意した `demo-pr` ブランチ（新たな問題を追加済み）から発表中に `gh pr create` するだけでPRを作成。事前に `svelte-vitals ci install` で仕込んだ GitHub Actions が自動でインライン注釈とサマリコメントを付ける様子を見せる。

`demo-pr` ブランチは事前に GitHub へ push 済みにしておき、本番は `gh pr create` 一発で開けるようにする（タイピングミス等のリスクを避けるため）。

## セットアップ物

- `svelte-vitals ci install` で GitHub Actions ワークフローを事前に仕込む（PRへのインライン注釈・サマリコメント用）。
- リポジトリ直下に日本語のチートシート README を用意する。内容:
  - 発表前チェックリスト（pnpm link の確認、`pnpm build`済みか、`demo-pr` ブランチがpush済みか等）
  - 発表中に叩くコマンド一覧（コピペ用）と想定所要時間の目安
  - 何かに失敗した場合のフォールバック（例: ローカルダッシュボードが開かない場合はスクリーンショット/GIFで代替 等）

## スコープ外

- MCP サーバー（`@svelte-vitals/mcp`）のデモ
- SARIFアップロードやCode Scanning連携の実演（GitHub Actionsの仕込みには含めない、PRアノテーション+サマリコメントに絞る）
- 複雑な認証・DB連携などの本格的なバックエンド機能（デモ用アプリはあくまで静的解析対象としての体裁が整っていればよい）
