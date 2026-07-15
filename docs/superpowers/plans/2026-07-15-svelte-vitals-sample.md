# svelte-vitals-sample Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone, GitHub-hosted SvelteKit demo project (`svelte-vitals-sample`) that a 15-minute talk can run live to show `svelte-vitals`'s CLI/Health score, live dashboard, and GitHub PR integration.

**Architecture:** A small SvelteKit "coffee roasting" site (top page, blog list/detail, product detail, contact) scaffolded with `sv create`, wired to the `svelte-vitals` monorepo via `pnpm link` (not the npm registry) so unreleased local changes show up immediately. Each page intentionally contains realistic, uncontrived violations covering all five svelte-vitals categories (SEO, Performance, Correctness, Security, Architecture) on `main`. A second branch, `demo-pr`, adds one new page with fresh violations, ready for a live `gh pr create` to demonstrate the GitHub Actions annotation flow.

**Tech Stack:** SvelteKit (minimal + TypeScript template via `sv create`), pnpm, `svelte-vitals` CLI + `@svelte-vitals/vite` (linked locally), GitHub Actions via `svelte-vitals ci install`, GitHub CLI (`gh`).

## Global Constraints

- Repo location: `/Users/oekazuma/localRepo/svelte-vitals-sample`, sibling to `/Users/oekazuma/localRepo/svelte-vitals`.
- GitHub repo: `oekazuma/svelte-vitals-sample`, created and pushed via `gh` (already authenticated as `oekazuma`).
- `svelte-vitals` and `@svelte-vitals/vite` are consumed via `pnpm link <path>` against the local monorepo build (`packages/cli`, `packages/vite`) — never installed from the npm registry. The monorepo must be built (`pnpm -r build` from `/Users/oekazuma/localRepo/svelte-vitals`) before linking; each task that runs the linked CLI assumes this is current.
- Node.js 22.13+ (this machine has v24.18.0 — OK). Package manager: pnpm.
- The pinned `sv create` output has no separate `svelte.config.js` — adapter/compiler config lives inline in `vite.config.ts`'s `sveltekit()` call. `svelte-vitals` project detection accepts this (it checks `@sveltejs/kit` in `package.json`), so no task should attempt to create or edit a `svelte.config.js` that doesn't exist.
- Scope explicitly excludes: MCP server demo, SARIF/Code Scanning upload, ARCH001 (component-size) and PERF003 (preload `as`) seeded findings, a11y (removed from svelte-vitals entirely).
- The `demo-pr` branch must only be **pushed**, never opened as a PR during setup — the PR itself is opened live during the talk via `gh pr create`.
- Cheat-sheet README is written in Japanese.
- Brand/content theme: "Sveltebean Coffee Roasters," a small-batch coffee roaster — used consistently across all pages so seeded issues read as normal app code, not contrived demo fixtures.

---

### Task 1: Scaffold the SvelteKit project and initialize git

**Files:**
- Create: `/Users/oekazuma/localRepo/svelte-vitals-sample/` (entire scaffolded project via `sv create`)

**Interfaces:**
- Consumes: nothing (first task).
- Produces: a working SvelteKit minimal+TS project at `/Users/oekazuma/localRepo/svelte-vitals-sample` with `pnpm dev`/`pnpm build` scripts, git-initialized, first commit made.

- [ ] **Step 1: Scaffold with the SvelteKit CLI**

Run from `/Users/oekazuma/localRepo`:

```bash
cd /Users/oekazuma/localRepo
pnpm dlx sv create svelte-vitals-sample --template minimal --types ts --add prettier eslint --install pnpm
```

- [ ] **Step 2: Verify the scaffold**

```bash
cd /Users/oekazuma/localRepo/svelte-vitals-sample
ls src/routes
```

Expected: `+layout.svelte` and/or `+page.svelte` present (exact minimal-template file set), plus `package.json` and `vite.config.ts` at the project root. The `sv create` version pinned by this plan folds SvelteKit's adapter/compiler config directly into the `sveltekit()` plugin call inside `vite.config.ts` rather than emitting a separate `svelte.config.js` — that is correct, current output, not a scaffolding error (`svelte-vitals` detects the project via `@sveltejs/kit` in `package.json`, not via `svelte.config.js`; see `packages/cli/src/providers/source/project.ts`). Do not create a `svelte.config.js` by hand.

- [ ] **Step 3: Confirm the dev server boots**

```bash
pnpm dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/
kill %1
```

Expected: `200`.

