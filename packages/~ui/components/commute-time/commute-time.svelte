<script lang="ts">
  import api from '~api'
  import type { Durations } from '~core/database'
  import { RouteSVG } from '~ui/assets'
  import { Button } from '~ui/components'
  import { WalkSVG } from '~ui/assets'
  import { BikeSVG } from '~ui/assets'
  import { CarSVG } from '~ui/assets'
  import { RocketSVG } from '~ui/assets'

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
    <div class=".grid .grid-cols-2 .gap-3 .w-full">

      {#if Object.keys(durations).length === 0}
        <div class=".col-span-2 .text-center .text-gray-500">
          No commute data available.
        </div>
      {/if}

      {#if durations.walking !== null}
        <div class=".flex .items-center .gap-2 .p-3 .rounded-lg .bg-gray-50 .border .border-gray-200">
          <WalkSVG />
          <div>
            <div class=".text-xs .text-gray-500">Walking</div>
            <div class=".text-sm .font-medium .text-gray-900">{durations.walking} min</div>
          </div>
        </div>
      {/if}
      
      {#if durations.biking !== null}
        <div class=".flex .items-center .gap-2 .p-3 .rounded-lg .bg-gray-50 .border .border-gray-200">
          <BikeSVG />
          <div>
            <div class=".text-xs .text-gray-500">Biking</div>
            <div class=".text-sm .font-medium .text-gray-900">{durations.biking} min</div>
          </div>
        </div>
      {/if}
      
      {#if durations.driving !== null}
        <div class=".flex .items-center .gap-2 .p-3 .rounded-lg .bg-gray-50 .border .border-gray-200">
          <CarSVG />
          <div>
            <div class=".text-xs .text-gray-500">Driving</div>
            <div class=".text-sm .font-medium .text-gray-900">{durations.driving} min</div>
          </div>
        </div>
      {/if}
      
      {#if durations.transit !== null}
        <div class=".flex .items-center .gap-2 .p-3 .rounded-lg .bg-gray-50 .border .border-gray-200">
          <RocketSVG />
          <div>
            <div class=".text-xs .text-gray-500">Transit</div>
            <div class=".text-sm .font-medium .text-gray-900">{durations.transit} min</div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
