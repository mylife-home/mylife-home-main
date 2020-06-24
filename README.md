# mylife-home-main
MyLife Home main

## Update packages
 - lerna clean
 - lerna exec -- npm update
 - lerna bootstrap

## TODO

### common
 - nrpe binding
   - https://www.npmjs.com/package/jnrpe-lib
   - https://github.com/stockholmuniversity/Nagios-NRPE/blob/master/share/protocol-nrpe.md
 - publish os/app state
 - config access
 - logger
 - metadata: capabilities (keep compat with arduino) eg: osinfo, configurecomponents, ...

### core
 - engine api (create/delete component, get its config)
 - load/save config
 - store/mounted-fs

### packager