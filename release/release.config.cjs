const semanticReleaseChangelog =
  process.env.CHANGELOG_TITLE === 'undefined' ?
    "@semantic-release/changelog" :
  [
    "@semantic-release/changelog",
    { "changelogTitle": process.env.CHANGELOG_TITLE },
  ];

const npmPlugin = process.env.HAS_NPM_PACKAGES === 'true' ? [
    [
      "@semantic-release/npm",
      {
        "npmPublish": process.env.NPM_PUBLISH === "true",
      }
    ],
    [
      "@semantic-release/exec",
      {
        "prepareCmd": "find . -mindepth 2 -maxdepth 3 -name 'package.json' -not -path '*/node_modules/*' -execdir sh -c 'npm version \"$0\" --git-tag-version=false' \"${nextRelease.type}\" \\;",
      }
    ]
  ] : [];

module.exports = {
  "branches": [
    "main",
    "dev",
    "hotfix*"
  ],
  "plugins": [
    [
      "@semantic-release/commit-analyzer",
      {
        "config": "@1024pix/conventional-changelog-pix",
        "releaseRules": [
          { revert: true, release: "patch" },
          { tag: "BUGFIX", pr: '*', release: "patch" },
          { tag: "BUMP", pr: '*', release: "patch" },
          { tag: "DOC", pr: '*', release: "patch" },
          { tag: "TECH", pr: '*', release: "patch" },
          { tag: "FEATURE", pr: '*', release: "minor" },
          { tag: "BREAKING", pr: '*', release: "major" },
        ],
      }
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        "config": "@1024pix/conventional-changelog-pix"
      }
    ],
    semanticReleaseChangelog,
    "@semantic-release/github",
    ...npmPlugin,
    [
      "@semantic-release/git",
      {
        "assets": [
          "CHANGELOG.md",
          "package.json",
          "package-lock.json",
          ["**/package.json", "**/package-lock.json", "!**/node_modules/**/*.json"],
        ],
        "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ]
  ]
}
