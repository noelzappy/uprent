<script lang="ts">
  import type { Durations } from '~core/database'
  import type { WorkerResponse } from '~core/types'
  import {  CommuteTimeBase } from '~ui/components'

  let loading = false
  let durations: Durations | null = null

  const load = () => {
    loading = true
    chrome.runtime.sendMessage(
  {
    action: 'fetchCommutes',
  },
  (response: WorkerResponse<Durations>) => {
    loading = false
    if (response.error || response.success === false) {
      return;
    }
    durations = response.data || null;
  }
);
  }
</script>

<CommuteTimeBase {durations} {loading} load={load} />
