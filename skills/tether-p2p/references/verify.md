# Verify — definition of done

Do not say the app works until the scripts pass **and** the matching boxes are true — or you have listed the exact command the user must run.

## Required scripts (from the skill root)

```sh
node scripts/check-env.mjs
node scripts/set-upgrade.mjs /path/to/app
node scripts/verify-app.mjs /path/to/app
node scripts/prove-all.mjs
```

`verify-app.mjs` is static. It cannot prove two devices. Say **unverified at runtime** if you did not start two processes.

## All Pear recipes (A, B, C, E)

- [ ] Official template cloned; not CRA/Next as the data plane
- [ ] `scripts/set-upgrade.mjs` wrote a real `pear://` (not `YOUR_KEY`)
- [ ] `scripts/verify-app.mjs` exits 0
- [ ] P2P imports only in `workers/`
- [ ] One Corestore, namespaced
- [ ] One Hyperswarm; `store.replicate` on `connection`
- [ ] Topics are `discoveryKey`s; `join(...).flushed()`
- [ ] README has install, `npm start`, and `pear seed` (or blind-peer)
- [ ] No secrets in git, logs, or screenshots

## Recipe A

- [ ] `apply` is deterministic and handles `addWriter` as **hex**
- [ ] Two instances can start (two dirs or two machines)
- [ ] Invite / pair path exists
- [ ] Attachments are pointers

## Recipe B

- [ ] `autopass` + Corestore 7
- [ ] `createInvite` / `pair` documented
- [ ] No HTTP backup

## Recipe C

- [ ] `hello-pear-qvac-tui` or `@qvac/inference` in a **second Bare worker**
- [ ] `registerPlugin` before `loadModel`; `unloadModel` on teardown
- [ ] No vendor chat API for prompts

## Recipe D

- [ ] `npx holesail --live` / `--connect` (not `require('holesail-server')` in Node)
- [ ] Not used for Hypercore replication
- [ ] `hs://` treated as a secret; localhost bind

## Recipe E

- [ ] WDK seed ≠ identity seed
- [ ] RPC / chain named in README

## Runtime

```sh
# two folders, two processes, same invite
npm start
# second terminal, second userData dir
```

Same-machine public DHT can flake. Local proof: `hyperdht/testnet`. Real proof: two devices.
