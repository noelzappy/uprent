<script lang="ts">
  import type { Address, MaxDurations } from '~core/types'
  import { Modal } from '~ui/components/modal'
  import { Button } from '~ui/components'
  import { PlusSVG, TrashSVG, MapPinSVG } from '~ui/assets'
  import {
    DefaultMaxDurations,
    MockAddresses,
  } from '~core/constants/commute-constants'

  export let open: boolean = false
  export let addresses: Address[] = []
  export let maxDurations: MaxDurations = DefaultMaxDurations
  export let onSave: (addresses: Address[], maxDurations: MaxDurations) => void

  let addressInputs: string[] = addresses.map(a => a.label)
  let showSuggestions: boolean[] = []
  let filteredSuggestions: string[][] = []
  let previousOpen: boolean | undefined = undefined

  const handleAddressInput = (index: number, value: string) => {
    addressInputs[index] = value

    if (value.trim().length > 0) {
      filteredSuggestions[index] = MockAddresses.filter(addr =>
        addr.toLowerCase().includes(value.toLowerCase()),
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
        id: addresses[idx]?.id || `addr-${Date.now()}-${idx}`,
        label: addr,
      }))

    onSave(validAddresses, maxDurations)
  }

  const handleClose = () => {
    addressInputs = addresses.map(a => a.label)
    if (addressInputs.length === 0) {
      addressInputs = ['']
    }
    showSuggestions = addressInputs.map(() => false)
    filteredSuggestions = addressInputs.map(() => [])
    open = false
  }

  $: if (open && previousOpen !== true) {
    addressInputs = addresses.map(a => a.label)
    if (addressInputs.length === 0) {
      addressInputs = ['']
    }
    showSuggestions = addressInputs.map(() => false)
    filteredSuggestions = addressInputs.map(() => [])
    previousOpen = true
  } else if (!open && previousOpen !== false) {
    previousOpen = false
  }

  const inputStyle =
    'focus:.ring-primary-500 .w-full .rounded-md .border .border-gray-300 .px-3 .py-2 .text-sm focus:.border-transparent focus:.outline-none focus:.ring-2'
  const inputLabelStyle = '.mb-1 .block .text-xs .font-medium .text-gray-700'
</script>

<Modal {open} title="Commute Settings" onClose={handleClose}>
  <div class=".space-y-6">
    <div>
      <h3 class=".mb-3 .text-sm .font-semibold .text-gray-900">
        Your Addresses
      </h3>
      <p class=".mb-3 .text-xs .text-gray-500">
        Add up to 2 addresses to check commute times from.
      </p>

      <div class=".space-y-3">
        {#each addressInputs as address, index}
          <div class=".relative">
            <div class=".flex .gap-2">
              <div class=".relative .flex-1">
                <div class=".absolute .left-3 .top-2.5 .text-gray-400">
                  <MapPinSVG />
                </div>
                <input
                  type="text"
                  value={address}
                  on:input={e =>
                    handleAddressInput(index, e.currentTarget.value)}
                  on:focus={() => {
                    if (
                      address.trim().length > 0 &&
                      filteredSuggestions[index]?.length > 0
                    ) {
                      showSuggestions[index] = true
                    }
                  }}
                  on:blur={() => {
                    setTimeout(() => (showSuggestions[index] = false), 200)
                  }}
                  placeholder="Enter address..."
                  class={inputStyle}
                />

                {#if showSuggestions[index] && filteredSuggestions[index]?.length > 0}
                  <div
                    class=".absolute .z-10 .mt-1 .max-h-48 .w-full .overflow-y-auto .rounded-md .border .border-gray-200 .bg-white .shadow-lg"
                  >
                    {#each filteredSuggestions[index] as suggestion}
                      <button
                        type="button"
                        class=".w-full .cursor-pointer .px-3 .py-2 .text-left .text-sm .text-gray-700 hover:.bg-gray-50"
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
                  class=".rounded-md .p-2 .text-red-600 .transition-colors hover:.bg-red-50"
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
            {#if addressInputs.length === 0}
              Add an address
            {:else}
              Add another address
            {/if}
          </Button>
        {/if}
      </div>
    </div>

    <div>
      <h3 class=".mb-3 .text-sm .font-semibold .text-gray-900">
        Maximum Commute Times
      </h3>
      <p class=".mb-3 .text-xs .text-gray-500">
        Set your maximum acceptable commute time for each travel mode (in
        minutes).
      </p>

      <div class=".grid .grid-cols-2 .gap-3">
        <div>
          <label class={inputLabelStyle}>Walking</label>
          <input
            type="number"
            bind:value={maxDurations.walking}
            placeholder="e.g. 30"
            min="0"
            class={inputStyle}
          />
        </div>

        <div>
          <label class={inputLabelStyle}>Biking</label>
          <input
            type="number"
            bind:value={maxDurations.biking}
            placeholder="e.g. 20"
            min="0"
            class={inputStyle}
          />
        </div>

        <div>
          <label class={inputLabelStyle}>Driving</label>
          <input
            type="number"
            bind:value={maxDurations.driving}
            placeholder="e.g. 15"
            min="0"
            class={inputStyle}
          />
        </div>

        <div>
          <label class={inputLabelStyle}>Transit</label>
          <input
            type="number"
            bind:value={maxDurations.transit}
            placeholder="e.g. 25"
            min="0"
            class={inputStyle}
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
