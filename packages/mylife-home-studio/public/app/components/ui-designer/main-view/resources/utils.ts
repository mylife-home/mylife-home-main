import humanize from 'humanize-plus';
import mime from 'mime/lite';

import { UiResource } from '../../../../store/ui-designer/types';

export function makeDataUrl(resource: UiResource) {
  return `data:${resource.mime};base64,${resource.data}`;
}

export function formatBinaryLength(resource: UiResource) {
  // base64 length = 4 chars represents 3 binary bytes
  const size = (resource.data.length * 3) / 4;
  return humanize.fileSize(size);
}

export function download(resource: UiResource) {
  const a = document.createElement('a');
  const url = makeDataUrl(resource);
  const name = `${resource.resourceId}.${mime.getExtension(resource.mime) || 'unknown'}`;
  document.body.appendChild(a);
  a.style.display = 'none';
  a.href = url
  a.download = name;
  a.click();
}
