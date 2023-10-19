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

```
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

