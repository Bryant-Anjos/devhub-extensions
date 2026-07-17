# Contributing an extension

Thanks for adding a stack! Extensions are declarative JSON — no code.

## Steps

1. **Create the manifest** at `extensions/<id>.json`. The `id` must be
   kebab-case and match the filename. See existing files for examples and the
   [README](README.md#manifest-format) for the format.

2. **Register it** — add an entry to `registry.json`:

   ```json
   {
     "id": "your-id",
     "name": "Your Stack",
     "description": "Short description.",
     "url": "https://raw.githubusercontent.com/Bryant-Anjos/devhub-extensions/main/extensions/your-id.json"
   }
   ```

3. **Validate** locally:

   ```bash
   node scripts/validate.mjs
   ```

   CI runs the same check on your pull request.

## Guidelines

- **Detection** uses exact filenames, not globs. Pick a marker file a project of
  that stack always has (e.g. `Gemfile`, `pom.xml`, `Cargo.toml`).
- Don't reuse a devhub built-in `id` (node, docker, unity, php, python, go, rust) —
  those can't be shadowed.
- Keep commands **non-interactive** and generally useful (install / run / test /
  build). Avoid framework-specific assumptions unless the marker file implies it.
- `kind` is one of `dev | build | test | prod | other`.

## Manifest schema

A JSON Schema is provided at [`schema.json`](schema.json) for editor
autocomplete/validation.
