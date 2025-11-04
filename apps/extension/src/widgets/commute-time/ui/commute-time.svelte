<script lang="ts">
  import type { Durations } from '~core/database'
  import type { WorkerResponse } from '~core/types'
  import { RouteSVG } from '~ui/assets'
  import { Button } from '~ui/components'

  let loading = false
  let durations: Durations | null = null

  const load = async () => {
    loading = true
    chrome.runtime.sendMessage(
  {
    action: 'fetchCommutes',
  },
  (response: WorkerResponse<Durations>) => {
    loading = false
    if (response.error || response.success === false) {
      return;
    }
    durations = response.data || null;
  }
);
  }
</script>

<div>
  {#if !durations}
    <Button primary {loading} onClick={load}>
      <RouteSVG slot="icon" />
      Load commutes
    </Button>
  {:else}
    <!-- TODO: make it pretty! -->
    {JSON.stringify(durations, null, 2)}
  {/if}
</div>