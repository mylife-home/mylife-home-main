# `mylife-home-ui`

## TODO
 - remove / in #/window_id
 - switch to preact
 - switch to websocket
 - remove bootstrap
 - use fetch polyfill instead of superagent
 - redux toolkit createReducer wraps lot of pate like immer, let's try to remove it ?
 - try to use self history instead of package ?
 - better webpack packaging (inline bundle, icons, ...) ??
 - spinner.gif is huge!
 - BUG: seems that we can get components from offline instance!

## Client-side model
  
 - on connection, 
  - server send StaticModel hash, and ControlState values
  - client download (or hit cache) static model, init views[0] depending on url hash + defaultWindow
 - control state updates by websocket
 - actions component by websocket
 - action window only impact 'views' (so client only)
 - on server model change (update from studio), it resend static model hash
