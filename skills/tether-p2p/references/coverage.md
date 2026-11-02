# Coverage vs https://tether.io/data/

That page is the product story. This skill ships **buildable slices** of it. Do not tell the user you built Keet, QVAC, or Northern Data because a prove script passed.

| On tether.io/data | What it actually is | This skill |
| --- | --- | --- |
| Tether Data | Pillar: P2P, no forced intermediary | Rule: no cloud data plane |
| Keet | Product: chat, **video, calls**, unlimited files, encrypted, zero servers | Recipe A is **text + file pointer** (`assets/room.cjs`). Not video. Not calls. Not Keet. |
| Holepunch | Open P2P protocol anyone can build on | Hypercore, Corestore, Hyperbee, Hyperblobs, Hyperdrive, Autobase, Hyperswarm, HyperDHT |
| Pears.com | App platform on that protocol | Official `hello-pear-*` templates, `pear -v`, `pear touch` → `scripts/set-upgrade.mjs` |
| QVAC | Local AI, no cloud, no API keys; devices from phones to robots | Recipe C copies `assets/qvac-worker.js` into a **Bare** worker. Prove does **not** download or run a model. |
| Northern Data | **Investment** in AI infrastructure (HPC). Not an npm package | Do not import it. Do not scaffold it. |

## Not on that page, but real build tools

These are correct to use. They are **not** named on tether.io/data:

| Tool | Where it is documented | Skill |
| --- | --- | --- |
| PearPass | https://docs.pass.pears.com | Recipe B = `autopass` library, not the PearPass app |
| Holesail | https://docs.holesail.io | Recipe D CLI only. `require('holesail-server')` fails on Node 22 |
| WDK | https://docs.wdk.tether.io | Recipe E address derivation. No chain broadcast |
| `keet-identity-key` | Holepunch | Optional. Separate mnemonic from WDK |
| Blind peering | docs.pears.com | Availability when phones sleep. Not implemented in gold files |

## What “done” is allowed to mean

- One recipe, gold file copied, `scripts/set-upgrade.mjs` + `scripts/verify-app.mjs` exit 0.
- Matching `scripts/prove-*.mjs` exit 0 **if** Hyper* deps are installed.
- Say **unverified** for: two real devices, Keet media, QVAC weights, WDK send, `pear seed` to a stranger, Northern Data.

Official docs still win if this file and the web disagree: https://docs.pears.com · https://docs.qvac.tether.io
