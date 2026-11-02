# tether-p2p

A skill for an agent that is about to write a Pear app. You install it into the project, then you tell the agent to follow it. The agent gets a procedure, the files it may copy, and the scripts for the steps that are easy to get wrong.

```sh
npx skills add Crisvond-hnt/tether-p2p
```

Run that in the app you want built. Add `-g` to put the skill in your user directory instead of the project. The [skills CLI](https://github.com/vercel-labs/skills) installs it for Cursor, Claude Code, Codex, and the other agents it supports. Add `-y` if you do not want the prompts.

Then say:

```text
Use the tether-p2p skill. Build a P2P chat with invites.
```

The skill picks one recipe and stops. If you asked for two products, it builds the room first.

## The five recipes

**A. Room.** An Autobase log with more than one writer. The file to copy is `assets/room.cjs`. `apply` in that file only updates the view. Leave it. Writer keys go in as hex. A Buffer that rides through JSON becomes `{ type: "Buffer", data: [...] }`, and Autobase throws.

**B. Vault.** An Autopass vault and an invite. `assets/vault.cjs` creates it or pairs from the invite. The invite is a capability. It does not belong in a ticket, a log, or a screenshot.

**C. On-device model.** `assets/qvac-worker.js` goes in a second Bare worker. Inference does not run in Node. `@qvac/inference` throws `require.addon is not a function` if you import it from a Node process.

**D. Tunnel.** Holesail from the CLI: `npx holesail --live 3000`, then `npx holesail --connect hs://… --port 4000`. There is no library import on Node 22. `require('holesail-server')` dies on `bare-dgram`.

**E. Room plus a wallet.** Recipe A, and `assets/wallet.mjs`. The Keet identity phrase and the WDK seed are generated apart. One phrase for both is a bug.

## What has to be true on the machine

Node **22.17+** and npm **10.9+**. Pear comes from [install.pears.com](https://install.pears.com):

```sh
curl https://install.pears.com/pear.sh | sh
pear -v
```

`pear -v` is the version flag. `pear --version` is not. `pear touch` prints a `pear://` link and does not write it anywhere. `scripts/set-upgrade.mjs` reads that link and puts it in `package.json` under `upgrade`. Leaving `pear://<YOUR_KEY_HERE>` in that field is the usual reason a new Pear app fails to boot.

The skill checks this with `scripts/check-env.mjs` before it writes an app, and `scripts/verify-app.mjs` before it calls the app done. If it could not run two peers, it says the run is unverified. That is the correct result.

## How the code is supposed to sit

The screen is Electron, React Native, or a terminal. It draws. The peer-to-peer work lives in a Bare worker: one Corestore, one Hyperswarm, replication on every connection. The swarm topic is `discoveryKey`. The public key is what you hand to someone so they can read or write. Those are different keys. Sharing the public key is handing over a capability.

One writer per Hypercore. Several writers means Autobase, and `apply` stays a pure reducer. The official host to clone is in the skill, one per surface: `hello-pear-electron`, `hello-pear-bare`, `hello-pear-daemon`, `hello-pear-qvac-tui`, `hello-pear-react-native`. The skill does not invent a server and call it the room.

A room from recipe A is a text log. [Keet](https://keet.io) is the product with calls and files. Northern Data is the infrastructure investment. It is not a dependency.

If the skill and the docs disagree, follow the docs: [docs.pears.com](https://docs.pears.com) and [docs.qvac.tether.io](https://docs.qvac.tether.io).

To watch the same pieces run before you ask an agent to build, clone [Crisvond-hnt/desk](https://github.com/Crisvond-hnt/desk), then `npm install` and `npm run friends`.

Apache License 2.0. See `LICENSE`.
