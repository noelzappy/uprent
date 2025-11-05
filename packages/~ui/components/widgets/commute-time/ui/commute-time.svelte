<script lang="ts">
  import api from '~api'
  import type { Durations, TravelMode } from '~core/database'
  import { commuteStorage } from '~core/helpers'
  import { RouteSVG, SettingsSVG } from '~ui/assets'
  import { Button } from '~ui/components'
  import { WalkSVG } from '~ui/assets'
  import { BikeSVG } from '~ui/assets'
  import { CarSVG } from '~ui/assets'
  import { RocketSVG } from '~ui/assets'
  import type { Address, MaxDurations } from '~core/types'
  import { DefaultMaxDurations } from '~core/constants/commute-constants'
  import { CommuteSettingsModal } from '~ui/components/widgets'
  import { onMount } from 'svelte'

  export let loading: boolean = false
  export let durations: Durations | null = null
  export let addresses: Address[] = []
  export let maxDurations: MaxDurations = DefaultMaxDurations
  export let showSettings = false
  export let isExtension = false
  export let openSettings: (() => void) | undefined = undefined
  export let onSaveSettings:
    | ((newAddresses: Address[], newMaxDurations: MaxDurations) => void)
    | undefined = undefined

  onMount(async () => {
    addresses = await commuteStorage.getAddresses()
    maxDurations = await commuteStorage.getMaxDurations()
  })

  export let load: () => Promise<void> | void = async () => {
    addresses = commuteStorage.getAddresses()
    if (addresses.length === 0) {
      handleOpenSettings()
      return
    }
    loading = true
    const { data, error } = await api.commute.durations.get({
      $query: {
        addressIds: addresses.map(a => a.id).join(','),
      },
    })
    loading = false
    if (error || data.status === 'error') return
    durations = data.payload.durations
  }

  const handleSaveSettings = (
    newAddresses: Address[],
    newMaxDurations: MaxDurations,
  ) => {
    if (onSaveSettings) {
      onSaveSettings(newAddresses, newMaxDurations)
      return
    }

    addresses = newAddresses
    maxDurations = newMaxDurations
    commuteStorage.saveAddresses(newAddresses)
    commuteStorage.saveMaxDurations(newMaxDurations)
    showSettings = false
    if (addresses.length > 0) {
      load()
    }
  }

  const handleOpenSettings = () => {
    if (openSettings) {
      openSettings()
    } else {
      showSettings = true
    }
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
    <div class=".flex .gap-2">
      <Button primary {loading} onClick={load} class=".flex-1">
        <RouteSVG slot="icon" />
        Load commutes
      </Button>
      <Button subtle onClick={handleOpenSettings}>
        <SettingsSVG />
      </Button>
    </div>
  {:else}
    <div class=".flex .h-full .flex-col">
      <div class=".mb-2 .flex .flex-shrink-0 .items-center .justify-between">
        <h3 class=".text-sm .font-semibold .text-gray-900">Commute Times</h3>
        <Button subtle onClick={handleOpenSettings}>
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
            : '.flex .flex-1 .gap-3 .overflow-y-auto .pr-1'}
        >
          {#each Object.entries(durations) as [addressId, addressDurations]}
            {@const address = addresses.find(a => a.id === addressId)}
            <div class={isExtension ? '.space-y-2' : '.flex-1 .space-y-2'}>
              <div
                class=".text-xs .font-medium .text-gray-700"
                title={address?.label}
              >
                {address?.label || 'Unknown address'}
              </div>
              <div class=".grid .grid-cols-2 .gap-2">
                {#each travelModes as mode}
                  {@const duration = addressDurations[mode]}
                  {@const exceeded =
                    duration !== null && isExceeded(mode, duration)}
                  {#if duration !== null}
                    <div
                      class={exceeded
                        ? '.flex .items-center .gap-2 .rounded-lg .border .border-red-300 .bg-red-50 .p-2 .transition-colors'
                        : '.flex .items-center .gap-2 .rounded-lg .border .border-gray-200 .bg-gray-50 .p-2 .transition-colors'}
                    >
                      <svelte:component this={getTravelModeIcon(mode)} />
                      <div class=".min-w-0 .flex-1">
                        <div class=".text-xs .text-gray-500">
                          {getTravelModeLabel(mode)}
                        </div>
                        <div
                          class={exceeded
                            ? '.text-sm .font-medium .text-red-700'
                            : '.text-sm .font-medium .text-gray-900'}
                        >
                          {duration} min
                        </div>
                      </div>
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
