# Dev Ops

## Update packages
- lerna clean
- lerna exec -- npm update
- lerna bootstrap

## Dev build/watch/docker testing images
- cd packages/mylife-home-packager
- gulp build:dev:core --all-plugins
- gulp docker:build:core-testing
- gulp build:dev:ui
- gulp docker:build:ui-testing
- gulp build:dev:studio
- gulp docker:build:studio-testing
- gulp build:dev:collector
- gulp docker:build:collector-testing

_cf package.json npm scripts for docker action_

_cf gulp.conf/index.ts for gulp script: dev build, watch, docker testing images_

_si pb de GC node: gulp <target> --max_old_space_size=4096_

## Release build
- bump: lerna version (or manually)
- build & publish (npm):
  - cd packages/mylife-home-packager
  - gulp publish:core
  - gulp publish:ui
  - gulp publish:studio
  - gulp publish:collector

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

## Collector

 - Base de données Mongo
 - Integrer les logs
 - Integrer l'historique des états de la domotique sous forme d'events de changement d'etat
   - online/offline du collector lui-meme (pour pouvoir detecter les down time)
   - online/offline des entites (same)
   - publication des plugins (pour avoir un historique des ptes des composants)
   - publication des composants (meta aussi)
   - publication des changements de state
 - gerer les purges pour eviter d'avoir une data trop grosse? (notamment des logs?)

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
- templates
  - multiple components with template id (with config)
  - bindings between components in the template
  - config settings
  - exports (explicit to avoid pollution):
    - state/action (with possible renaming)
    - config (with possible renaming)
  - then, on use, a template is seen as a plugin, which can be instantiated into a component
  - notes:
    - take care on plugin refresh
    - a template can use another template, take care of circular dependencies

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
  - templates
    - need custom controls (VR/light "all" panel)
    - need custom windows (single VR management, later light dimmer)
    - may be fully static
    - may need to bind on several components
      - define template actions/members of certain value types to bind (as "template imports" ?)
      - at template use, provide bindings
      - ease bindings with pattern on components binding
        - template can provide a pattern like "{{id}}-set0.value", "{{id}}-set20.value" to bind its exports
        - at template use, one can provide an id and auto-fill all (or part of) bindings at once.
        - This is only a filling helper, and validation is the same than for manual binding settings
- core-designer
  - deploy en ligne: ajouter un progress
  - ne pas crasher si un projet n'est pas valide
  - on doit d'abord cliquer pour selectionner le composant avant de pouvoir drag depuis un membre, c est dommage + pareil pour move
  - recherche rapide pour plugins dans la liste
- git
  - drop gitconvex
  - changement de branche
  - commit une partie d'un fichier
  - gestion des conflits
- deploy
  - forbid id with ':'
  - move selection data to redux store (and avoid useResetSelectionIfNull components)
  - quand on a une étape de type recette, il faudrait pouvoir afficher le detail de la recette en popup (voire pouvoir naviguer dessus)
  - update immediat du store, et debounce au niveau des epics comme designers
- logs
  - pouvoir c/c des logs
- create action payload types like core-designer/ui-designer everywhere
- async actions are broken on debounce (action dropped => promise never fullfilled/rejected)

## ui

- faire CSS à la main
- button: feedback sur l'état du bouton
  - color1 par défaut
  - color2 = click court en cours
  - si appui + long changement vers color3  : click long en cours, on peut relacher
  - color4: en attente reste séquence (eg double click)
  - rajouter un feedback pour dire que action primary ou secondary est executée
- add title to window (to display in popup)
- styles
  - add custom css classes
  - permit to add them to controls statically => use it for "RDC" "R1" etc
  - add custom functions like text controls but which returns boolean to add a class or not
  => https://typestyle.github.io/#/ (6kb gzipped)
  => clsx (228B)

# TODO

## studio

- ui designer:
  - UI display resources: bug affichage
  - controle texte : enregistrer les valeurs utilisées pour le test, comme valeur par défaut, et afficher une sortie wysiwyg (utile pour les textes statiques et meme pour tester les dynamiques)
- core designer:
  - deploy:
    - pourquoi ap-entree est toujours modifié ? => config avec 'é' => voir diff charset windows/linux/OSX du client ?!?

## core

- bugs:
  - pirev: rpi 0 is wrongly printed in 'instance info' as 'arm' only => cf https://github.com/samjrdn/pirev-node/issues/17

## collector

- visualisation

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
