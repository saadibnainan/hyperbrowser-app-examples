import { QAPair } from './qa';

export function toJSONL(qaPairs: QAPair[]): string {
  return qaPairs.map(pair => JSON.stringify(pair)).join('\n');
} 