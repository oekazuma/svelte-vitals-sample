# svelte-vitals-sample

svelte-vitals 紹介デモ用のSvelteKitアプリ。「Sveltebean Coffee Roasters」という架空の小規模コーヒー
焙煎所サイトで、SEO・Performance・Correctness・Security・Architecture の5カテゴリすべてに
自然な形で問題を仕込んである。

## 発表前チェックリスト

- [ ] `svelte-vitals` 本体（`~/localRepo/svelte-vitals`）で `pnpm -r build` 済みであること
      （このリポジトリは `pnpm link` でローカルビルドを直接参照している）
- [ ] `pnpm install` 済みであること
- [ ] `pnpm exec svelte-vitals --version` がエラーなく実行できること
- [ ] `demo-pr` ブランチが GitHub に push 済みであること（`git ls-remote origin demo-pr`）
- [ ] ネットワークが不安定な会場では、事前に `pnpm dev` を一度起動して動作確認しておく

## 発表中に使うコマンド

### 1. CLI 実行と Health スコア

```bash
pnpm demo:scan
```

critical が6件 — `/contact` の SEO001（title欠落、このルートだけ）と、SEO002（meta description欠落）が
全5ルートに1件ずつ。レイアウトに `<svelte:head>` が一切無いのが原因で、warning/infoの SEO003・SEO008も
同じ理由で全ルートに出ている。他に PERF001（blog）、CORRECT002（blog詳細）、SEC001・ARCH002（product）、
SEC002（contact）、og:image/og:title等の細かいSEO系warning/infoが多数続く——「素のSvelteKitアプリはこれくらい
何も持っていない」という導入として使う。

### 2. ライブダッシュボード

```bash
pnpm dev
```

ブラウザで `http://localhost:5173/__svelte-vitals/` を開く（起動ログにもURLが出る）。

### 3. ライブ修正の例（スコアが動く瞬間）

**修正A: contact ページに `<title>` と `<meta name="description">` を追加（criticalを2件解除）**

`src/routes/contact/+page.svelte` の `<script>` の直後に追加:

```svelte
<svelte:head>
  <title>Contact · Sveltebean Coffee Roasters</title>
  <meta name="description" content="Get in touch with Sveltebean Coffee Roasters." />
</svelte:head>
```

再実行すると6件あったcriticalが4件に減る（残り4件は他の4ルートのSEO002 —
「1ページ直しても他はまだ、だからCIゲートが要る」という流れで話す）。

**修正B: blog 一覧の画像に width/height を追加（PERF001を1件解消）**

（`/blog` 側の1件だけ解消される。`/blog/[slug]` 側は別途もう1件残る。）

`src/routes/blog/+page.svelte` の `<img>` を:

```svelte
<img src={post.image} alt={post.title} width="640" height="400" />
```

修正後に `pnpm demo:scan` を再実行してスコアの変化を見せる。

### 4. GitHub PR連携

```bash
pnpm demo:pr
```

PRが開いたら GitHub Actions（`.github/workflows/svelte-vitals.yml`）が自動実行され、
インライン注釈・ジョブサマリ・固定PRコメントが `products/[id]/reviews/+page.svelte` の
新規問題（SEO001, SEO002, SEO003, SEO008, PERF001, SEC001 など。実際にはCORRECT001や
og:image/twitter:card系の細かいwarning/infoも一緒に並ぶ）に対して付く。`main` 側の
既存の問題は `diff`/`baseline` が `origin/main` 基準のため出てこない。

## うまくいかなかったときのフォールバック

- ダッシュボードが開かない → CLI出力とこのREADMEのスクリーンショットで代替
- Wi-Fiが不安定 → `pnpm demo:pr` はスキップし、`pnpm demo:scan:diff` の
  ローカル出力で同じ内容を説明する
