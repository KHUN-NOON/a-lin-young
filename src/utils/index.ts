import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Conditionally join class names and resolve Tailwind conflicts. */
export function cn(...inputs: Array<ClassValue>): string {
  return twMerge(clsx(inputs))
}

export default cn
