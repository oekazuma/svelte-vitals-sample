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
