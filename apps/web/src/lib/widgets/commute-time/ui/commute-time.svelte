<script lang="ts">
  import api from '~api'
  import type { Durations } from '~core/database'
  import {  CommuteTimeBase } from '~ui/components'

  let loading = false
  let durations: Durations | null = null

  const load = async () => {
    loading = true
    const { data, error } = await api.commute.durations.get()
    loading = false

    if (error || data.status === 'error') return

    durations = data.payload.durations
  }
</script>

<CommuteTimeBase {durations} {loading} load={load} />