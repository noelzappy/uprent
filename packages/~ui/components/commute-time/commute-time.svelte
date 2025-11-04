<script lang="ts">
  import api from '~api'
  import type { Durations } from '~core/database'
  import { RouteSVG } from '~ui/assets'
  import { Button } from '~ui/components'

  export let loading: boolean = false
  export let durations: Durations | null = null
  
  export let load: () => Promise<void> | void = async () => {
    loading = true
    const { data, error } = await api.commute.durations.get()
    loading = false

    if (error || data.status === 'error') return

    durations = data.payload.durations
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
