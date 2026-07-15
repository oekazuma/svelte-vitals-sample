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
