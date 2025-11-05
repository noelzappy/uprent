<script lang="ts">
  import { onMount } from 'svelte'
  import type { Durations, } from '~core/database'
  import type { WorkerResponse,  Address, MaxDurations } from '~core/types'
  import { CommuteTime, CommuteSettingsModal } from '~ui/components/widgets'
  import {
  DefaultMaxDurations,
  STORAGE_KEYS,
} from '~core/constants/commute-constants'

  let loading = false
  let durations: Durations | null = null
  let addresses: Address[] = []
  let maxDurations: MaxDurations = DefaultMaxDurations
  let showSettingsModal = false

  onMount(() => {
    chrome.storage.local.get(
      [STORAGE_KEYS.ADDRESSES, STORAGE_KEYS.MAX_DURATIONS],
      (result) => {
        addresses = result[STORAGE_KEYS.ADDRESSES] || []
        maxDurations = result[STORAGE_KEYS.MAX_DURATIONS] || DefaultMaxDurations
        console.log('Loaded addresses and maxDurations from storage', {
          addresses,
          maxDurations,
        })
      }
    )
  })

  const load = () => {
    chrome.storage.local.get([STORAGE_KEYS.ADDRESSES], (result) => {
      addresses = result[STORAGE_KEYS.ADDRESSES] || []

      if (addresses.length === 0) {
        showSettingsModal = true
        return
      }

      loading = true
      chrome.runtime.sendMessage(
        {
          action: 'fetchCommutes',
        },
        (response: WorkerResponse<Durations>) => {
          loading = false
          if (response.error || response.success === false) {
            return
          }
          durations = response.data || null
        }
      )
    })
  }

  const handleSaveSettings = (newAddresses: Address[], newMaxDurations: MaxDurations) => {
    addresses = newAddresses
    maxDurations = newMaxDurations
    chrome.storage.local.set({
      [STORAGE_KEYS.ADDRESSES]: newAddresses,
      [STORAGE_KEYS.MAX_DURATIONS]: newMaxDurations,
    }, () => {
      showSettingsModal = false
      if (addresses.length > 0) {
        load()
      }
    })
  }

  const openSettings = () => {
    showSettingsModal = true
  }

</script>

<CommuteSettingsModal 
  bind:open={showSettingsModal} 
  {addresses}
  {maxDurations}
  onSave={handleSaveSettings}
/>

<CommuteTime {durations} {loading} {load} {addresses} {maxDurations} {openSettings} />
