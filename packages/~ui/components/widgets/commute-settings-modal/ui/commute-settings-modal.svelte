<script lang="ts">
  import type { Address, MaxDurations } from '~core/types'
  import { Modal } from '~ui/components/modal'
  import { Button } from '~ui/components'
  import { PlusSVG, TrashSVG, MapPinSVG } from '~ui/assets'
  import { DefaultMaxDurations, MockAddresses } from '~core/constants/commute-constants'

  export let open: boolean = false
  export let addresses: Address[] = []
  export let maxDurations: MaxDurations = DefaultMaxDurations
  export let onSave: (addresses: Address[], maxDurations: MaxDurations) => void

  let localAddresses: Address[] = [...addresses]
  let localMaxDurations: MaxDurations = { ...maxDurations }
  let addressInputs: string[] = localAddresses.map(a => a.label)
  let showSuggestions: boolean[] = []
  let filteredSuggestions: string[][] = []

  
  if (addressInputs.length === 0) {
    addressInputs = ['']
    showSuggestions = [false]
    filteredSuggestions = [[]]
  }

  const handleAddressInput = (index: number, value: string) => {
    addressInputs[index] = value
    
    if (value.trim().length > 0) {
      filteredSuggestions[index] = MockAddresses.filter(addr => 
        addr.toLowerCase().includes(value.toLowerCase())
      )
      showSuggestions[index] = filteredSuggestions[index].length > 0
    } else {
      showSuggestions[index] = false
      filteredSuggestions[index] = []
    }
  }

  const selectSuggestion = (index: number, suggestion: string) => {
    addressInputs[index] = suggestion
    showSuggestions[index] = false
  }

  const addAddress = () => {
    if (addressInputs.length < 2) {
      addressInputs = [...addressInputs, '']
      showSuggestions = [...showSuggestions, false]
      filteredSuggestions = [...filteredSuggestions, []]
    }
  }

  const removeAddress = (index: number) => {
    addressInputs = addressInputs.filter((_, i) => i !== index)
    showSuggestions = showSuggestions.filter((_, i) => i !== index)
    filteredSuggestions = filteredSuggestions.filter((_, i) => i !== index)
  }

  const handleSave = () => {
    const validAddresses: Address[] = addressInputs
      .filter(addr => addr.trim().length > 0)
      .map((addr, idx) => ({
        id: localAddresses[idx]?.id || `addr-${Date.now()}-${idx}`,
        label: addr,
      }))

    onSave(validAddresses, localMaxDurations)
    open = false
  }

  const handleClose = () => {
    localAddresses = [...addresses]
    localMaxDurations = { ...maxDurations }
    addressInputs = localAddresses.map(a => a.label)
    if (addressInputs.length === 0) {
      addressInputs = ['']
    }
    showSuggestions = addressInputs.map(() => false)
    filteredSuggestions = addressInputs.map(() => [])
  }
</script>

