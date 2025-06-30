import { diffChars, Change } from 'diff'

export function diffHtml(oldHtml: string, newHtml: string): Change[] {
  return diffChars(oldHtml, newHtml)
} 