# `mylife-home-ui`

## TODO
 - switch to preact
 - remove bootstrap
 - remove express ?
 - redux toolkit createReducer wraps lot of pate like immer, let's try to remove it ?
 - better webpack packaging (inline bundle, icons, ...) ??
 - spinner.gif is huge!
 - BUG: seems that we can get components from offline instance!
 - BUG: viewport broken on mobile

## Client-side model
  
 - on connection, 
  - server send StaticModel hash, and ControlState values
  - client download (or hit cache) static model, init views[0] depending on url hash + defaultWindow
 - control state updates by websocket
 - actions component by websocket
 - action window only impact 'views' (so client only)
 - on server model change (update from studio), it resend static model hash
