<script lang="ts">
  import type { Durations } from '~core/database'
  import type { WorkerResponse } from '~core/types'
  import { CommuteTime } from '~ui/components/widgets'

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

<CommuteTime {durations} {loading} load={load} />
