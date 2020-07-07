# `mylife-home-ui`

## TODO
 - switch to preact
 - switch to websocket
 - switch to new model to server data (images, window specs, ...)
 - better webpack packaging (inline bundle, icons, ...)
 - resources caching (resource url === content hash)
 - server-side window model (only render what is shown to client, no repository, no raw window resources, etc)
  => this is pourrite because if a component (eg roller shutter) changes state, it will be updated on mobile_window, desktop_window, rollershutter_popup. A component is always unique so its state change is sent only once

## Client-side model

store state: 
 - views: string[] (view[0] = main, others = popups)
 - controlState: ControlState[]
 - staticModel: StaticMode;

interface Window {
  id: string;
  background: ResourceHash;
  controls: Control[];
}

interface Control {
  display: resource; // default value
  text: string; // default value
  primaryAction: WindowAction | ComponentAction
  primaryAction: WindowAction | ComponentAction
}

interface WindowAction {
  window: string;
  popup: boolean;
}

interface ComponentAction {
  // opaque data, need to be sent on websocket to server
}

interface StaticModel {
  defaultWindow
  windows
}

interface ControlState {
  window: string;
  control: string;
  display: resource; // updated by websocket if need to be changed (eg light state change)
  text: string; // update by websocket
}
  
 - on connection, 
  - server send StaticModel hash, and ControlState values
  - client download (or hit cache) static model, init views[0] depending on url hash + defaultWindow
 - control state updates by websocket
 - actions component by websocket
 - action window only impact 'views' (so client only)
 - on server model change (update from studio), it can resend static model hash, and reset ControlState values

ResourceHash: hash of the resource, downloaded by http, cache infinite