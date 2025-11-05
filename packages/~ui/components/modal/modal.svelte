<script lang="ts">
  import { XSVG } from '~ui/assets'

  export let open = false
  export let title: string = ''
  export let onClose: () => void = () => {}

  const handleClose = () => {
    onClose()
  }

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }
</script>

{#if open}
  <div 
    class=".fixed .inset-0 .z-50 .flex .items-center .justify-center .bg-black .bg-opacity-50"
    on:click={handleBackdropClick}
  >
    <div class=".bg-white .rounded-lg .shadow-xl .max-w-lg .w-full .mx-4 .max-h-[90vh] .overflow-hidden .flex .flex-col">
      <div class=".flex .items-center .justify-between .p-4 .border-b .border-gray-200">
        <h2 class=".text-lg .font-semibold .text-gray-900">{title}</h2>
        <button 
          class=".p-1 .rounded-md hover:.bg-gray-100 .transition-colors"
          on:click={handleClose}
          type="button"
        >
          <XSVG />
        </button>
      </div>
      
      <div class=".p-4 .overflow-y-auto .flex-1">
        <slot />
      </div>
      
      <div class=".flex .justify-end .gap-2 .p-4 .border-t .border-gray-200">
        <slot name="footer" close={handleClose} />
      </div>
    </div>
  </div>
{/if}

<style>
  :global(body:has(div[class*=".fixed"])) {
    overflow: hidden;
  }
</style>
