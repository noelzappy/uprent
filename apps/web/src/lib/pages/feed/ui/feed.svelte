<script lang="ts">
  import { FeedProperties } from '.'
  import { feed, preferences } from '$lib/shared/stores'
  import { onMount } from 'svelte'

  onMount(() => {
    feed.reload()
    preferences.init()
  })
</script>

<div class=".flex .max-h-screen .flex-col .bg-gray-50">
  <FeedProperties />
</div>
