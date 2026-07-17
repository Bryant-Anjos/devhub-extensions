# devhub extensions

Official registry of **extensions** for [devhub](https://github.com/Bryant-Anjos/devhub) —
a local project manager. An extension teaches devhub about a stack: **how to
detect a project** and **what commands it can run**. Extensions are **declarative
JSON** (no code runs), so installing one from here is safe.

devhub ships built-ins (Node, Docker Compose, Unity, PHP, Python, Go, Rust). This
repo adds more, community-maintained.

## Using an extension

In devhub → **Settings → Extensions**:

- **Browse official extensions** — lists everything in this registry; click
  Install.
- **Install from a URL** — paste any manifest URL (this repo's or your own).

devhub validates the manifest, stores it, and merges it with the built-ins.

## What's here

- [`registry.json`](registry.json) — the index devhub reads (id, name,
  description, manifest URL).
- [`extensions/`](extensions) — one JSON manifest per extension.

Registry URL (used by devhub):

```
https://raw.githubusercontent.com/Bryant-Anjos/devhub-extensions/main/registry.json
```

## Manifest format

```json
{
  "id": "ruby",
  "name": "Ruby",
  "detectors": [
    { "type": "ruby", "runnable": true, "files": ["Gemfile"] }
  ],
  "commandSources": [
    {
      "provider": "static",
      "commands": [
        { "key": "ruby:install", "label": "install", "command": "bundle install", "kind": "build" },
        { "key": "ruby:test", "label": "test", "command": "bundle exec rake test", "kind": "test" }
      ]
    }
  ]
}
```

| Field | Notes |
|-------|-------|
| `id` | kebab-case, unique, matches the filename (`extensions/<id>.json`). Can't shadow a devhub built-in. |
| `name` | Display name. |
| `detectors[]` | `{ type, runnable, files }` — a project matches if **any of `files` exists at its root**. Files are **exact names**, not globs. |
| `commandSources[]` | Optional. How the stack's commands are discovered. |

### Command sources

- **`static`** — a fixed list: `commands: [{ key, label, command, kind? }]`.
- **`scriptsFile`** — reads the `scripts` object of a JSON file, e.g.
  `{ "provider": "scriptsFile", "file": "package.json", "keyPrefix": "npm", "runTemplate": "npm run {name}" }`
  (`{name}` is replaced with each script name).

`kind` ∈ `dev | build | test | prod | other`.

> Detection uses **exact filenames** (not globs), so pick a fixed marker file a
> project always has (`Gemfile`, `pom.xml`, `mix.exs`, …).

## Contributing

Add a stack in three steps — see [CONTRIBUTING.md](CONTRIBUTING.md):

1. Add `extensions/<id>.json`.
2. Add an entry to `registry.json`.
3. `node scripts/validate.mjs` (also runs in CI on your PR).

## License

MIT — see [LICENSE](LICENSE).
