export type ApiResponse<T> = 
    { success: true; data: T; error?: null; fields?: never } | 
    { success: false; data?: null; error: string; fields?: Record<string, string> }