//import path from 'path';
//import fs from 'fs';
//const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'ui_main.json'), 'utf-8'));
import raw from './ui_main.json';

export type Model = { [id: string]: string; };

export const model: Model = {};

for (const window of raw.Windows) {
  prepareWindow(window);
  model[`window.${window.id}`] = JSON.stringify({ window });
}

for (const { Id, Content } of raw.Images) {
  model[`image.${Id}`] = Content;
}

model.default_window = JSON.stringify({
  desktop: raw.DesktopDefaultWindow,
  mobile: raw.MobileDefaultWindow,
});

function prepareWindow(window: typeof raw.Windows[0]) {
  for (const control of window.controls) {
    // replace ids comp_id with comp-id
    replaceId(control.primary_action?.component, 'component_id');
    replaceId(control.secondary_action?.component, 'component_id');
    replaceId(control.display, 'component_id');

    const context = control.text?.context;
    if (context) {
      for (const item of context) {
        replaceId(item, 'component_id');
      }
    }

    // replace 'off' 'on' with true false
    const map = control.display?.map;
    if (map) {
      for (const item of map) {
        switch (item.value) {
          case 'on':
            item.value = true;
            break;
          case 'off':
            item.value = false;
            break;
        }
      }
    }
  }
}

function replaceId(obj: { [prop: string]: string; }, prop: string) {
  if (obj && obj[prop]) {
    obj[prop] = obj[prop].replace(/_/g, '-');
  }
}
