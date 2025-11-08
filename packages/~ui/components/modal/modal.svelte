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
    <div
      class=".mx-4 .flex .max-h-[90vh] .w-full .max-w-lg .flex-col .overflow-hidden .rounded-lg .bg-white .shadow-xl"
    >
      <div
        class=".flex .items-center .justify-between .border-b .border-gray-200 .p-4"
      >
        <h2 class=".text-lg .font-semibold .text-gray-900">{title}</h2>
        <button
          class=".rounded-md .p-1 .transition-colors hover:.bg-gray-100"
          on:click={handleClose}
          type="button"
        >
          <XSVG class=".h-4 .w-4" />
        </button>
      </div>

      <div class=".flex-1 .overflow-y-auto .p-4">
        <slot />
      </div>

      <div class=".flex .justify-end .gap-2 .border-t .border-gray-200 .p-4">
        <slot name="footer" close={handleClose} />
      </div>
    </div>
  </div>
{/if}
