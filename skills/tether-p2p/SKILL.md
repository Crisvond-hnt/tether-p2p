---
name: tether-p2p
description: >-
  Builds peer-to-peer Pear / Holepunch apps (Hypercore, Hyperswarm, Autobase,
  Hyperdrive, QVAC, WDK, Keet, PearPass, Holesail) with no cloud backend. Use
  when the user wants to vibe-code, scaffold, or ship a P2P chat, vault,
  local-AI app, tunnel, or wallet; mentions pear://, holepunch, Bare, or
  serverless P2P; or points an agent at this repo to build.
license: Apache-2.0
compatibility: >-
  Requires Node.js 22.17+, npm 10.9+, network. Pear CLI from
  https://install.pears.com (pear -v, not --version). QVAC inference is Bare-only.
metadata:
  author: Crisvond-hnt
  official_docs: https://docs.pears.com
  qvac_docs: https://docs.qvac.tether.io
---

# Tether P2P

Official docs win: https://docs.pears.com · https://docs.qvac.tether.io  
**No cloud data plane.** Devices store, serve, and verify.

This is a procedure. Do not skip to coding. Run the bundled scripts — do not retype them.

## 0. Load only what you need

| Task | Read |
| --- | --- |
| Any build | [references/pitfalls.md](references/pitfalls.md) |
| Chat / rooms | [references/recipes.md](references/recipes.md) § A |
| Vault / notes | [references/recipes.md](references/recipes.md) § B |
| On-device AI | [references/recipes.md](references/recipes.md) § C |
| TCP/UDP tunnel | [references/recipes.md](references/recipes.md) § D |
| Chat + pay | [references/recipes.md](references/recipes.md) § E |
| Names / layers | [references/stack.md](references/stack.md) |
| tether.io/data vs what you may claim | [references/coverage.md](references/coverage.md) |
| Before "done" | [references/verify.md](references/verify.md) |

Stay inside this skill folder. Copy gold files from `assets/`. Do not invent Autobase/QVAC/WDK APIs.

Read [references/coverage.md](references/coverage.md) before you name the product. Recipe A is not Keet. Recipe C does not run a model. Northern Data is not a package.

## 1. Classify, then stop

Pick **exactly one** recipe (A–E). If the user wants two, ship A first.

State: host + data + optional identity/QVAC/WDK.

| Host | Clone |
| --- | --- |
| Desktop GUI | `https://github.com/holepunchto/hello-pear-electron` |
| Long-running terminal | `https://github.com/holepunchto/hello-pear-bare` |
| Short CLI | `https://github.com/holepunchto/hello-pear-daemon` |
| Local LLM TUI | `https://github.com/holepunchto/hello-pear-qvac-tui` |
| Mobile | `https://github.com/holepunchto/hello-pear-react-native` |
| TCP only (D) | no Pear app — Holesail CLI |

Forbidden: Express/Firebase/Next API/Socket.io/Supabase as the room.

## 2. Environment, then official scaffold

```sh
# from the skill directory, the folder that contains SKILL.md
node scripts/check-env.mjs
# if pear missing:
#   curl https://install.pears.com/pear.sh | sh
#   export PATH="$HOME/.local/bin:$PATH"

git clone <official host from the table>
cd <app> && npm install
node <skill>/scripts/set-upgrade.mjs .
# writes package.json "upgrade" from `pear touch` — do not leave pear://<YOUR_KEY_HERE>
```

`pear -v` is the version flag. `pear touch` **prints** a link; the script pastes it.

## 3. Architecture you must keep

```
UI host     Electron / RN / terminal     — draw only
Bare worker — Corestore, Hyperswarm, Autobase, QVAC, WDK
pear-runtime — OTA, storage
```

- Put P2P in `workers/` (or the in-project `hello-pear-worker` copy). Renderer never imports `hypercore` / `autobase` / `@qvac/inference`.
- One Corestore (`pear.storage` or `app-storage`). `namespace(...)`.
- One Hyperswarm. `swarm.on('connection', (s) => store.replicate(s))`.
- Topic is **`discoveryKey`**. Wait with `await swarm.join(topic, { server: true, client: true }).flushed()`.
- One writer per Hypercore. Shared writes → Autobase. `apply` is a pure reducer.
- Admit writers as **hex**: `append({ addWriter: other.local.key.toString('hex') })` then `host.addWriter(Buffer.from(value.addWriter, 'hex'), { indexer: true })`.
- Identity mnemonic ≠ WDK seed.
- Attachments: Hyperblobs id or Hyperdrive path.

Copy the gold file. **Do not rewrite it.**

| Recipe | Copy |
| --- | --- |
| A | [assets/room.cjs](assets/room.cjs) → `workers/room.cjs` |
| B | [assets/vault.cjs](assets/vault.cjs) |
| C | [assets/qvac-worker.js](assets/qvac-worker.js) into a **second Bare worker** |
| D | no file — `npx holesail --live` / `--connect` |
| E | [assets/wallet.mjs](assets/wallet.mjs) + room.cjs |

Same Corestore + Hyperswarm as the updater. Do not replace `hello-pear-worker`.

Optional: `node scripts/scaffold.mjs electron ./my-app`

If an API is unclear, **fetch the official page in the recipe before writing**.

## 4. Done = scripts + checklist

```sh
node scripts/verify-app.mjs .
# cwd = a directory that already installed the Hyper* packages
#   tether-p2p-demo repo root, or tests/ in the map
node <skill>/scripts/prove-all.mjs
```

Cases: [evals/cases.json](evals/cases.json). Checklist: [references/verify.md](references/verify.md). If two peers did not run, say **unverified at runtime**.

## Hard no

Cloud data plane · two writers on one Hypercore · swarm on `core.key` · P2P in the renderer · non-deterministic `apply` · one mnemonic for identity and WDK · Holesail to sync cores · QVAC prompts to a vendor API · `require('holesail-server')` or `@qvac/inference` in Node · declaring done without `verify-app.mjs`
