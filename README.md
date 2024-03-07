# pix-actions
Centralisations des GitHub Actions de Pix

## auto-merge
Chez Pix, nous aimons les labels GitHub. Après notre process de review et quand une PR est prête à être mergée, nous ajoutons le label :

> `:rocket: Ready to merge` :rocket:

L'ajout de ce label permet de démarrer l'action GitHub d'`auto-merge` qui va se débrouiller pour rebase la branche de la PR et la merger si toutes les validations automatisées (tests auto...) sont au vert.

### Utilisation
:warning: WIP, la version `v1` n'est pas encore disponible.
La liste des triggers permettant de déclencher l'action est à rediscuter.

Ne pas oublier de définir le secret `PIX_SERVICE_ACTIONS_TOKEN`.

<details>
  <summary><code>.github/workflows/auto-merge.yml</code></summary>

```yaml
name: automerge check

on:
  pull_request:
    types:
      - labeled
      - unlabeled
  check_suite:
    types:
      - completed
  status:
    types:
      - success

jobs:
  automerge:
    runs-on: ubuntu-latest
    steps:
      - uses: 1024pix/pix-actions/auto-merge@v0
        with:
          auto_merge_token: "${{ secrets.PIX_SERVICE_ACTIONS_TOKEN }}"

```
</details>

## check-node-version-availability

Chez Pix, nous utilisons le PaaS Scalingo, qui nous permet de déployer facilement nos applications.
Nous utilisons également Renovate pour mettre à jour nos dépendances, dont NodeJS.
Cependant, Scalingo ne propose pas toujours la dernière version de NodeJS,
ce qui peut poser des problèmes lors du build sur Scalingo.

Pour éviter cela, nous utilisons l'action `check-node-version-availability` qui permet de vérifier si la version
de NodeJS est disponible chez Scalingo.

### Utilisation

<details>
  <summary><code>.github/workflows/check-node-version-availability.yml</code></summary>

```yaml
name: Check node version availability on Scalingo

on: [push]

jobs:
  check-node-compatibility:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - uses: 1024pix/pix-actions/check-node-version-availability-on-scalingo@v0
```
</details>

## Release

Pour simplifier le déploiement continue de nos applications, nous utilisons l'action `release` qui permet de créer 
la bonne version, de générer le changelog et de la publier sur GitHub et npm si besoin.

### Utilisation

<details>
  <summary><code>.github/workflows/release.yml</code></summary>

```yaml
name: Release

on:
  push:
    branches:
      - main
  repository_dispatch:
    types: [ 'deploy' ]
  workflow_dispatch:

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: 1024pix/pix-actions/release@main
        env:
          GITHUB_TOKEN: ${{ env.GH_TOKEN }} # Use PAT with repo scope, and user related should have admin access if main branch is protected
```


### Configuration 

#### `npmPublish` (optionnel)

Permet de publier la nouvelle version sur npm.

Valeur par défaut : `false`
Nécessite d'ajouter un token NPM dans les secrets GitHub.
Si une tâche de build est nécessaire, elle doit être faite en amont de l'appel de l'action.

```yaml
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci
      - run: npm run build
        
      - uses: 1024pix/pix-actions/release@main
        with:
          npmPublish: true
        env:
          GITHUB_TOKEN: ${{ env.GH_TOKEN }} # Use PAT with repo scope, and user related should have admin access if main branch is protected
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```


#### `updateMajorVersion` (optionnel)

Permet de mettre à jour le tag git majeur exemple :  `v1`. Utiliser pour nos pix-actions

Valeur par défault : `false`

```yaml
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: 1024pix/pix-actions/release@main
        with: 
          updateMajorVersion: true
        env:
          GITHUB_TOKEN: ${{ env.GH_TOKEN }} # Use PAT with repo scope, and user related should have admin access if main branch is protected
```
</details>
