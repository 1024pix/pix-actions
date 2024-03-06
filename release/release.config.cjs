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
          "package.json",
          "package-lock.json",
        ],
        "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ]
  ]
}