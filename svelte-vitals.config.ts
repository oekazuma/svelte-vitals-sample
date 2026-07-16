// svelte-vitals config file — https://oekazuma.github.io/svelte-vitals/guides/configuration/
import { defineConfig } from 'svelte-vitals';

export default defineConfig({
	// treatDynamicAs: 'pass', // 'pass' | 'warn' | 'fail' — how {data.title}-style dynamic values are scored
	// metaComponents: ['Seo'], // component names that resolve SEO tags into <head>
	rules: { SEC001: 'off' } // live example: comment this line out and re-run `pnpm scan` to see SEC001 reappear
	// failOn: 'critical', // 'critical' | 'warning' | 'info'
	// weights: {} // e.g. { seo: 2 } — per-category weight for the combined Health score
});
