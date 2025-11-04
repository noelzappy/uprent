export type WorkerResponse<T> = {
  success: boolean
  data?: T
  error?: string
}
