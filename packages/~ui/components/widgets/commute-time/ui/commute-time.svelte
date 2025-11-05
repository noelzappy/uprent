<script lang="ts">
  import api from '~api'
  import type { Durations,  TravelMode, } from '~core/database'
  import { commuteStorage } from '~core/helpers'
  import { RouteSVG, SettingsSVG, AlertTriangleSVG } from '~ui/assets'
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
  export let openSettings: (() => void) | undefined = undefined
  
  
  let internalShowSettings = false
  const isExtension = typeof window === 'undefined' && typeof (globalThis as any).chrome !== 'undefined'

  onMount(() => {

    if (!isExtension) {
      addresses = commuteStorage.getAddresses()
      maxDurations = commuteStorage.getMaxDurations()
    }

  });

  export let load: () => Promise<void> | void = async () => {
    if (!isExtension) {
      
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
  }

  const handleOpenSettings = () => {
    if (openSettings) {
      openSettings()
    } else {
      internalShowSettings = true
    }
  }

  const getTravelModeIcon = (mode: TravelMode) => {
    switch (mode) {
      case 'walking': return WalkSVG
      case 'biking': return BikeSVG
      case 'driving': return CarSVG
      case 'transit': return RocketSVG
    }
  }

  const getTravelModeLabel = (mode: TravelMode): string => {
    switch (mode) {
      case 'walking': return 'Walking'
      case 'biking': return 'Biking'
      case 'driving': return 'Driving'
      case 'transit': return 'Transit'
    }
  }

  const isExceeded = (mode: TravelMode, duration: number): boolean => {
    const max = maxDurations[mode]
    return max !== null && duration > max
  }

    const handleSaveSettings = (newAddresses: Address[], newMaxDurations: MaxDurations) => {
    addresses = newAddresses
    maxDurations = newMaxDurations
    commuteStorage.saveAddresses(newAddresses)
    commuteStorage.saveMaxDurations(newMaxDurations)
    internalShowSettings = false
      if (addresses.length > 0) {
        load()
      }
    }

  const travelModes: TravelMode[] = ['walking', 'biking', 'driving', 'transit']

</script>

<div>


  <CommuteSettingsModal 
  bind:open={internalShowSettings}
  {addresses}
  {maxDurations}
  onSave={
    handleSaveSettings
  }
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
    <div class=".space-y-4">
      <div class=".flex .justify-between .items-center">
        <h3 class=".text-sm .font-semibold .text-gray-900">Commute Times</h3>
         <Button subtle onClick={handleOpenSettings}>
        <SettingsSVG />
      </Button>
      </div>

      {#if Object.keys(durations).length === 0}
        <div class=".text-center .text-gray-500 .text-sm">
          No commute data available.
        </div>
      {:else}
        {#each Object.entries(durations) as [addressId, addressDurations]}
          {@const address = addresses.find(a => a.id === addressId)}
          <div class=".space-y-2">
            <div class=".text-xs .font-medium .text-gray-700 .truncate" title={address?.label}>
              {address?.label || 'Unknown address'}
            </div>
            <div class=".grid .grid-cols-2 .gap-2">
              {#each travelModes as mode}
                {@const duration = addressDurations[mode]}
                {@const exceeded = duration !== null && isExceeded(mode, duration)}
                {#if duration !== null}
                  <div 
                    class=".flex .items-center .gap-2 .p-2 .rounded-lg .border .transition-colors"
                    class:bg-red-50={exceeded}
                    class:border-red-300={exceeded}
                    class:bg-gray-50={!exceeded}
                    class:border-gray-200={!exceeded}
                  >
                    <svelte:component this={getTravelModeIcon(mode)} />
                    <div class=".flex-1 .min-w-0">
                      <div class=".text-xs .text-gray-500">{getTravelModeLabel(mode)}</div>
                      <div class=".text-sm .font-medium" class:text-red-700={exceeded} class:text-gray-900={!exceeded}>
                        {duration} min
                      </div>
                    </div>
                    {#if exceeded}
                      <div class=".text-red-600" title="Exceeds your maximum">
                        <AlertTriangleSVG />
                      </div>
                    {/if}
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>
