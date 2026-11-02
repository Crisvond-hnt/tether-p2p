---
name: tether-p2p
description: >-
  Composes Holepunch, Pear, and QVAC into the app the person asked for:
  shared files, vaults, on-device models, wallets, tunnels, or multi-writer
  logs, with no cloud backend. Use when scaffolding or shipping a Pear app,
  a Hypercore, Hyperswarm, Hyperdrive, Autobase, or Hyperbee system, local
  QVAC inference, a WDK wallet, Autopass or PearPass, Holesail, or when the
  user mentions pear://, holepunch, Bare, Keet, or Tether P2P.
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

Build the app they asked for. Compose the modules in [references/stack.md](references/stack.md). A shared text log is one block. It is not the default app, and it is not a reason to drop the rest of the request.

Official docs win: https://docs.pears.com · https://docs.qvac.tether.io · https://docs.wdk.tether.io · https://docs.holesail.io  
**No cloud data plane.** Devices store, serve, and verify.

Run the bundled scripts. Do not retype `pear touch` or the gold `apply`.

## 0. Load the slice this app needs

| The app needs | Read |
| --- | --- |
| Any build | [references/pitfalls.md](references/pitfalls.md) and [references/stack.md](references/stack.md) |
| What you may claim | [references/coverage.md](references/coverage.md) |
| A shared log several people append | [references/recipes.md](references/recipes.md) § A |
| An invite vault / notes | [references/recipes.md](references/recipes.md) § B |
| A model on the device | [references/recipes.md](references/recipes.md) § C |
| A TCP/UDP port with no account | [references/recipes.md](references/recipes.md) § D |
| A self-custodial address | [references/recipes.md](references/recipes.md) § E |
| Files or a drive | Hyperdrive row in the stack file, then the Pear docs page it links |
| Before "done" | [references/verify.md](references/verify.md) |

Stay inside this skill folder. Copy gold files from `assets/`. Do not invent Autobase, QVAC, or WDK APIs. If a signature is unclear, fetch the official page before writing.

Read coverage before you name the product. A text log is not Keet. A copied worker is not the QVAC product. Northern Data is not a package.

## 1. List every module, then build them

Write the app in one sentence. Under it, list the modules. Build the whole list.

| They asked for | Modules |
| --- | --- |
| Files or a folder a group shares | Hyperdrive, Corestore, Hyperswarm, Pear |
| A sorted table or settings | Hyperbee on a core |
| A large blob with no path | Hyperblobs, store the id |
| Notes or secrets that follow the person | Autopass (`assets/vault.cjs`) |
| A log several people append | Autobase (`assets/room.cjs`) |
| A model that reads local data and does not call a vendor | QVAC in a second Bare worker (`assets/qvac-worker.js`) |
| An address they hold, next to that app | WDK (`assets/wallet.mjs`), a second seed |
| An existing TCP or UDP service, no account | Holesail CLI. Not a Hypercore |
| A person who is the same on two devices | `keet-identity-key`, separate from the wallet seed |
| The app still reachable when the phone sleeps | Blind peer or `pear seed`. Not a database you operate |

A folder plus a local model plus an address is three blocks. Build three. Do not ship the log and stop.

Say which host you are cloning:

| Host | Clone |
| --- | --- |
| Desktop GUI | `https://github.com/holepunchto/hello-pear-electron` |
| Long-running terminal | `https://github.com/holepunchto/hello-pear-bare` |
| Short CLI | `https://github.com/holepunchto/hello-pear-daemon` |
| Local model TUI | `https://github.com/holepunchto/hello-pear-qvac-tui` |
| Mobile | `https://github.com/holepunchto/hello-pear-react-native` |
| TCP only | no Pear app — Holesail CLI |

Forbidden as the data plane: Express, Firebase, a Next API, Socket.io, Supabase.

## 2. Environment, then the official scaffold

```sh
# from the skill directory, the folder that contains SKILL.md
node scripts/check-env.mjs
# if pear is missing:
#   curl https://install.pears.com/pear.sh | sh
#   export PATH="$HOME/.local/bin:$PATH"

git clone <official host from the table>
cd <app> && npm install
node <skill>/scripts/set-upgrade.mjs .
```

`pear -v` is the version flag. `pear touch` prints a `pear://` link. The script writes that link into `package.json` `upgrade`. A leftover `pear://<YOUR_KEY_HERE>` is why a new Pear app fails to boot.

## 3. Architecture you keep while composing

```
UI host     Electron / RN / terminal     — draw only
Bare worker — Corestore, Hyperswarm, the data modules, QVAC, WDK
pear-runtime — OTA, storage
```

- P2P goes in `workers/` (or the template's worker). The renderer never imports `hypercore`, `autobase`, or `@qvac/inference`.
- One Corestore (`pear.storage` or `app-storage`). `namespace(...)` per feature. Do not open a new store per feature.
- One Hyperswarm. `swarm.on('connection', (s) => store.replicate(s))`.
- Topic is `discoveryKey`. Wait with `await swarm.join(topic, { server: true, client: true }).flushed()`.
- One writer per Hypercore. Shared writes go through Autobase. `apply` is a pure reducer: no network, no clock, no globals.
- Admit writers as hex: `append({ addWriter: other.local.key.toString('hex') })`, then `host.addWriter(Buffer.from(value.addWriter, 'hex'), { indexer: true })`.
- Identity mnemonic and WDK seed are two phrases.
- Files live in Hyperdrive or as a Hyperblobs id. Not as base64 inside a log entry.
- Same Corestore and Hyperswarm as the template updater. Do not replace `hello-pear-worker`.

Optional scaffold: `node scripts/scaffold.mjs electron ./my-app`

## 4. Gold files are blocks you copy

Copy each block the module list names. Leave `apply` as it is.

| Block | Copy |
| --- | --- |
| Shared log | [assets/room.cjs](assets/room.cjs) → `workers/room.cjs` |
| Invite vault | [assets/vault.cjs](assets/vault.cjs) |
| On-device model | [assets/qvac-worker.js](assets/qvac-worker.js) into a second Bare worker |
| TCP/UDP | no file — `npx holesail --live` / `--connect` |
| Address | [assets/wallet.mjs](assets/wallet.mjs) in the worker, new seed |

`@qvac/inference` runs in Bare. Importing it from Node throws `require.addon is not a function`. A Node host that must drive a model uses `@qvac/sdk`, which starts the Bare worker. A Pear app uses the worker file.

`require('holesail-server')` on Node 22 dies on `bare-dgram`. Use the CLI, or the JS API from Bare.

## 5. Done

```sh
node scripts/verify-app.mjs .
# cwd = the app, or another directory that already installed the Hyper* packages
node <skill>/scripts/prove-all.mjs
```

`prove-all` runs the prove script for every gold file. Run the ones for the blocks you copied when you only need those. Checklist: [references/verify.md](references/verify.md). Cases: [evals/cases.json](evals/cases.json).

If two peers did not run, say **unverified at runtime**. Do not call a text log Keet. Do not call a copied worker the QVAC product. Do not import Northern Data.

## Hard no

Cloud data plane · dropping modules the person asked for so the app becomes only a chat · two writers on one Hypercore · swarm on `core.key` · P2P in the renderer · non-deterministic `apply` · one mnemonic for identity and WDK · Holesail to sync cores · QVAC prompts sent to a vendor API · `require('holesail-server')` or `@qvac/inference` in Node · declaring done without `verify-app.mjs`
