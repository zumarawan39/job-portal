import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Combines Tailwind classes and removes conflicting duplicates (e.g. two different "p-*" classes)
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
