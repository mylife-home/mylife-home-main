# General

## Update packages
 - lerna clean
 - lerna exec -- npm update
 - lerna bootstrap

## Bump
 - lerna version

# Besoins

## Studio

 - Pouvoir déployer les images en SSH
 - Garder un backup de chaque image déployée, pour pouvoir restaurer rapidement sur une SDCard à la main s'il y a un problème

# Packages notes

## studio

### Archi
 - Keep:
   - Deploy (tâche pour faire image + livraison ssh)
   - Studio Deploy components/bindings (diff core vs hw + livraison au diff de composants, avec sélection possible)
 - Add/Improve:
   - améliorer les scripts de build de packages/kernel modules alpine (cross build in docker sans rpi si possible)
   - pouvoir importer une config de composants d'un projet vers les tâches de build
   - pouvoir publier la sortie de packager vers la plateforme de Deploy

#### core-designer toolbox
 - objectifs:
   - pouvoir référencer d'autres composants pour les bindings d'un projet
   - pouvoir avoir un projet 'hw' et un projet 'logic' sur une seule instance
<br><br>
 - components can be external (they are visually marked - eg: other color)
 - import toolbox from online entities: (select by entity/plugin usage then checkbox for each plugin to select to exact list)
 - import external components from online instances (select by entity/plugin usage) => components are imported as external (toolbox is updated if needed)
 - import external components from other core project => components are imported as external (toolbox is updated if needed)
<br><br>
 - on peut supprimer des composants (external ou non)
 - on peut supprimer des plugins de la toolbox s'ils ne sont plus utilisés (ca simplifie le projet)
 - on peut cacher des plugins de la toolbox s'ils ne sont que utilisés par des composants externes (impossible de supprimer mais on ne veut pas qu'ils polluent)
<br><br>
 - deploy: deploy only components not external
<br><br>
 - must handle component overwrite on import from online instances/core projet if it already exist as non-external in the project

### Git
 - web-ui pour gerer git: https://gitconvex.com/

## ui

### Client-side model
  
- on connection, 
  - server send StaticModel hash, and ControlState values
  - client download (or hit cache) static model, init views[0] depending on url hash + defaultWindow
- control state updates by websocket
- actions component by websocket
- action window only impact 'views' (so client only)
- on server model change (update from studio), it resend static model hash

# Ameliorations v3

## studio

 - ui-designer
   - control cannot go outside of window (create, move, resize)
   - on window resize, compute control position ratio + force then to be inside window if on borders
   - on window resize window cannot be smaller that larger of its control
 - core-designer
   - multi-select

## ui

 - faire CSS à la main

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

## core
 - store/mounted-fs

## studio
- core designer:
  - perf: https://konvajs.org/docs/performance/All_Performance_Tips.html
  - deploy
    - online (one shot comme ui mettre toute la conf a jour d un coup?)
    - as recipe files for direct config in image
  - refresh toolbox
    - from online entities
    - from deploy config?
- setup gitconvex

# Notes

## git
- diff:
  - https://isomorphic-git.org/docs/en/walk
  - https://www.npmjs.com/package/diff
- merge --squash
  - https://stackoverflow.com/a/25387972/12023515

## Utilisation
- alpinelinux rpi: sous windows il faut formatter la SD Card avec Rufus (sinon ca boot, mais le layout de /dev/mmblck*** est faux)