- [ ] **Step 4: Initialize git and commit the scaffold**

```bash
cd /Users/oekazuma/localRepo/svelte-vitals-sample
git status   # confirm not already a repo, or that sv create didn't init one with unexpected state
git init -b main 2>/dev/null || true
git add -A
git commit -m "chore: scaffold SvelteKit project with sv create"
```

Expected: a clean `git log` showing one commit.

---

### Task 2: Link the local svelte-vitals packages

**Files:**
- Modify: `/Users/oekazuma/localRepo/svelte-vitals-sample/package.json` (adds `svelte-vitals` and `@svelte-vitals/vite` as linked dependencies)

**Interfaces:**
- Consumes: the scaffolded project from Task 1; the built monorepo packages `packages/cli` (`svelte-vitals` bin at `dist/bin.js`) and `packages/vite` (`@svelte-vitals/vite`, exports `svelteVitals` and `svelteVitalsHandle`) from `/Users/oekazuma/localRepo/svelte-vitals`.
- Produces: `pnpm exec svelte-vitals` resolves to the monorepo's local build inside the sample project.

- [ ] **Step 1: Ensure the monorepo is built**

```bash
cd /Users/oekazuma/localRepo/svelte-vitals
pnpm -r build
ls packages/cli/dist/bin.js packages/vite/dist/index.js
```

Expected: both files exist (no error from `ls`).

- [ ] **Step 2: Link the CLI and Vite plugin into the sample project**

```bash
cd /Users/oekazuma/localRepo/svelte-vitals-sample
pnpm link ../svelte-vitals/packages/cli
pnpm link ../svelte-vitals/packages/vite
```

- [ ] **Step 3: Verify the link**

```bash
pnpm exec svelte-vitals --version
cat package.json | grep -A2 '"svelte-vitals"\|"@svelte-vitals/vite"'
```

Expected: a version string is printed (no "command not found"), and `package.json`'s `devDependencies` show `"svelte-vitals": "link:../svelte-vitals/packages/cli"` and `"@svelte-vitals/vite": "link:../svelte-vitals/packages/vite"`.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: link svelte-vitals and @svelte-vitals/vite from the local monorepo"
```

---

### Task 3: Wire the live dashboard (Vite plugin)

**Files:**
- Modify: `/Users/oekazuma/localRepo/svelte-vitals-sample/vite.config.ts`

**Interfaces:**
- Consumes: `@svelte-vitals/vite`'s `svelteVitals()` export (linked in Task 2).
- Produces: `pnpm dev` serves the live dashboard at `/__svelte-vitals/`, on by default.

- [ ] **Step 1: Register the plugin via the install wizard**

```bash
cd /Users/oekazuma/localRepo/svelte-vitals-sample
pnpm exec svelte-vitals install --client vite-plugin --yes
```

- [ ] **Step 2: Verify `vite.config.ts` was codemodded**

```bash
cat vite.config.ts
```

Expected: `import { svelteVitals } from '@svelte-vitals/vite';` and `svelteVitals()` present in the `plugins` array, alongside the existing `sveltekit()` plugin. If the codemod declined to touch the file (unrecognized shape), apply the edit by hand to match the snippet it prints, using the exact pattern from `docs/src/content/docs/guides/dev-dashboard.md`.

- [ ] **Step 3: Verify the dashboard serves**

```bash
pnpm dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/__svelte-vitals/
kill %1
```

Expected: `200`.

- [ ] **Step 4: Commit**

```bash
git add vite.config.ts
git commit -m "feat: enable the svelte-vitals live dashboard in dev"
```

---

### Task 4: Shared layout + top page

**Files:**
- Modify: `/Users/oekazuma/localRepo/svelte-vitals-sample/src/routes/+layout.svelte`
- Modify: `/Users/oekazuma/localRepo/svelte-vitals-sample/src/routes/+page.svelte`

**Interfaces:**
- Consumes: nothing beyond the scaffold.
- Produces: a shared nav/footer shell (`{@render children()}` slot) that every later route renders inside; no `<svelte:head>` in the layout, so canonical/JSON-LD are never inherited — every route must supply its own or be flagged (SEO003, SEO008 are deliberately left unfixed on every route in this plan).

- [ ] **Step 1: Write the shared layout**

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  let { children } = $props();
</script>

<div class="site">
  <header class="site-header">
    <a href="/" class="brand">Sveltebean</a>
    <nav>
      <a href="/blog">Blog</a>
      <a href="/products/1">Shop</a>
      <a href="/contact">Contact</a>
    </nav>
  </header>

  <main>
    {@render children()}
  </main>

  <footer class="site-footer">
    <p>&copy; 2026 Sveltebean Coffee Roasters</p>
  </footer>
</div>

<style>
  .site {
    max-width: 720px;
    margin: 0 auto;
    padding: 1.5rem;
    font-family: system-ui, sans-serif;
  }
  .site-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  nav a {
    margin-left: 1rem;
  }
</style>
```

