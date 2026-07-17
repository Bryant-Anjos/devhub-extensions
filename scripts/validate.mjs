import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Zero-dependency validator: checks every extension manifest and that the
// registry index stays in sync. Run in CI on every PR.
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const errors = []
const err = (msg) => errors.push(msg)

const KINDS = new Set(['dev', 'build', 'test', 'prod', 'other'])
const KEBAB = /^[a-z0-9-]+$/

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function validateManifest(file, ext) {
  const where = `extensions/${file}`
  if (typeof ext.id !== 'string' || !KEBAB.test(ext.id)) err(`${where}: id must be kebab-case`)
  if (`${ext.id}.json` !== file) err(`${where}: filename must match id ("${ext.id}.json")`)
  if (typeof ext.name !== 'string' || !ext.name) err(`${where}: name is required`)
  if (!Array.isArray(ext.detectors) || ext.detectors.length === 0) err(`${where}: detectors[] required`)
  for (const d of ext.detectors ?? []) {
    if (typeof d.type !== 'string' || !d.type) err(`${where}: detector.type required`)
    if (typeof d.runnable !== 'boolean') err(`${where}: detector.runnable must be boolean`)
    if (!Array.isArray(d.files) || d.files.length === 0) err(`${where}: detector.files[] required`)
  }
  for (const s of ext.commandSources ?? []) {
    if (!['scriptsFile', 'static'].includes(s.provider)) err(`${where}: commandSource.provider invalid`)
    if (s.provider === 'static') {
      for (const c of s.commands ?? []) {
        if (!c.key || !c.label || !c.command) err(`${where}: static command needs key/label/command`)
        if (c.kind && !KINDS.has(c.kind)) err(`${where}: invalid kind "${c.kind}"`)
      }
    } else if (s.provider === 'scriptsFile' && (!s.file || !s.runTemplate)) {
      err(`${where}: scriptsFile needs file + runTemplate`)
    }
  }
}

const files = readdirSync(join(root, 'extensions')).filter((f) => f.endsWith('.json'))
const ids = new Set()
for (const file of files) {
  let ext
  try {
    ext = readJson(join(root, 'extensions', file))
  } catch (e) {
    err(`extensions/${file}: invalid JSON — ${e.message}`)
    continue
  }
  validateManifest(file, ext)
  ids.add(ext.id)
}

const registry = readJson(join(root, 'registry.json'))
if (!Array.isArray(registry)) err('registry.json: must be an array')
const registryIds = new Set()
for (const entry of registry) {
  if (!entry.id || !entry.name || !entry.url) err(`registry.json: entry needs id/name/url (${JSON.stringify(entry)})`)
  registryIds.add(entry.id)
  if (!ids.has(entry.id)) err(`registry.json: "${entry.id}" has no extensions/${entry.id}.json`)
}
for (const id of ids) {
  if (!registryIds.has(id)) err(`registry.json: missing an entry for extensions/${id}.json`)
}

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):`)
  for (const e of errors) console.error('  - ' + e)
  process.exit(1)
}
console.log(`✓ ${files.length} extensions valid and in sync with the registry.`)
