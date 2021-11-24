# pix-actions
Centralisations des GitHub Actions de Pix

## auto-merge
Chez Pix, nous aimons les labels GitHub. Après notre process de review et quand une PR est prête à être mergée, nous ajoutons le label :

> `:rocket: Ready to merge` :rocket:

L'ajout de ce label permet de démarrer l'action GitHub d'`auto-merge` qui va se débrouiller pour rebase la branche de la PR et la merger si tous les validations automatisées (tests auto...) sont au vert.

### Utilisation
:warning: WIP, la version `v1` n'est pas encore disponible.
La liste des triggers permettant de déclancher l'action est à rediscuter.

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
  pull_request_review:
    types:
      - submitted
  check_suite:
    types:
      - completed
  status:
    types:
      - success

jobs:
  automerge:
    uses: "1024pix/pix-actions/.github/workflows/auto-merge.yml@v1"
    secrets:
      auto_merge_token: "${{ secrets.PIX_SERVICE_ACTIONS_TOKEN }}"
```
</details>
