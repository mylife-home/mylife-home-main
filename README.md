# mylife-home-main
MyLife Home main

## Update packages
 - lerna clean
 - lerna exec -- npm update
 - lerna bootstrap

## Bump
 - lerna version

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

### emulator
 - docker pi for raspbian: https://github.com/lukechilds/dockerpi
 - custom qemu raspbian kernel: https://github.com/dhruvvyas90/qemu-rpi-kernel
 - alpine qemu arm: https://superuser.com/questions/1397991/running-alpine-linux-on-qemu-arm-guests
 - cross-platform build tools: https://github.com/DDoSolitary/alpine-repo - https://github.com/DDoSolitary/alpine-repo/