import { Observable, Subscriber } from 'rxjs';
import { socket } from '../common/rx-socket';

const CHUNK_SIZE = 4 * 1024 * 1024; // 2MB

export interface FileProgress {
  totalSize: number;
  doneSize: number;
}

export function uploadFile(file: File): Observable<FileProgress> {
  return new Observable<FileProgress>((observer) => {
    uploadFileImpl(file, observer);
  });
}

async function uploadFileImpl(file: File, observer: Subscriber<FileProgress>) {
  try {
    let offset: number = 0;
    const size = file.size;
    const id = file.name;
  
    while (offset < size) {
      const chunkSize = Math.min(size - offset, CHUNK_SIZE);
      const chunk = file.slice(offset, offset + chunkSize);
      const type = offset === 0 ? 'init' : 'append';

      offset += chunkSize;
  
      const buffer = await chunk.arrayBuffer();
      await writeFileCall({ id, buffer, type }).toPromise();

      observer.next({ totalSize: size, doneSize: offset });
    }
  
    observer.complete();
  } catch(err) {
    observer.error(err);
  }
}

export function downloadFile(name: string, size: number) {
  return new Observable<FileProgress>((observer) => {
    downloadFileImpl(name, size, observer);
  });
}

async function downloadFileImpl(name: string, size: number, observer: Subscriber<FileProgress>) {
  try {
    let offset: number = 0;
    const buffers: ArrayBuffer[] = [];

    while (offset < size) {
      const chunkSize = Math.min(size - offset, CHUNK_SIZE);
      const buffer = await readFileCall({ id: name, offset, size: chunkSize }).toPromise();
      offset += chunkSize;

      buffers.push(buffer);

      observer.next({ totalSize: size, doneSize: offset });
    }

    const blob = new Blob(buffers);
    saveBlob(blob, name);
  
    observer.complete();
  } catch(err) {
    observer.error(err);
  }
}

function saveBlob(blob: Blob, name: string) {
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  const url = window.URL.createObjectURL(blob);
  try {
    a.href = url;
    a.download = name;
    a.click();
  } finally {
    window.URL.revokeObjectURL(url);
  }
}

function readFileCall({ id, offset, size }: { id: string; offset: number; size: number; }) {
  return socket.call('deploy/read-file', { id, offset, size }) as Observable<ArrayBuffer>;
}

function writeFileCall({ id, buffer, type }: { id: string; buffer: ArrayBuffer; type: 'init' | 'append'; }) {
  return socket.call('deploy/write-file', { id, buffer, type }) as Observable<void>;
}
