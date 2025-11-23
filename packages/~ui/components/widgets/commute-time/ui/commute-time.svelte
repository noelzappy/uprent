<script lang="ts">
  import type { Durations, TravelMode } from '~core/database'
  import { RouteSVG, SettingsSVG } from '~ui/assets'
  import { Button } from '~ui/components'
  import { WalkSVG } from '~ui/assets'
  import { BikeSVG } from '~ui/assets'
  import { CarSVG } from '~ui/assets'
  import { RocketSVG } from '~ui/assets'
  import type { Address, MaxDurations } from '~core/types'
  import { CommuteSettingsModal } from '~ui/components/widgets'

  export let loading: boolean
  export let durations: Durations | null
  export let addresses: Address[]
  export let maxDurations: MaxDurations
  export let showSettings: boolean
  export let isExtension = false
  export let onSaveSettings: (
    newAddresses: Address[],
    newMaxDurations: MaxDurations,
  ) => void
  export let load: () => Promise<void> | void

  const toggleSettings = () => {
    showSettings = !showSettings
  }

  const handleSaveSettings = (
    newAddresses: Address[],
    newMaxDurations: MaxDurations,
  ) => {
    onSaveSettings(newAddresses, newMaxDurations)
  }

  const getTravelModeIcon = (mode: TravelMode) => {
    switch (mode) {
      case 'walking':
        return WalkSVG
      case 'biking':
        return BikeSVG
      case 'driving':
        return CarSVG
      case 'transit':
        return RocketSVG
    }
  }

  const getTravelModeLabel = (mode: TravelMode): string => {
    switch (mode) {
      case 'walking':
        return 'Walking'
      case 'biking':
        return 'Biking'
      case 'driving':
        return 'Driving'
      case 'transit':
        return 'Transit'
    }
  }

  const isExceeded = (mode: TravelMode, duration: number): boolean => {
    const max = maxDurations[mode]
    return max !== null && duration > max
  }

  const travelModes: TravelMode[] = ['walking', 'biking', 'driving', 'transit']
</script>

<div>
  <CommuteSettingsModal
    bind:open={showSettings}
    {addresses}
    {maxDurations}
    onSave={handleSaveSettings}
  />

  {#if !durations}
    <div class=".flex .flex-col .p-4 .text-center">
      <div class=".flex .gap-2">
        <Button primary {loading} onClick={load} class=".text-xs">
          <RouteSVG slot="icon" />
          Load commute
        </Button>
        <Button subtle onClick={toggleSettings} class=".text-xs">
          <SettingsSVG />
        </Button>
      </div>
    </div>
  {:else}
    <div class=".flex .h-full .flex-col">
      <div class=".mb-2 .flex .flex-shrink-0 .items-center .justify-between">
        <h3 class=".text-sm .font-semibold .text-gray-900">Commute Times</h3>
        <Button subtle onClick={toggleSettings}>
          <SettingsSVG />
        </Button>
      </div>

      {#if Object.keys(durations).length === 0}
        <div class=".text-center .text-sm .text-gray-500">
          No commute data available.
        </div>
      {:else}
        <div
          class={isExtension
            ? '.flex-1 .space-y-3 .overflow-y-auto .pr-1'
            : '.flex .flex-1 .gap-3 .overflow-x-auto .pb-2'}
        >
          {#each Object.entries(durations) as [addressId, addressDurations]}
            {@const address = addresses.find(a => a.id === addressId)}
            <div
              class={isExtension
                ? '.rounded-lg .border .border-gray-100 .bg-white .p-3 .shadow-sm'
                : '.min-w-[200px] .flex-1 .rounded-lg .border .border-gray-100 .bg-white .p-3 .shadow-sm'}
            >
              <div
                class=".mb-2 .line-clamp-1 .text-xs .font-semibold .text-gray-800"
                title={address?.label}
              >
                {address?.label || 'Unknown address'}
              </div>
              <div class=".flex .flex-wrap .gap-2">
                {#each travelModes as mode}
                  {@const duration = addressDurations[mode]}
                  {@const exceeded =
                    duration !== null && isExceeded(mode, duration)}
                  {#if duration !== null}
                    <div
                      class={exceeded
                        ? '.flex .items-center .gap-1.5 .rounded .border .border-red-200 .bg-red-50 .px-2 .py-1 .text-red-700'
                        : '.flex .items-center .gap-1.5 .rounded .border .border-gray-200 .bg-gray-50 .px-2 .py-1 .text-gray-600'}
                      title="{getTravelModeLabel(mode)}: {duration} min"
                    >
                      <div
                        class=".flex .h-4 .w-4 .items-center .justify-center"
                      >
                        <svelte:component this={getTravelModeIcon(mode)} />
                      </div>
                      <span class=".whitespace-nowrap .text-xs .font-medium">
                        {duration}m
                      </span>
                      {#if exceeded}
                        <div
                          class=".ml-1 .flex .h-3 .w-3 .items-center .justify-center .rounded-full .bg-red-500 .text-[10px] .font-bold .text-white"
                          title="Exceeded maximum preferred duration of {maxDurations[
                            mode
                          ]} min"
                        >
                          !
                        </div>
                      {/if}
                    </div>
                  {/if}
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
