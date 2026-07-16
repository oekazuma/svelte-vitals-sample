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
			descriptionHtml:
				'<p>A <strong>bright, floral</strong> washed Ethiopian with a tea-like body. Roasted weekly in small batches.</p>'
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
