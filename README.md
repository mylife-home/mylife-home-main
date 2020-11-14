# mylife-home-main
MyLife Home main

## Update packages
 - lerna clean
 - lerna exec -- npm update
 - lerna bootstrap

## Bump
 - lerna version

## TODO

### general
 - go to webpack 5
 - clean build warnings

### common
 - nrpe binding
   - https://www.npmjs.com/package/jnrpe-lib
   - https://github.com/stockholmuniversity/Nagios-NRPE/blob/master/share/protocol-nrpe.md
 - publish os/app state
 - config access
 - logger
 - metadata: capabilities (keep compat with arduino) eg: osinfo, configurecomponents, ...

### core
 - store/mounted-fs

### emulator
 - docker pi for raspbian: https://github.com/lukechilds/dockerpi
 - custom qemu raspbian kernel: https://github.com/dhruvvyas90/qemu-rpi-kernel
 - alpine qemu arm: https://superuser.com/questions/1397991/running-alpine-linux-on-qemu-arm-guests
 - cross-platform build tools: https://github.com/DDoSolitary/alpine-repo - https://github.com/DDoSolitary/alpine-repo/tree/docker

### deployment
 - openrc daemon: https://stackoverflow.com/questions/8251933/how-can-i-log-the-stdout-of-a-process-started-by-start-stop-daemon

## Notes

### Roadmap

#### Livrer irc-bridge + ui:

 - nouveau core
   - rpi-home-core new (rpi3)
   - creation du projet core avec juste les composants irc-bridge
   - livraison avec nouveau deploy  
   - nouvelle image alpine
   - mosquitto
   - core avec plugin irc-bridge

 - ui
   - livraison sur kube
   - accessible en lan sans auth
   - accessible en remote avec auth

=> validation:
 - designer core
 - designer ui
 - projets designer github (meme si commit "naif" ou "primitif")
 - fabrication de nouvelle image (+packager)
 - déploiement kube ui définitif
 - déploiement complet (sauf modules noyau et apps externes comme lirc) de core sur rpi

#### Migrer absoluta

car que sensor vers ui