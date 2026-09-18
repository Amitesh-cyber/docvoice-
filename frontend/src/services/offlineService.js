import { openDB } from 'idb';

const dbPromise = openDB('docvoice-audio-store', 1, {
  upgrade(db) {
    db.createObjectStore('audio-cache');
  },
});

export const getCachedAudio = async (key) => {
  return (await dbPromise).get('audio-cache', key);
};

export const setCachedAudio = async (key, val) => {
  return (await dbPromise).put('audio-cache', val, key);
};

export const clearAudioCache = async () => {
  return (await dbPromise).clear('audio-cache');
};
