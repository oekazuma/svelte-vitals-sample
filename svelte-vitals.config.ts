// svelte-vitals config file — https://oekazuma.github.io/svelte-vitals/guides/configuration/
import { defineConfig } from 'svelte-vitals';

export default defineConfig({
	// treatDynamicAs: 'pass', // 'pass' | 'warn' | 'fail' — how {data.title}-style dynamic values are scored
	// metaComponents: ['Seo'], // component names that resolve SEO tags into <head>
	// rules: {}, // e.g. { SEO001: 'off' } to disable a rule
	// failOn: 'critical', // 'critical' | 'warning' | 'info'
	// weights: {} // e.g. { seo: 2 } — per-category weight for the combined Health score
});
