export interface TProject {
  Name: string;
  CreateDate: string; // "/Date(1451942270573)/"
  LastUpdate: string;
  Components: TComponent[];
  Images: TImage[];
  Windows: TWindow[];
  DesktopDefaultWindow: string;
  MobileDefaultWindow: string;
}

export interface TComponent {
  Id: string;
  Plugin: TPlugin;
}

export interface TPlugin {
  library: string;
  type: string;
  usage: 2; //always ui here
  version: string;
  config: string;
  clazz: string; // ".action|=value,{off;on}" -or- ".action,[0;100]|=value,[0;100]"
}

export interface TImage {
  Id: string;
  Content: string; // base64, only png supported
}

export interface TWindow {
  id: string;
  height: number;
  width: number;
  style: string; // always ''
  background_resource_id: string;
  controls: TControl[];
}

export interface TControl {
  id: string;
  height: number;
  width: number;
  x: number; // fraction of window width
  y: number; // fraction of window height
  style: string; // always ''
  display: TDisplay;
  text: TText;
  primary_action: TAction;
  secondary_action: TAction;
}

export interface TDisplay {
  default_resource_id: string;
  component_id: string; // can be null
  component_attribute: string[];
  map: {
    resource_id: string;
    min: number;
    max: number;
    value: string;
  }[];
}

export interface TText {
  format: string; // "return value + '%';"
  context: { 
    component_id: string;
    component_attribute: string;
    id: string;
  }[];
}

export interface TAction {
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
