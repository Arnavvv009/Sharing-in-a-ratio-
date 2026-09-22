import { readdir, unlink, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { audioMap } from '../src/utils/audioMap.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const AUDIO_DIR = join(__dirname, '..', 'public', 'assets', 'audio');

async function cleanAudio() {
  try {
    const files = await readdir(AUDIO_DIR);
    const validFilenames = new Set(Object.values(audioMap).map(p => p.split('/').pop()));
    let deletedCount = 0;
    for (const file of files) {
      if (!validFilenames.has(file) && file.endsWith('.mp3')) {
        const filePath = join(AUDIO_DIR, file);
        await unlink(filePath);
        console.log(`Deleted: ${file}`);
        deletedCount++;
      }
    }
    console.log(`Cleanup complete. Deleted ${deletedCount} files.`);
  } catch (err) {
    console.error(err);
  }
}

cleanAudio();
