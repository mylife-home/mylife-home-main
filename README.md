# General

## Update packages
 - lerna clean
 - lerna exec -- npm update
 - lerna bootstrap

## Bump
 - lerna version

# Packages notes

## studio

### Ameliorations

 - ui-designer
   - control cannot go outside of window (create, move, resize)
   - on window resize, compute control position ratio + force then to be inside window if on borders
   - on window resize window cannot be smaller that larger of its control

### Archi
 - Keep:
   - Deploy (tâche pour faire image + livraison ssh)
   - Studio Deploy components/bindings (diff core vs hw + livraison au diff de composants, avec sélection possible)
 - Add/Improve:
   - améliorer les scripts de build de packages/kernel modules alpine (cross build in docker sans rpi si possible)
   - pouvoir importer une config de composants d'un projet vers les tâches de build
   - pouvoir publier la sortie de packager vers la plateforme de Deploy

### Git
Commit comme on auto-save, comme l historique de google sheets
L'important est pas le titre de l action, mais le fait d avoir l historique
=> commit a chaque modification avec un long throttle (eg: 1 mins, pour eviter 18 commits sur déplacement de composant) + push tous les X temps (eg: 5 mins)

Si on veut faire des modifs nommées, c'est des branches, et on squash/merge a la fin, avec un commit message sur le merge

web-ui pour gerer git: https://gitconvex.com/

## ui

### Client-side model
  
- on connection, 
  - server send StaticModel hash, and ControlState values
  - client download (or hit cache) static model, init views[0] depending on url hash + defaultWindow
- control state updates by websocket
- actions component by websocket
- action window only impact 'views' (so client only)
- on server model change (update from studio), it resend static model hash

# Roadmap

## Livrer irc-bridge + ui:

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

## Migrer absoluta

car que sensor vers ui

# TODO

## ui
- fix temp fixed numbers
- fix failure on ipad
- dynamic model + model store

## core
 - store/mounted-fs

## studio
- core designer:
  - main
    - toolbox
    - multi-select + duplicate
  - storage (git?)
  - deploy
- ui designer
  - import components
  - storage (git?)
  - deploy

# Notes

## emulator
- docker pi for raspbian: https://github.com/lukechilds/dockerpi
- custom qemu raspbian kernel: https://github.com/dhruvvyas90/qemu-rpi-kernel
- alpine qemu arm: https://superuser.com/questions/1397991/running-alpine-linux-on-qemu-arm-guests
- cross-platform build tools: https://github.com/DDoSolitary/alpine-repo - https://github.com/DDoSolitary/alpine-repo/tree/docker

## deployment
- openrc daemon: https://stackoverflow.com/questions/8251933/how-can-i-log-the-stdout-of-a-process-started-by-start-stop-daemon
- nrpe

## git
- diff:
  - https://isomorphic-git.org/docs/en/walk
  - https://www.npmjs.com/package/diff
- merge --squash
  - https://stackoverflow.com/a/25387972/12023515
