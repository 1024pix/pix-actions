module.exports = {
  "branches": [
    "main",
    "dev"
  ],
  "plugins": [
    [
      "@semantic-release/commit-analyzer",
      {
        "config": "@1024pix/conventional-changelog-pix",
        "releaseRules": [
          { tag: "BUGFIX", release: "patch" },
          { tag: "BUMP", release: "patch" },
          { tag: "DOC", release: "patch" },
          { tag: "TECH", release: "patch" },
          { tag: "FEATURE", release: "minor" },
          { tag: "BREAKING_CHANGE", release: "major" },
        ],
      }
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        "config": "@1024pix/conventional-changelog-pix"
      }
    ],
    "@semantic-release/changelog",
    "@semantic-release/github",
    [
      "@semantic-release/npm",
      {
        "npmPublish": process.env.NPM_PUBLISH === "true",
      }
    ],
    [
      "@semantic-release/git",
      {
        "assets": [
          "CHANGELOG.md",
        ],
        "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ]
  ]
}