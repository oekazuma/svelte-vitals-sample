# svelte-vitals-sample

[svelte-vitals](https://github.com/oekazuma/svelte-vitals) を実際に動かして試すための playground。
「Sveltebean Coffee Roasters」という架空の小規模コーヒー焙煎所サイト(トップ・ブログ一覧・ブログ詳細・
商品詳細・問い合わせの5ページ)に、SEO・Performance・Correctness・Security・Architecture の5カテゴリ
すべてにまたがる問題を自然な形で仕込んである。svelte-vitals の各機能(CLI、各種レポーター、ライブ
ダッシュボード、config、MCPサーバー、GitHub PR連携)を一通りその場で試せる。

## セットアップ

このリポジトリは `svelte-vitals` / `@svelte-vitals/vite` / `@svelte-vitals/mcp` を npm 経由ではなく
`pnpm link` で `svelte-vitals` 本体のローカルビルドを直接参照している(`package.json` の
`link:../svelte-vitals/packages/*` を参照)。svelte-vitals 本体に手を加えた変更もすぐ反映される。

```bash
# svelte-vitals 本体側でビルドしておく
cd ../svelte-vitals && pnpm -r build

# このリポジトリ側
cd ../svelte-vitals-sample
pnpm install
pnpm exec svelte-vitals --version   # エラーなく実行できればOK
```

## 試せること

### 1. CLIスキャン(各レポーター)

```bash
pnpm scan        # console/agentレポーター(--verbose)。findingsを1件ずつ、fix付きで表示
pnpm scan:json   # --reporter json — 構造化データとして取得
pnpm scan:md     # --reporter md — Markdownレポート(PRコメントと同じ形式)
pnpm scan:html   # --reporter html — svelte-vitals-report.html を生成(ブラウザで開ける)
pnpm scan:diff   # --diff main — demo-pr ブランチ上で、mainとの差分だけに絞って見る
```

Health は 88/100 前後。critical が6件 —`/contact` の SEO001(title欠落、このルートだけ)と、
SEO002(meta description欠落)が全5ルートに1件ずつ。レイアウト(`src/routes/+layout.svelte`)に
`<svelte:head>` が一切無いのが原因で、warning/infoのSEO003・SEO008も同じ理由で全ルートに出ている。
他に PERF001(blog)、CORRECT002(blog詳細)、SEC001・ARCH002(product)、SEC002(contact)、
og:image/og:title等の細かいSEO系warning/infoが多数続く。詳しくは下の「サイト構成」を参照。

### 2. ライブダッシュボード

```bash
pnpm dev
```

`http://localhost:5173/__svelte-vitals/` を開く(起動ログにもURLが出る)。ルートごとの内訳、
findingごとのAIエージェント向けコピー用プロンプトなどをブラウザで確認できる。

### 3. ルール設定を試す(config file)

`svelte-vitals.config.ts` に、コメントアウトされた設定例が一通り入っている:

```js
export default defineConfig({
	// treatDynamicAs: 'pass', // 'pass' | 'warn' | 'fail'
	// metaComponents: ['Seo'],
	// rules: {}, // e.g. { SEO001: 'off' }
	// failOn: 'critical',
	// weights: {} // e.g. { seo: 2 }
});
```

例えば `rules: { SEC001: 'off' }` のコメントを外して `pnpm scan` を再実行すると、product ページの
`{@html}` 警告が消えるのが確認できる。`--rules`/`--ignore`/`--weights` などのCLIフラグでも同じことを
その場で試せる(`pnpm exec svelte-vitals --ignore SEC001`)。

### 4. MCPサーバーを試す

`.mcp.json` に `@svelte-vitals/mcp` のローカルビルドを直接指すエントリを用意済み。このディレクトリを
Claude Code などMCP対応クライアントで開くと、`analyze`/`explain_rule` ツールがそのまま使える
(手動セットアップの詳細は [MCPサーバーのドキュメント](https://oekazuma.github.io/svelte-vitals/guides/mcp/)を参照)。

### 5. GitHub PR連携(CIゲート)を試す

`demo-pr` ブランチに、新しいページ(`/products/[id]/reviews`)を追加するコミットが用意してある。

```bash
pnpm pr
```

PRが開くと GitHub Actions(`.github/workflows/svelte-vitals.yml`)が自動実行され、インライン注釈・
ジョブサマリ・固定PRコメントが `products/[id]/reviews/+page.svelte` の新規問題(SEO001, SEO002,
SEO003, SEO008, PERF001, SEC001 など)に対して付く。`main` 側の既存の問題は `diff`/`baseline` が
`origin/main` 基準のため出てこない — CIゲートは「このPRが新しく持ち込んだ問題」だけに反応する。

## サイト構成

| ルート / ファイル                             | 仕込んである問題                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------------------ |
| `src/routes/+layout.svelte`                   | `<svelte:head>` が無い(全ルートのSEO003/SEO008の原因)                                |
| `/`(トップ)                                   | 上記に加え、タイトルが短すぎる(SEO022)                                               |
| `/blog`                                       | `<img>` に width/height 無し(PERF001)、`{#each}` にキー無し(CORRECT001)              |
| `/blog/[slug]`                                | `<img>` に width/height 無し(PERF001)、`$effect` が `$state` の代入だけ(CORRECT002)  |
| `/products/[id]`                              | `{@html}` が未サニタイズ(SEC001)、`ProductInfo` コンポーネントが11個のprops(ARCH002) |
| `/contact`                                    | `<title>` が無い唯一のルート(SEO001, critical)、`javascript:` URL(SEC002)            |
| `demo-pr` ブランチの `/products/[id]/reviews` | 上記いずれとも独立した新規ページ。SEO001/SEO002/PERF001/SEC001を新規に持ち込む       |

## うまくいかないとき

- `pnpm install` が `link:` protocolで失敗する → `../svelte-vitals` が存在し、`pnpm -r build` 済みか確認
- ダッシュボードが `/__svelte-vitals/` を返さない → `pnpm dev` のログにエラーが出ていないか確認
- `pnpm pr` が失敗する → 既にPRが開いている(`gh pr list --repo oekazuma/svelte-vitals-sample`で確認)か、`gh auth status` を確認
