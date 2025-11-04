
import { SrtBlock } from '../types';

/**
 * Parses the string content of an SRT file into an array of subtitle blocks.
 * @param srtContent The full string content of the .srt file.
 * @returns An array of SrtBlock objects.
 */
export const parseSrt = (srtContent: string): SrtBlock[] => {
  // Normalize line endings to \n
  const normalizedContent = srtContent.replace(/\r\n/g, '\n').trim();
  const blocks = normalizedContent.split('\n\n');

  return blocks.map(block => {
    const lines = block.split('\n');
    if (lines.length < 3) {
      // Malformed block, try to salvage what we can or skip
      return null;
    }
    
    const index = parseInt(lines[0], 10);
    const time = lines[1];
    const text = lines.slice(2).join('\n');
    
    if (isNaN(index) || !time.includes('-->')) {
        return null; // Invalid block format
    }

    return { index, time, text };
  }).filter((block): block is SrtBlock => block !== null);
};

/**
 * Reconstructs an SRT file string from an array of subtitle blocks.
 * @param blocks An array of SrtBlock objects.
 * @returns A string formatted as a valid .srt file.
 */
export const reconstructSrt = (blocks: SrtBlock[]): string => {
  return blocks
    .map(block => {
      return `${block.index}\n${block.time}\n${block.text}`;
    })
    .join('\n\n');
};
