import { Observable, Subscriber } from 'rxjs';

const CHUNK_SIZE = 16 * 1024;

export function readFile(file: File): Observable<ArrayBuffer> {
  return new Observable<ArrayBuffer>((observer) => {
    readFileImpl(file, observer);
  });
}

async function readFileImpl(file: File, observer: Subscriber<ArrayBuffer>) {
  try {
    let offset: number = 0;
    const size = file.size;
  
    while (offset < size) {
      const chunkSize = Math.min(size - offset, CHUNK_SIZE);
      const chunk = file.slice(offset, chunkSize);
      offset += chunkSize;
  
      const buffer = await chunk.arrayBuffer();
      observer.next(buffer);
    }
  
    observer.complete();
  } catch(err) {
    observer.error(err);
  }
}