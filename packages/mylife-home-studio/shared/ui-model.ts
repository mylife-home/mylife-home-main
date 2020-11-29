// direct import to avoid require all common in ui
// we depend on mylife-home-ui only for this
export * from 'mylife-home-ui/dist/shared/model';
export * from 'mylife-home-ui/dist/src/model/definition';
import { Definition } from 'mylife-home-ui/dist/src/model/definition';
import { Component, Plugin } from './component-model';

export interface UiProject {
  name: string;
  definition: Definition;
  componentData: ComponentData;
}

export interface ComponentData {
  components: Component[]; // plugin points to plugin instanceName:module.name
  plugins: { [instanceName: string]: Plugin[]; };
}
