# `mylife-home-ui`

## TODO
 - switch to preact
 - switch to websocket
 - switch to new model to server data (images, window specs, ...)
 - better webpack packaging (inline bundle, icons, ...)
 - clean client model (static model and dynamic model -> windows static, controls static, control state dynamic as (re)selector)
 - redux toolkit createReducer wraps lot of pate like immer, let's try to remove it ?


## Client-side model
  
 - on connection, 
  - server send StaticModel hash, and ControlState values
  - client download (or hit cache) static model, init views[0] depending on url hash + defaultWindow
 - control state updates by websocket
 - actions component by websocket
 - action window only impact 'views' (so client only)
 - on server model change (update from studio), it resend static model hash
