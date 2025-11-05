<script lang="ts">
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

  
  chrome.storage.local.get(
    [STORAGE_KEYS.ADDRESSES, STORAGE_KEYS.MAX_DURATIONS],
    (result) => {
      addresses = result[STORAGE_KEYS.ADDRESSES] || []
      maxDurations = result[STORAGE_KEYS.MAX_DURATIONS] || DefaultMaxDurations
    }
  )

  console.log('Loaded stored commute settings', { addresses, maxDurations })

  const load = () => {
    // Reload addresses in case they changed
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

  console.log('CommuteTimeWidget initialized', { addresses, maxDurations })


</script>

<CommuteSettingsModal 
  bind:open={showSettingsModal} 
  {addresses}
  {maxDurations}
  onSave={handleSaveSettings}
/>

<CommuteTime {durations} {loading} {load} {addresses} {maxDurations} {openSettings} />
