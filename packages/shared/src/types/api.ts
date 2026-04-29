export interface ApiResponse<T> {
  data: T
  meta: {
    timestamp: string
  }
}

export interface ApiError {
  error: {
    code: string
    message: string
    statusCode: number
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    timestamp: string
    total: number
    page: number
    pageSize: number
  }
}
