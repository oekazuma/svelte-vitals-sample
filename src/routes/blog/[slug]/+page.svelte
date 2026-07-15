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
