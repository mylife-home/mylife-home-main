# `mylife-home-ui`

## TODO
 - BUG: seems that we can get components from offline instance!
   => OK when the instance disconnect while we are online
   => KO when we go online after the instance has been disconnected

## Client-side model
  
 - on connection, 
  - server send StaticModel hash, and ControlState values
  - client download (or hit cache) static model, init views[0] depending on url hash + defaultWindow
 - control state updates by websocket
 - actions component by websocket
 - action window only impact 'views' (so client only)
 - on server model change (update from studio), it resend static model hash
