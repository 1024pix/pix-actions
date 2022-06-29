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
      - uses: 1024pix/pix-actions/auto-merge@v0.1.2
        with:
          auto_merge_token: "${{ secrets.PIX_SERVICE_ACTIONS_TOKEN }}"

```
</details>

## Notify team on config file change

Github action qui notifie sur Slack les équipes concernées lorsque le fichier de config de l'API a été modifié.

Voir https://github.com/1024pix/notify-team-on-config-file-change

## Jira transitions

Ces actions concernent les déplacements de tickets Jira automatisés. Elles se basent sur la présence du nom d'un ticket (`PIX-1234`) dans le titre de la PR.

### Déplacement d'un ticket [de `ToDo` à `Doing`](https://github.com/1024pix/pix/blob/dev/.github/workflows/jira-transition-to-dev-in-progress.yaml)
Cette action est uniquement déclenchée lors de la création de la PR.

```
name: Move JIRA ticket to Doing
on:
  pull_request:
    types:
      - opened
jobs:
  transition-issue:
    name: Transition Issue
    runs-on: ubuntu-latest
    env:
      JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
      JIRA_USER_EMAIL: ${{ secrets.JIRA_USER_EMAIL }}
      JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
    steps:
      - name: Login
        if: env.JIRA_BASE_URL != ''
        uses: atlassian/gajira-login@master

      - name: Find Issue Key
        if: env.JIRA_BASE_URL != ''
        id: find
        uses: atlassian/gajira-find-issue-key@master
        continue-on-error: true
        with:
          string: ${{ github.event.pull_request.title }}

      - name: Transition issue
        uses: atlassian/gajira-transition@master
        if: env.JIRA_BASE_URL != '' && steps.find.outputs.issue
        continue-on-error: true
        with:
          issue: ${{ steps.find.outputs.issue }}
          transition: "Move to 'Doing'"
```

### Déplacement d'un ticket [de `Doing` à `Review`](https://github.com/1024pix/pix/blob/dev/.github/workflows/jira-transition-to-review.yaml)
Cette action est déclenchée lors de l'ajout d'un label sur une PR. Le ticket passe en `Review` si le label `:eyes: Tech Review Needed` est ajouté.

```
name: Move JIRA ticket to Func review
on:
  pull_request:
    types:
      - labeled
jobs:
  transition-issue:
    name: Transition Issue
    runs-on: ubuntu-latest
    env:
      JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
      JIRA_USER_EMAIL: ${{ secrets.JIRA_USER_EMAIL }}
      JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
    if: >
      contains(github.event.pull_request.labels.*.name, ':eyes: Tech Review Needed')
    steps:
      - name: Login
        if: env.JIRA_BASE_URL != ''
        uses: atlassian/gajira-login@master

      - name: Find Issue Key
        if: env.JIRA_BASE_URL != ''
        id: find
        uses: atlassian/gajira-find-issue-key@master
        continue-on-error: true
        with:
          string: ${{ github.event.pull_request.title }}

      - name: Transition issue
        uses: atlassian/gajira-transition@master
        if: env.JIRA_BASE_URL != '' && steps.find.outputs.issue
        continue-on-error: true
        with:
          issue: ${{ steps.find.outputs.issue }}
          transition: "Move to 'Tech/Func Review'"
```

### Déplacement d'un ticket [de `Review` à `Intégration`](https://github.com/1024pix/pix/blob/dev/.github/workflows/on-dev-merge.yaml)
Cette action est déclenchée au push sur dev (= une fois que la PR a été mergée).

```
name: Merge on Dev
on:
  push:
    branches:
      - dev
jobs:
  transition-issue:
    name: Transition Issue
    runs-on: ubuntu-latest
    env:
      JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
      JIRA_USER_EMAIL: ${{ secrets.JIRA_USER_EMAIL }}
      JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
    steps:
      - name: Login
        if: env.JIRA_BASE_URL != ''
        uses: atlassian/gajira-login@master

      - name: Find Issue Key
        if: env.JIRA_BASE_URL != ''
        id: find
        uses: atlassian/gajira-find-issue-key@master
        continue-on-error: true
        with:
          from: commits

      - name: Transition issue
        uses: atlassian/gajira-transition@master
        if: env.JIRA_BASE_URL != '' && steps.find.outputs.issue
        continue-on-error: true
        with:
          issue: ${{ steps.find.outputs.issue }}
          transition: "Move to 'Deployed in Integration'"

  notify-team:
    name: Notify team on config file changed
    runs-on: ubuntu-latest
    steps:
      - name: Notify team on config file change
        uses: 1024pix/notify-team-on-config-file-change@v1.0.2
        with:
          GITHUB_TOKEN: ${{ github.token }}
          SLACK_BOT_TOKEN: ${{ secrets.PIX_BOT_RUN_SLACK_TOKEN }}
          INTEGRATION_ENV_URL: ${{ secrets.INTEGRATION_ENV_URL }}
```

