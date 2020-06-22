import path from 'path';
import fs from 'fs';

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'ui_main.json'), 'utf-8'));

export type Model = { [id: string]: string; };

export const model: Model = {};

for (const window of raw.Windows) {
  model[`window.${window.id}`] = JSON.stringify({ window });
}

for (const { Id, Content } of raw.Images) {
  model[`image.${Id}`] = Content;
}

model.default_window = JSON.stringify({
  desktop: raw.DesktopDefaultWindow,
  mobile: raw.MobileDefaultWindow,
});
