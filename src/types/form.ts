// types/form.ts
/**
 * Form error structure
 */
export type FormError = {
  field?: string
  message: string
}

/**
 * Form state
 */
export type FormState<T = Record<string, unknown>> = {
  values: T
  errors: FormError[]
  isSubmitting: boolean
  message?: string
}