# `mylife-home-ui`

## TODO
 - switch to preact
 - switch to websocket
 - better webpack packaging (inline bundle, icons, ...)
 - redux toolkit createReducer wraps lot of pate like immer, let's try to remove it ?
 - remove bootstrap
 - use fetch polyfill instead of superagent

## Client-side model
  
 - on connection, 
  - server send StaticModel hash, and ControlState values
  - client download (or hit cache) static model, init views[0] depending on url hash + defaultWindow
 - control state updates by websocket
 - actions component by websocket
 - action window only impact 'views' (so client only)
 - on server model change (update from studio), it resend static model hash