- [ ] **Step 2: Write the top page**

```svelte
<!-- src/routes/+page.svelte -->
<script>
  const featuredPost = {
    slug: 'first-light-roast',
    title: 'Why First Light Roast Tastes Different at 6am',
    excerpt: 'A short walk through what actually happens in the first ten minutes of a roast.'
  };

  const featuredProduct = {
    id: 1,
    name: 'Ethiopia Yirgacheffe',
    price: '¥1,800'
  };
</script>

<svelte:head>
  <title>Sveltebean Coffee Roasters</title>
</svelte:head>

<section>
  <h1>Sveltebean Coffee Roasters</h1>
  <p>Small-batch coffee, roasted weekly in Kyoto.</p>
</section>

<section>
  <h2>Latest from the blog</h2>
  <article>
    <h3><a href="/blog/{featuredPost.slug}">{featuredPost.title}</a></h3>
    <p>{featuredPost.excerpt}</p>
  </article>
</section>

<section>
  <h2>Featured bean</h2>
  <article>
    <h3><a href="/products/{featuredProduct.id}">{featuredProduct.name}</a></h3>
    <p>{featuredProduct.price}</p>
  </article>
</section>
```

- [ ] **Step 3: Verify with the CLI**

```bash
pnpm exec svelte-vitals --verbose 2>&1 | grep -E "SEO001|SEO003|SEO008" | grep "routes/+page.svelte"
```

Expected: no `SEO001` line for `src/routes/+page.svelte` (title is set), but one `SEO003` and one `SEO008` line for it.

- [ ] **Step 4: Commit**

```bash
git add src/routes/+layout.svelte src/routes/+page.svelte
git commit -m "feat: add shared layout and top page"
```

---

### Task 5: Blog list + blog detail pages

**Files:**
- Create: `/Users/oekazuma/localRepo/svelte-vitals-sample/src/routes/blog/+page.svelte`
- Create: `/Users/oekazuma/localRepo/svelte-vitals-sample/src/routes/blog/[slug]/+page.svelte`
- Create: `/Users/oekazuma/localRepo/svelte-vitals-sample/static/images/roast.svg`
- Create: `/Users/oekazuma/localRepo/svelte-vitals-sample/static/images/beans.svg`
- Create: `/Users/oekazuma/localRepo/svelte-vitals-sample/static/images/grinder.svg`

**Interfaces:**
- Consumes: the shared layout from Task 4; `$app/state`'s `page` export (SvelteKit built-in).
- Produces: `/blog` and `/blog/[slug]` routes. Seeds PERF001 (`<img>` missing width/height, on both list and detail) and CORRECT002 (`$effect` that only assigns a `$state` variable, on detail).

- [ ] **Step 1: Add placeholder images**

```svg
<!-- static/images/roast.svg -->
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
  <rect width="640" height="400" fill="#3b2a20"/>
  <text x="50%" y="50%" fill="#f5efe6" font-family="system-ui, sans-serif" font-size="28" text-anchor="middle" dominant-baseline="middle">Roast</text>
</svg>
```

```svg
<!-- static/images/beans.svg -->
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
  <rect width="640" height="400" fill="#5a3d2b"/>
  <text x="50%" y="50%" fill="#f5efe6" font-family="system-ui, sans-serif" font-size="28" text-anchor="middle" dominant-baseline="middle">Beans</text>
</svg>
```

```svg
<!-- static/images/grinder.svg -->
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
  <rect width="640" height="400" fill="#2b2b2b"/>
  <text x="50%" y="50%" fill="#f5efe6" font-family="system-ui, sans-serif" font-size="28" text-anchor="middle" dominant-baseline="middle">Grinder</text>
</svg>
```

- [ ] **Step 2: Write the blog list page**

