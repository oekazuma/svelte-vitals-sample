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