<Modal {open} title="Commute Settings" onClose={handleClose}>
  <div class=".space-y-6">
    
    <div>
      <h3 class=".text-sm .font-semibold .text-gray-900 .mb-3">Your Addresses</h3>
      <p class=".text-xs .text-gray-500 .mb-3">Add up to 2 addresses to check commute times from.</p>
      
      <div class=".space-y-3">
        {#each addressInputs as address, index}
          <div class=".relative">
            <div class=".flex .gap-2">
              <div class=".flex-1 .relative">
                <div class=".absolute .left-3 .top-2.5 .text-gray-400">
                  <MapPinSVG />
                </div>
                <input
                  type="text"
                  value={address}
                  on:input={(e) => handleAddressInput(index, e.currentTarget.value)}
                  on:focus={() => {
                    if (address.trim().length > 0 && filteredSuggestions[index]?.length > 0) {
                      showSuggestions[index] = true
                    }
                  }}
                  on:blur={() => {
                    setTimeout(() => showSuggestions[index] = false, 200)
                  }}
                  placeholder="Enter address..."
                  class=".w-full .pl-10 .pr-3 .py-2 .border .border-gray-300 .rounded-md .text-sm focus:.outline-none focus:.ring-2 focus:.ring-primary-500 focus:.border-transparent"
                />
                
                {#if showSuggestions[index] && filteredSuggestions[index]?.length > 0}
                  <div class=".absolute .z-10 .w-full .mt-1 .bg-white .border .border-gray-200 .rounded-md .shadow-lg .max-h-48 .overflow-y-auto">
                    {#each filteredSuggestions[index] as suggestion}
                      <button
                        type="button"
                        class=".w-full .text-left .px-3 .py-2 .text-sm .text-gray-700 hover:.bg-gray-50 .cursor-pointer"
                        on:click={() => selectSuggestion(index, suggestion)}
                      >
                        {suggestion}
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>
              
              {#if addressInputs.length > 1 || (addressInputs.length === 1 && address.trim().length > 0)}
                <button
                  type="button"
                  class=".p-2 .text-red-600 hover:.bg-red-50 .rounded-md .transition-colors"
                  on:click={() => removeAddress(index)}
                >
                  <TrashSVG />
                </button>
              {/if}
            </div>
          </div>
        {/each}

        {#if addressInputs.length < 2}
          <Button subtle onClick={addAddress} class=".w-full">
            <PlusSVG slot="icon" />
            Add another address
          </Button>
        {/if}
      </div>
    </div>

    
    <div>
      <h3 class=".text-sm .font-semibold .text-gray-900 .mb-3">Maximum Commute Times</h3>
      <p class=".text-xs .text-gray-500 .mb-3">Set your maximum acceptable commute time for each travel mode (in minutes).</p>
      
      <div class=".grid .grid-cols-2 .gap-3">
        <div>
          <label class=".block .text-xs .font-medium .text-gray-700 .mb-1">Walking</label>
          <input
            type="number"
            bind:value={localMaxDurations.walking}
            placeholder="e.g. 30"
            min="0"
            class=".w-full .px-3 .py-2 .border .border-gray-300 .rounded-md .text-sm focus:.outline-none focus:.ring-2 focus:.ring-primary-500 focus:.border-transparent"
          />
        </div>
        
        <div>
          <label class=".block .text-xs .font-medium .text-gray-700 .mb-1">Biking</label>
          <input
            type="number"
            bind:value={localMaxDurations.biking}
            placeholder="e.g. 20"
            min="0"
            class=".w-full .px-3 .py-2 .border .border-gray-300 .rounded-md .text-sm focus:.outline-none focus:.ring-2 focus:.ring-primary-500 focus:.border-transparent"
          />
        </div>
        
        <div>
          <label class=".block .text-xs .font-medium .text-gray-700 .mb-1">Driving</label>
          <input
            type="number"
            bind:value={localMaxDurations.driving}
            placeholder="e.g. 15"
            min="0"
            class=".w-full .px-3 .py-2 .border .border-gray-300 .rounded-md .text-sm focus:.outline-none focus:.ring-2 focus:.ring-primary-500 focus:.border-transparent"
          />
        </div>
        
        <div>
          <label class=".block .text-xs .font-medium .text-gray-700 .mb-1">Transit</label>
          <input
            type="number"
            bind:value={localMaxDurations.transit}
            placeholder="e.g. 25"
            min="0"
            class=".w-full .px-3 .py-2 .border .border-gray-300 .rounded-md .text-sm focus:.outline-none focus:.ring-2 focus:.ring-primary-500 focus:.border-transparent"
          />
        </div>
      </div>
    </div>
  </div>

  <svelte:fragment slot="footer" let:close>
    <Button subtle onClick={close}>Cancel</Button>
    <Button primary onClick={handleSave}>Save Settings</Button>
  </svelte:fragment>
</Modal>
