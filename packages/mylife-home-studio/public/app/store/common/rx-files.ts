import { Observable, Subscriber } from 'rxjs';

const CHUNK_SIZE = 16 * 1024;

export interface FileProgress {
  totalSize: number;
  doneSize: number;
}

export function readFile(file: File, consumer: (chunk: ArrayBuffer) => Promise<void>): Observable<FileProgress> {
  return new Observable<FileProgress>((observer) => {
    readFileImpl(file, consumer, observer);
  });
}

async function readFileImpl(file: File, consumer: (chunk: ArrayBuffer) => Promise<void>, observer: Subscriber<FileProgress>) {
  try {
    let offset: number = 0;
    const size = file.size;
  
    while (offset < size) {
      const chunkSize = Math.min(size - offset, CHUNK_SIZE);
      const chunk = file.slice(offset, chunkSize);
      offset += chunkSize;
  
      const buffer = await chunk.arrayBuffer();
      await consumer(buffer);

      observer.next({ totalSize: size, doneSize: offset });
    }
  
    observer.complete();
  } catch(err) {
    observer.error(err);
  }
}