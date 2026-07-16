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
