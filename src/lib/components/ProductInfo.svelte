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