```svelte
<!-- src/routes/blog/+page.svelte -->
<script>
  const posts = [
    { slug: 'first-light-roast', title: 'Why First Light Roast Tastes Different at 6am', image: '/images/roast.svg' },
    { slug: 'washed-vs-natural', title: 'Washed vs. Natural: A Field Guide', image: '/images/beans.svg' },
    { slug: 'grind-size-cheat-sheet', title: 'The Grind Size Cheat Sheet We Actually Use', image: '/images/grinder.svg' }
  ];
</script>

<svelte:head>
  <title>Blog · Sveltebean Coffee Roasters</title>
</svelte:head>

<h1>Blog</h1>

<ul class="posts">
  {#each posts as post}
    <li>
      <img src={post.image} alt={post.title} />
      <h2><a href="/blog/{post.slug}">{post.title}</a></h2>
    </li>
  {/each}
</ul>
```

- [ ] **Step 3: Write the blog detail page**

```svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script>
  import { page } from '$app/state';

  const posts = {
    'first-light-roast': {
      title: 'Why First Light Roast Tastes Different at 6am',
      image: '/images/roast.svg',
      content:
        'The first ten minutes of a roast set the tone for everything that follows. Moisture leaves the bean, the smell shifts from grassy to bready, and the roaster has to decide how much heat to carry into first crack. Taste it right after roasting and you get brightness that fades within a week as the bean degasses.'
    },
    'washed-vs-natural': {
      title: 'Washed vs. Natural: A Field Guide',
      image: '/images/beans.svg',
      content:
        'Washed process removes the fruit before drying, giving a cleaner, brighter cup. Natural process dries the whole cherry around the bean, giving heavier body and fruit-forward sweetness. Neither is better — they are different tools for different beans.'
    },
    'grind-size-cheat-sheet': {
      title: 'The Grind Size Cheat Sheet We Actually Use',
      image: '/images/grinder.svg',
      content:
        'Espresso wants fine, table-salt grind. Pour-over wants medium, closer to coarse sand. French press wants coarse, like breadcrumbs. When in doubt, grind slightly coarser and adjust your brew time instead of chasing the perfect number.'
    }
  };

  const post = $derived(posts[page.params.slug]);

  let readMinutes = $state(0);
  $effect(() => {
    readMinutes = Math.max(1, Math.ceil(post.content.split(' ').length / 200));
  });
</script>

<svelte:head>
  <title>{post.title} · Sveltebean Coffee Roasters</title>
</svelte:head>

<article>
  <h1>{post.title}</h1>
  <p class="meta">{readMinutes} min read</p>
  <img src={post.image} alt={post.title} />
  <p>{post.content}</p>
</article>
```

- [ ] **Step 4: Verify with the CLI**

```bash
pnpm exec svelte-vitals --verbose 2>&1 | grep -E "PERF001|CORRECT002" | grep blog
```

