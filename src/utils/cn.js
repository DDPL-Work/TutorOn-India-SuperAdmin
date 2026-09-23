/**
 * Simple class names combiner utility
 * Concatenates truthy string classes together
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
