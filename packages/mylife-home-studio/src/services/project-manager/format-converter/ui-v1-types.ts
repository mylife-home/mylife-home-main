export interface Project {
  Name: string;
  CreateDate: string; // "/Date(1451942270573)/"
  LastUpdate: string;
  Components: Component[];
  Images: Image[];
  Windows: Window[];
  DesktopDefaultWindow: string;
  MobileDefaultWindow: string;
}

export interface Component {
  Id: string;
  Plugin: PluginV1;
}

export interface PluginV1 {
  library: string;
  type: string;
  usage: 2; //always ui here
  version: string;
  config: string;
  clazz: string; // ".action|=value,{off;on}" -or- ".action,[0;100]|=value,[0;100]"
}

export interface Image {
  Id: string;
  Content: string; // base64, only png supported
}

export interface Window {
  id: string;
  height: number;
  width: number;
  style: string; // always ''
  background_resource_id: string;
  controls: Control[];
}

export interface Control {
  id: string;
  height: number;
  width: number;
  x: number; // fraction of window width
  y: number; // fraction of window height
  style: string; // always ''
  display: Display;
  text: Text;
  primary_action: Action;
  secondary_action: Action;
}

export interface Display {
  default_resource_id: string;
  component_id: string; // can be null
  component_attribute: string;
  map: {
    resource_id: string;
    min: number;
    max: number;
    value: string;
  }[];
}

export interface Text {
  format: string; // "return value + '%';"
  context: { 
    component_id: string;
    component_attribute: string;
    id: string;
  }[];
}

export interface Action {
  // one set, the other null
  component: {
    component_id: string;
    component_action: string;
  };

  window: {
    id: string;
    popup: boolean;
  };
}