Expected: one `PERF001` finding for `src/routes/blog/+page.svelte` and one for `src/routes/blog/[slug]/+page.svelte`, and one `CORRECT002` finding for `src/routes/blog/[slug]/+page.svelte`. (Note: `svelte-vitals` walks the static AST once per source `<img>` element — an `<img>` written once inside an `{#each}` block is one AST node and yields exactly one finding, regardless of how many items the loop renders at runtime. The blog list page has one `<img>` written once inside `{#each posts as post}`, so it's one finding, not three — do not expect a count matching the number of posts.)

- [ ] **Step 5: Commit**

```bash
git add src/routes/blog static/images
git commit -m "feat: add blog list and detail pages"
```

---

### Task 6: Product detail page

**Files:**
- Create: `/Users/oekazuma/localRepo/svelte-vitals-sample/src/lib/components/ProductInfo.svelte`
- Create: `/Users/oekazuma/localRepo/svelte-vitals-sample/src/routes/products/[id]/+page.svelte`

**Interfaces:**
- Consumes: the shared layout from Task 4; `$app/state`'s `page` export.
- Produces: `/products/[id]` route and a reusable `ProductInfo` component consumed by both this task and Task 11 (`demo-pr` branch's reviews page links back to this route). Seeds SEC001 (`{@html}` on an unsanitized description) and ARCH002 (`ProductInfo` destructures 11 props).

- [ ] **Step 1: Write the ProductInfo component**

```svelte
<!-- src/lib/components/ProductInfo.svelte -->
<script>
  let {
    name,
    origin,
    process,
    altitude,
    roastLevel,
    tastingNotes,
    price,
    weight,
    stock,
    roaster,
    farm
  } = $props();
</script>

<dl class="product-info">
  <dt>Origin</dt>
  <dd>{origin}</dd>
  <dt>Process</dt>
  <dd>{process}</dd>
  <dt>Altitude</dt>
  <dd>{altitude}</dd>
  <dt>Roast level</dt>
  <dd>{roastLevel}</dd>
  <dt>Tasting notes</dt>
  <dd>{tastingNotes}</dd>
  <dt>Price</dt>
  <dd>{price}</dd>
  <dt>Weight</dt>
  <dd>{weight}</dd>
  <dt>In stock</dt>
  <dd>{stock}</dd>
  <dt>Roaster</dt>
  <dd>{roaster}</dd>
  <dt>Farm</dt>
  <dd>{farm}</dd>
</dl>
```

Note: `name` is destructured but unused in the template (the parent page renders it as the `<h1>`) — this matches ARCH002's prop-count check, which counts destructured props regardless of template usage.

- [ ] **Step 2: Write the product detail page**

```svelte
<!-- src/routes/products/[id]/+page.svelte -->
<script>
  import { page } from '$app/state';
  import ProductInfo from '$lib/components/ProductInfo.svelte';

  const products = {
    '1': {
      name: 'Ethiopia Yirgacheffe',
      origin: 'Yirgacheffe, Ethiopia',
      process: 'Washed',
      altitude: '1,900–2,200m',
      roastLevel: 'Light',
      tastingNotes: 'Jasmine, bergamot, lemon',
      price: '¥1,800',
      weight: '200g',
      stock: 42,
      roaster: 'Sveltebean',
      farm: 'Konga Cooperative',
      descriptionHtml: '<p>A <strong>bright, floral</strong> washed Ethiopian with a tea-like body. Roasted weekly in small batches.</p>'
    }
  };

  const product = $derived(products[page.params.id]);
</script>

<svelte:head>
  <title>{product.name} · Sveltebean Coffee Roasters</title>
</svelte:head>

<article>
  <h1>{product.name}</h1>
  <ProductInfo
    name={product.name}
    origin={product.origin}
    process={product.process}
    altitude={product.altitude}
    roastLevel={product.roastLevel}
    tastingNotes={product.tastingNotes}
    price={product.price}
    weight={product.weight}
    stock={product.stock}
    roaster={product.roaster}
    farm={product.farm}
  />
  <div class="description">
    {@html product.descriptionHtml}
  </div>
  <p><a href="/products/{page.params.id}/reviews">Read customer reviews</a></p>
</article>
```

Note: the `/products/{id}/reviews` link points at a route that does not exist yet on `main` — it is added on the `demo-pr` branch in Task 11. That is intentional: the link is harmless (a 404 until the PR lands) and lets Task 11 land as a self-contained, realistic feature addition.

- [ ] **Step 3: Verify with the CLI**

```bash
pnpm exec svelte-vitals --verbose 2>&1 | grep -E "SEC001|ARCH002" | grep products
```

Expected: one `SEC001` finding and one `ARCH002` finding, both pointing at files under `src/routes/products/[id]/` or `src/lib/components/ProductInfo.svelte`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/components/ProductInfo.svelte src/routes/products
git commit -m "feat: add product detail page"
```

---

### Task 7: Contact page

**Files:**
- Create: `/Users/oekazuma/localRepo/svelte-vitals-sample/src/routes/contact/+page.svelte`

**Interfaces:**
- Consumes: the shared layout from Task 4.
- Produces: `/contact` route. Seeds SEO001 (critical — the only route in the project with no `<title>` at all) and SEC002 (`javascript:` URL).

- [ ] **Step 1: Write the contact page**

```svelte
<!-- src/routes/contact/+page.svelte -->
<script>
  let name = $state('');
  let email = $state('');
  let message = $state('');
  let sent = $state(false);

  function handleSubmit(event) {
    event.preventDefault();
    sent = true;
  }
</script>

<h1>Contact us</h1>

{#if sent}
  <p>Thanks, {name} — we'll get back to you at {email}.</p>
{:else}
  <form onsubmit={handleSubmit}>
    <label>
      Name
      <input type="text" bind:value={name} required />
    </label>
    <label>
      Email
      <input type="email" bind:value={email} required />
    </label>
    <label>
      Message
      <textarea bind:value={message} required></textarea>
    </label>
    <button type="submit">Send</button>
  </form>
{/if}

<p><a href="javascript:void(0)" onclick={() => window.scrollTo(0, 0)}>Back to top</a></p>
```

- [ ] **Step 2: Verify with the CLI**

```bash
pnpm exec svelte-vitals --verbose 2>&1 | grep -E "SEO001|SEC002" | grep contact
```

Expected: one `SEO001` finding (critical) and one `SEC002` finding, both for `src/routes/contact/+page.svelte`.

- [ ] **Step 3: Commit**

```bash
git add src/routes/contact
git commit -m "feat: add contact page"
```

---

### Task 8: Full-project verification pass

**Files:** none (verification only).

**Interfaces:**
- Consumes: the complete `main`-branch site from Tasks 4–7.
- Produces: a confirmed baseline — the exact Health score and finding counts this plan expects on `main`, recorded for Task 12's cheat sheet.

- [ ] **Step 1: Run the full scan**

```bash
cd /Users/oekazuma/localRepo/svelte-vitals-sample
pnpm exec svelte-vitals --verbose; echo "exit code: $?"
```

Expected, reading the output (corrected after the actual Task 8 run — the original plan under-counted the critical findings; see note below):
- `SEO001` (critical, "missing `<title>`") on `/contact` only.
- `SEO002` (critical, "missing `<meta name="description">`") on **all five routes** (`/`, `/blog`, `/blog/[slug]`, `/products/[id]`, `/contact`) — six critical findings total, not one. The layout has no `<svelte:head>` at all (by design, Task 4), and no page adds its own `<meta name="description">`, so this rule — also critical severity, like SEO001 — was missed when the seeded-issue set was designed. This is not a defect to fix: treat SEO002 as a second site-wide gap alongside SEO003/SEO008, all three stemming from the same missing-layout-head root cause. Update Task 12's live-fix script accordingly (see that task's note).
- `SEO003` and `SEO008` findings on all five routes, as originally planned.
- Additional warning/info findings not originally planned for, but expected and harmless noise consistent with a real, unpolished site: `SEO004`, `SEO005`, `SEO012`, `SEO011`, `SEO013`, `SEO007` (site-wide, missing sitemap.xml), `SEO022` (short title, `/`), `CORRECT001` (`{#each}` without a key, `/blog`), `PERF002`/`PERF006` (image loading/srcset, `/blog/[slug]`). Do not try to eliminate these — they were never in scope to avoid.
- One `PERF001` finding on `/blog` and one on `/blog/[slug]` — one per source `<img>` element (AST-node count, not runtime render count; see the corrected note in Task 5).
- One `CORRECT002` finding on `/blog/[slug]`.
- One `SEC001` and one `ARCH002` finding on `/products/[id]` (ARCH002 reports against `src/lib/components/ProductInfo.svelte` directly).
- One `SEC002` finding on `/contact`.
- `exit code: 1` (critical present).
- Health score around 88/100 (exact value may drift slightly with rule changes; treat as approximate).

- [ ] **Step 2: Confirm dashboard shows the same totals**

```bash
pnpm dev &
sleep 3
curl -s http://localhost:5173/__svelte-vitals/ -o /dev/null -w "%{http_code}\n"
kill %1
```

Expected: `200`. (Full data verification is visual — covered live during the talk; this step only confirms the route serves.)

- [ ] **Step 3: Record the baseline in a scratch note for Task 12**

No commit needed — this task's output feeds directly into the README written in Task 12. Keep the terminal output from Step 1 visible/copyable for that task.

---

### Task 9: Create the GitHub repository and push `main`

**Files:** none (repo/remote operations only).

**Interfaces:**
- Consumes: the `main` branch built in Tasks 1–8.
- Produces: `oekazuma/svelte-vitals-sample` on GitHub, with `main` pushed and tracked.

- [ ] **Step 1: Create the repo and push `main`**

```bash
cd /Users/oekazuma/localRepo/svelte-vitals-sample
gh repo create oekazuma/svelte-vitals-sample --public --source=. --remote=origin --push --description "Demo project for the svelte-vitals talk"
```

- [ ] **Step 2: Verify**

```bash
gh repo view oekazuma/svelte-vitals-sample --json url,defaultBranchRef --jq '.url, .defaultBranchRef.name'
```

Expected: the repo URL, then `main`.

---

### Task 10: Scaffold the GitHub Actions PR gate

**Files:**
- Create: `/Users/oekazuma/localRepo/svelte-vitals-sample/.github/workflows/svelte-vitals.yml`

**Interfaces:**
- Consumes: the pushed `main` branch from Task 9.
- Produces: a workflow that runs on every `pull_request`, posting inline annotations, a job summary, and a sticky PR comment via the public `oekazuma/svelte-vitals/packages/action` GitHub Action (resolved from the real published repo, independent of the local `pnpm link` setup — this step does not require the monorepo to be linked, only the CLI to write the YAML file).

- [ ] **Step 1: Run `ci install`**

```bash
cd /Users/oekazuma/localRepo/svelte-vitals-sample
pnpm exec svelte-vitals ci install
```

- [ ] **Step 2: Verify the workflow file**

```bash
cat .github/workflows/svelte-vitals.yml
```

Expected: a `pull_request` trigger, a step checking out with `fetch-depth: 0`, and a step with `uses: oekazuma/svelte-vitals/packages/action@<some ref>`.

- [ ] **Step 3: Commit and push**

```bash
git add .github/workflows/svelte-vitals.yml
git commit -m "ci: add svelte-vitals PR gate"
git push
```

---

### Task 11: `demo-pr` branch — new page with fresh violations

**Files:**
- Create: `/Users/oekazuma/localRepo/svelte-vitals-sample/src/routes/products/[id]/reviews/+page.svelte`
- Create: `/Users/oekazuma/localRepo/svelte-vitals-sample/static/images/avatar-aki.svg`
- Create: `/Users/oekazuma/localRepo/svelte-vitals-sample/static/images/avatar-ren.svg`

**Interfaces:**
- Consumes: the `/products/[id]/reviews` link already present in `main`'s product page (Task 6) — this task makes that link resolve to a real route for the first time.
- Produces: a `demo-pr` branch, pushed to GitHub but with no PR opened, containing a new route that is entirely new relative to `main` — so `svelte-vitals ci install`'s `diff`/`baseline` scoping (both relative to `origin/main`) will surface every finding in it as newly introduced when the PR is opened live.

- [ ] **Step 1: Create and check out the branch**

```bash
cd /Users/oekazuma/localRepo/svelte-vitals-sample
git checkout -b demo-pr
```

- [ ] **Step 2: Add placeholder avatar images**

```svg
<!-- static/images/avatar-aki.svg -->
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <rect width="96" height="96" fill="#7a5230"/>
  <text x="50%" y="50%" fill="#f5efe6" font-family="system-ui, sans-serif" font-size="32" text-anchor="middle" dominant-baseline="middle">A</text>
</svg>
```

```svg
<!-- static/images/avatar-ren.svg -->
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <rect width="96" height="96" fill="#8a6a4a"/>
  <text x="50%" y="50%" fill="#f5efe6" font-family="system-ui, sans-serif" font-size="32" text-anchor="middle" dominant-baseline="middle">R</text>
</svg>
```

- [ ] **Step 3: Write the reviews page**

```svelte
<!-- src/routes/products/[id]/reviews/+page.svelte -->
<script>
  import { page } from '$app/state';

  const reviews = [
    {
      author: 'Aki',
      avatar: '/images/avatar-aki.svg',
      bodyHtml: '<p>Best <strong>Yirgacheffe</strong> I have had this year. Floral without being soapy.</p>'
    },
    {
      author: 'Ren',
      avatar: '/images/avatar-ren.svg',
      bodyHtml: '<p>Arrived fast, ground perfectly for my V60.</p>'
    }
  ];
</script>

<h1>Reviews for product #{page.params.id}</h1>

<ul class="reviews">
  {#each reviews as review}
    <li>
      <img src={review.avatar} alt={review.author} />
      <h2>{review.author}</h2>
      {@html review.bodyHtml}
    </li>
  {/each}
</ul>
```

This route has no `<svelte:head>`, so it inherits nothing from the layout (which also has none) — a fresh `SEO001` (critical, missing title) and, per the same site-wide gap noted in Task 8, a fresh `SEO002` (critical, missing meta description) too — two new criticals, not one. Its `<img>` is written once inside `{#each reviews as review}` — one AST node, so exactly one `PERF001` finding (not two; `svelte-vitals` counts source `<img>` elements, not runtime render count — see Task 5's corrected note). Its `{@html review.bodyHtml}` is a fresh `SEC001`. It will also carry fresh `SEO003`/`SEO008` findings, consistent with every other route in this project.

- [ ] **Step 4: Verify the new findings are diff-scoped correctly**

```bash
pnpm exec svelte-vitals --verbose --diff main 2>&1 | grep -E "SEO001|SEO002|PERF001|SEC001"
```

Expected: findings only for `src/routes/products/[id]/reviews/+page.svelte` — nothing from `main`'s pre-existing issues (contact, blog, product) leaks in, since `--diff main` scopes to files changed relative to `main`. Expect one `SEO001`, one `SEO002`, one `PERF001`, and one `SEC001` line, all for this one file.

- [ ] **Step 5: Commit and push (no PR yet)**

```bash
git add src/routes/products/'[id]'/reviews static/images/avatar-aki.svg static/images/avatar-ren.svg
git commit -m "feat: add product reviews page"
git push -u origin demo-pr
```

- [ ] **Step 6: Return to `main` locally**

```bash
git checkout main
```

Leave `demo-pr` pushed and untouched — opening the PR is a live-talk action, not a setup step.

---

### Task 12: Japanese cheat-sheet README

**Files:**
- Modify: `/Users/oekazuma/localRepo/svelte-vitals-sample/README.md`

**Interfaces:**
- Consumes: the baseline recorded in Task 8, the `demo-pr` branch pushed in Task 11.
- Produces: a presenter-facing runbook covering pre-talk checklist, the exact commands to type during the talk, two ready-made live-fix snippets, and a fallback plan.

- [ ] **Step 1: Write the README**

```markdown
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
pnpm exec svelte-vitals --verbose
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

**修正B: blog 一覧の画像に width/height を追加（PERF001を解消）**

`src/routes/blog/+page.svelte` の `<img>` を:

```svelte
<img src={post.image} alt={post.title} width="640" height="400" />
```

修正後に `pnpm exec svelte-vitals` を再実行してスコアの変化を見せる。

### 4. GitHub PR連携

```bash
gh pr create --head demo-pr --base main --title "Add product reviews page" \
  --body "Adds a customer reviews page for product detail pages."
```

PRが開いたら GitHub Actions（`.github/workflows/svelte-vitals.yml`）が自動実行され、
インライン注釈・ジョブサマリ・固定PRコメントが `products/[id]/reviews/+page.svelte` の
新規問題（SEO001, SEO002, SEO003, SEO008, PERF001, SEC001）に対して付く。`main` 側の
既存の問題は `diff`/`baseline` が `origin/main` 基準のため出てこない。

## うまくいかなかったときのフォールバック

- ダッシュボードが開かない → CLI出力とこのREADMEのスクリーンショットで代替
- Wi-Fiが不安定 → `gh pr create` はスキップし、`pnpm exec svelte-vitals --diff main` の
  ローカル出力で同じ内容を説明する
```

- [ ] **Step 2: Commit and push**

```bash
git add README.md
git commit -m "docs: add presenter cheat sheet"
git push
```

---

### Task 13: End-to-end dry run

**Files:** none (verification only).

**Interfaces:**
- Consumes: everything from Tasks 1–12.
- Produces: confidence that the full demo flow works start to finish, exactly as scripted in the README.

- [ ] **Step 1: Fresh clone sanity check**

Simulates what happens if the presenter has to re-clone on a different machine:

```bash
CHECK_DIR="$(mktemp -d)/svelte-vitals-sample-check"
git clone https://github.com/oekazuma/svelte-vitals-sample.git "$CHECK_DIR"
cd "$CHECK_DIR"
pnpm install
```

Expected: `pnpm install` fails to resolve `svelte-vitals`/`@svelte-vitals/vite` from the `link:` protocol on a machine without the sibling monorepo — this is expected and confirms the link is intentionally local-only. Note this constraint at the top of the README's pre-talk checklist (already covered by "このリポジトリは `pnpm link` でローカルビルドを直接参照している"). Clean up:

```bash
rm -rf "$CHECK_DIR"
```

- [ ] **Step 2: Run the real demo script against the working copy**

```bash
cd /Users/oekazuma/localRepo/svelte-vitals-sample
pnpm exec svelte-vitals --verbose
```

Expected: matches the baseline recorded in Task 8, Step 1.

- [ ] **Step 3: Confirm the `demo-pr` branch is ready but has no open PR**

```bash
gh pr list --repo oekazuma/svelte-vitals-sample --state all --head demo-pr
```

Expected: empty (no PR exists yet for `demo-pr`).

- [ ] **Step 4: Final commit check**

```bash
cd /Users/oekazuma/localRepo/svelte-vitals-sample
git status
git log --oneline main
```

Expected: clean working tree on `main`, with commits from Tasks 1–3, 4–8 (feature commits), 9 excluded (no commit, just remote ops), 10, 12.
