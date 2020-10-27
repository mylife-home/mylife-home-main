# `mylife-home-studio`

# Notes:

## Archi
 - Keep:
   - Deploy (tâche pour faire image + livraison ssh)
   - Studio Deploy components/bindings (diff core vs hw + livraison au diff de composants, avec sélection possible)
 - Add/Improve:
   - améliorer les scripts de build de packages/kernel modules alpine (cross build in docker sans rpi si possible)
   - pouvoir importer une config de composants d'un projet vers les tâches de build
   - pouvoir publier la sortie de packager vers la plateforme de Deploy

## Git
Commit comme on auto-save, comme l historique de google sheets
L'important est pas le titre de l action, mais le fait d avoir l historique
=> commit a chaque modification avec un long throttle (eg: 1 mins, pour eviter 18 commits sur déplacement de composant) + push tous les X temps (eg: 5 mins)

Si on veut faire des modifs nommées, c'est des branches, et on squash/merge a la fin, avec un commit message sur le merge