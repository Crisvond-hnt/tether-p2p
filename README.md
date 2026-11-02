# tether-p2p

Procedure for an agent that is about to build a Pear app. No server in the middle.

```sh
npx skills add Crisvond-hnt/tether-p2p
```

That puts the skill in the project you run it from. Add `-g` if you want it in every project. The [skills CLI](https://github.com/vercel-labs/skills) knows Cursor, Claude Code, Codex, and the other agents it lists.

Then:

```text
Use the tether-p2p skill. Build a P2P chat with invites.
```

## What the agent is allowed to copy

| Recipe | What it builds |
| --- | --- |
| A | An Autobase room. `assets/room.cjs` is the file. `apply` stays as written. |
| B | An Autopass vault. |
| C | A QVAC worker. Inference stays on Bare. |
| D | Holesail from the CLI. Node 22 has no working `holesail-server` import. |
| E | The room, plus a WDK wallet. The Keet identity phrase and the wallet seed are two secrets. |

Node **22.17+**, npm **10.9+**. Pear is installed from [install.pears.com](https://install.pears.com). The version flag is `pear -v`. `pear touch` prints a link; `scripts/set-upgrade.mjs` writes that link into `package.json`.

## What it will not do

It will not stand up Express, Firebase, or Socket.io and call that the room. One writer per Hypercore. The swarm topic is the discovery key. The public key is the capability you hand to someone. If this skill and the docs disagree, the docs win: [docs.pears.com](https://docs.pears.com), [docs.qvac.tether.io](https://docs.qvac.tether.io).

A room from recipe A is not [Keet](https://keet.io). Keet is the product with calls and files. Northern Data is not a package.

To watch the same stack before you ask an agent to build on it: [Crisvond-hnt/desk](https://github.com/Crisvond-hnt/desk).

Apache-2.0.
