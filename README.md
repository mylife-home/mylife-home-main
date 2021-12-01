# Dev Ops

## Update packages
- lerna clean
- lerna exec -- npm update
- lerna bootstrap

## Dev build/watch/docker testing images
- cd packages/mylife-home-packager
- gulp build:dev:core --all-plugins
- gulp build:dev:ui
- gulp build:dev:studio

_cf package.json npm scripts for docker action_

_cf gulp.conf/index.ts for gulp script: dev build, watch, docker testing images_

## Release build
- bump: lerna version (or manually)
- build & publish (npm):
  - cd packages/mylife-home-packager
  - gulp publish:core
  - gulp publish:ui
  - gulp publish:studio

_alpine build/deployment: `rpi-alpine-build` repository_

## Live debug Node.JS sur alpine

```bash
ssh -L 9229:127.0.0.1:9229 root@<host>

# ensure that port forwarding is allowed
vi /etc/ssh/sshd_config
AllowTcpForwarding yes
service sshd reload


ps -a | grep node

# see if debug port is opened
netstat -tulpn | grep LISTEN

kill -usr1 <pid>
```

In Chrome: [chrome://inspect](chrome://inspect)

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
 - tab
   - click milieu = close
 - ui-designer
   - control cannot go outside of window (create, move, resize)
   - on window resize, compute control position ratio + force then to be inside window if on borders
   - on window resize window cannot be smaller that larger of its control
 - core-designer
   - multi-select
   - importer des plugins depuis les fichiers de déploiement
   - importer des plugins depuis online => split par instance
 - git
   - v1:
     - seules operations :
       - pull,
       - push (avec commit comment),
       - git shell ??? (pour gerer les conflits eventuellement)
     - quand shell ouvert, on arrete les checks periodiques pour éviter les pb de locks
   - v2:
     - use simple-git to have vscode-like basic git interface and drop gitconvex
     - besoins:
       - gestion de remotes => fetch, pull, push
       - changement de branche
       - selection staging + commit (vision diff)
       - gestion des conflits ?
 - deploy
   - quand on a une étape de type recette, il faudrait pouvoir afficher le detail de la recette en popup (voire pouvoir naviguer dessus)

## ui

 - faire CSS à la main
 - button: feedback sur l'état du bouton
   - color1 par défaut
   - color2 = click court en cours
   - si appui + long changement vers color3  : click long en cours, on peut relacher
   - color4: en attente reste séquence (eg double click)
   - rajouter un feedback pour dire que action primary ou secondary est executée

# TODO

## studio
- core designer:
  - perf: https://konvajs.org/docs/performance/All_Performance_Tips.html
  - bugs:
    - apparemment les x,y des composants se sont pas toujours des valeurs entieres
    - quand on accede depuis "quick access" et on modifie une config, les bindings sautent, puis ce n'est pas sauvegarde
    - apres refresh des entites en lignes, le projet n'est pas valide avec des erreurs qui refletent un modele pas a jour
  - validation
    - Vérifier que les composants externes existent bien (avec bon plugin etc)
    - Vérifier que les composants id sont uniques (qu'un id à livrer n'existe pas déjà sur une autre instance)
    - Vérifier qu'on peut déployer les bindings, et faire une erreur de validation plutot qu'à l'execution
    - Vérifier que les configs des composants sont corrects
      - correspondent bien aux plugins
      - existent (pas null ou undefined)
      - qu'il n'y ait pas d'autres clés de config
    - Vérifier que les bindings sont corrects (que les state/action correspondent bien aux plugins)
  - deploy en ligne
    - augmenter le timeout de call
    - ajouter un popup bloquant de livraison en cours
    - si possible ajouter un progress
  - ne pas crasher si un projet n'est pas valide
  - import:
    - permettre d'importer des composants (comme externes) depuis online (pour esp)
    - import de plugins: rajouter un regroupement par instance
- deploy
  - bug modifications non prises en compte avec duplication et navigation entre recettes
  - pouvoir desactiver une etape (sans la supprimer)
  - pouvoir rajouter des notes sur une etape
- git
  - apparemment le check frequent fait foirer le renommage de fichier en dev, et fait foirer de temps en temps git convex

## ui
- bug: when server offline, ui does not show it (but in its log we see "connection failed")

## core
- bugs:
  - pirev: rpi 0 is wrongly printed in 'instance info' as 'arm' only => cf https://github.com/samjrdn/pirev-node/issues/17

## core/driver-tahoma
- refaire une operation sur un volet deja avec une operation en cours arrete l operation en cours mais ne fait pas la nouvelle
- Unhandled event type: CommandExecutionStateChangedEvent
```
08/10/2021, 12:54:43 - DEBUG - rpi-home-main-core - mylife:home:core:plugins:driver-tahoma:engine:client - Execution ended '5f8a5f92-ac10-3e01-18e7-2cb6ea773437' FAILED
08/10/2021, 12:54:43 - DEBUG - rpi-home-main-core - mylife:home:core:plugins:driver-tahoma:engine:client - Unhandled event type: CommandExecutionStateChangedEvent
08/10/2021, 12:54:43 - DEBUG - rpi-home-main-core - mylife:home:core:components:component-host - Component host 'vr-bvouest-state' executing action 'setValue' with '77'
08/10/2021, 12:54:43 - DEBUG - rpi-home-main-core - mylife:home:core:plugins:driver-tahoma:engine:api - fetchEvents
08/10/2021, 12:54:41 - DEBUG - rpi-home-main-core - mylife:home:core:components:component-host - Component host 'vr-bvouest-state' executing action 'setValue' with '89'
08/10/2021, 12:54:41 - DEBUG - rpi-home-main-core - mylife:home:core:plugins:driver-tahoma:engine:api - fetchEvents
08/10/2021, 12:54:41 - ERROR - rpi-home-main-core - mylife:home:common:tools - Error on fireAsync
08/10/2021, 12:54:41 - DEBUG - rpi-home-main-core - mylife:home:core:components:component-host - Component host 'vr-bvouest-selector' executing action 'set2' with 'false'
08/10/2021, 12:54:41 - DEBUG - rpi-home-main-core - mylife:home:core:components:component-host - Component host 'vr-bvouest-set40' executing action 'action' with 'false'
08/10/2021, 12:54:41 - DEBUG - rpi-home-main-core - mylife:home:core:components:component-host - Component host 'vr-bvouest' executing action 'setValue' with '-1'
08/10/2021, 12:54:41 - DEBUG - rpi-home-main-core - mylife:home:core:plugins:driver-tahoma:engine:api - cancel
08/10/2021, 12:54:41 - DEBUG - rpi-home-main-core - mylife:home:core:plugins:driver-tahoma:engine:client - Canceling execution '5f8a5f92-ac10-3e01-18e7-2cb6ea773437'
08/10/2021, 12:54:41 - DEBUG - rpi-home-main-core - mylife:home:core:components:component-host - Component host 'vr-bvouest' executing action 'setValue' with '40'
08/10/2021, 12:54:41 - DEBUG - rpi-home-main-core - mylife:home:core:components:component-host - Component host 'vr-bvouest-selector' executing action 'set2' with 'true'
08/10/2021, 12:54:41 - DEBUG - rpi-home-main-core - mylife:home:core:components:component-host - Component host 'vr-bvouest-set40' executing action 'action' with 'true'
08/10/2021, 12:54:39 - DEBUG - rpi-home-main-core - mylife:home:core:plugins:driver-tahoma:engine:api - fetchEvents
08/10/2021, 12:54:37 - DEBUG - rpi-home-main-core - mylife:home:core:plugins:driver-tahoma:engine:api - fetchEvents
08/10/2021, 12:54:36 - DEBUG - rpi-home-main-core - mylife:home:core:plugins:driver-tahoma:engine:client - Started execution '5f8a5f92-ac10-3e01-18e7-2cb6ea773437' of command 'setClosure' on device 'io://0220-6975-2311/14430852'
08/10/2021, 12:54:36 - DEBUG - rpi-home-main-core - mylife:home:core:components:component-host - Component host 'vr-bvouest-selector' executing action 'set2' with 'false'
08/10/2021, 12:54:36 - DEBUG - rpi-home-main-core - mylife:home:core:components:component-host - Component host 'vr-bvouest-set40' executing action 'action' with 'false'
```
- Tahoma composants offline, pas de log
-> Mercredi 20/10 matin
   => devient verouille si login rawRequest ne repond pas!
   => ajouté timeout sur request, voir si ca corrige, sinon il faudra gerer avec un timeout directement sur la iere promise (Promise.race() avec setTimeout)

# Notes

## git
- diff:
  - https://isomorphic-git.org/docs/en/walk
  - https://www.npmjs.com/package/diff
- merge --squash
  - https://stackoverflow.com/a/25387972/12023515
- shell with ssh key:
```
GIT_SSH_COMMAND='ssh -i /ssh_key' git *
```

## drivers
 - ac dimmer
   Can ac dimmer work JS only ? (Or cpp userland?)
   npm epoll = 20k interrupts /sec on rpi4???
