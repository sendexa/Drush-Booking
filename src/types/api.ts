// types/api.ts
/**
 * Standard API response format
 */
export type ApiResponse<T = unknown> = {
  data?: T
  error?: {
    message: string
    code?: string
    details?: unknown
  }
  meta?: {
    count?: number
    total?: number
  }
}

/**
 * Paginated response
 */
export type PaginatedResponse<T = unknown> = ApiResponse<T[]> & {
  meta: {
    count: number
    total: number
    page: number
    perPage: number
  }
}