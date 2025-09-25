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
          auto_merge_token: '${{ secrets.PIX_SERVICE_ACTIONS_TOKEN }}'
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
    types: ['deploy']
  workflow_dispatch:

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false

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
        with:
          persist-credentials: false

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

Permet de mettre à jour le tag git majeur exemple : `v1`. Utiliser pour nos pix-actions

Valeur par défault : `false`

```yaml
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false

      - uses: 1024pix/pix-actions/release@main
        with:
          updateMajorVersion: true
        env:
          GITHUB_TOKEN: ${{ env.GH_TOKEN }} # Use PAT with repo scope, and user related should have admin access if main branch is protected
```

</details>

## Check PR title

En complément de l'action de `release`, vérifier le format des titres de PRs.

Les noms acceptés qui sont utilisables par `semantic-release` sont listés ici : https://github.com/1024pix/conventional-changelog-pix/blob/main/src/writerOpts.js.

### Utilisation

<details>
  <summary><code>.github/workflows/check-pr-title.yml</code></summary>

```yaml
name: Check PR title

on:
  pull_request:
    types: [opened, edited, ready_for_review, reopened]

jobs:
  lint-pr-title:
    runs-on: ubuntu-latest
    steps:
      - uses: 1024pix/pix-actions/check-pr-title@main
```

</details>

## Docker Build

Workflow réutilisable pour construire et pousser des images Docker vers un registry d'images docker. 

### Fonctionnalités

- **Build multi-images** : Construit plusieurs images Docker en parallèle via une stratégie matrix
- **Registry flexible** : Compatible avec tout registry Docker (Scalingo, AWS ECR, etc.)
- **Cache intelligent** : Utilise GitHub Actions cache pour accélérer les builds

### Utilisation

**Fichiers d'exemples disponibles** : Consultez le dossier [`docker-build/examples/`](./docker-build/examples/) pour des exemples complets avec build-args.

### Système de tags

- **PR** : `pr-123-5` (PR #123, run #5)
- **Release** : `v1.2.3` (nom du tag Git) > Automatique avec l'action `release`
- **Main** : `rc-2025.01.25-42` (date + run number)
- **Latest** : `latest` (branche principale uniquement)

### Configuration

#### Paramètres

- `images` : Tableau JSON des images à construire (obligatoire)
- `runs-on` : Runner à utiliser (optionnel, défaut: `ubuntu-latest`)

#### Variables d'environnement par image

Vous pouvez passer des variables d'environnement spécifiques à chaque image via le champ `build-args` :

```yaml
[ ... ]
      "build-args": [
        "NODE_ENV=production",
        "API_BASE_URL=https://api.example.com"
      ]
[ ... ]
```

Ces variables sont passées comme `--build-arg` à Docker. Dans votre `Dockerfile`, déclarez-les avec `ARG` :

```dockerfile
ARG NODE_ENV
ARG API_BASE_URL

# Pour les utiliser au démarrage de l'application, déclarer les avec ENV
ENV NODE_ENV=$NODE_ENV
ENV API_BASE_URL=$API_BASE_URL
```

#### Secrets du registry

```yaml
jobs:
  build:
    uses: 1024pix/pix-actions/.github/workflows/docker-build.yml@main
    with:
      images: |
        [...]
    secrets:
      CONTAINER_REGISTRY_SCW_INFRA_ENDPOINT: ${{ secrets.CONTAINER_REGISTRY_SCW_INFRA_ENDPOINT }}
      SCW_CONTAINER_REGISTRY_INFRA_SECRET_KEY: ${{ secrets.SCW_CONTAINER_REGISTRY_INFRA_SECRET_KEY }}
```

**Secrets custom ( optionnel ) ** : 

```yaml
jobs:
  build:
    uses: 1024pix/pix-actions/.github/workflows/docker-build.yml@main
    with:
      images: |
        [...]
    secrets:
      REGISTRY_ENDPOINT: ${{ secrets.CUSTOM_REGISTRY_ENDPOINT }}
      REGISTRY_USERNAME: ${{ secrets.CUSTOM_REGISTRY_USERNAME }}
      REGISTRY_TOKEN: ${{ secrets.CUSTOM_REGISTRY_TOKEN }}
```
