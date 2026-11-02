# Tether P2P

An agent skill for building apps on the Holepunch, Pear, and QVAC stack. Install it, then tell the agent what you want. It composes the peer-to-peer modules that app needs. There is no cloud backend in the design, and a chat is not the only thing it knows how to make.

The name is Tether P2P. The install slug is `tether-p2p`, because a skill name cannot contain a space.

```sh
npx skills add Crisvond-hnt/tether-p2p
```

Run that in the project you want built. `-g` installs it for every project on the machine. `-y` skips the prompts. The [skills CLI](https://github.com/vercel-labs/skills) puts the skill where Cursor, Claude Code, Codex, and the other agents it supports will find it.

The skill is a directory: `SKILL.md`, plus `references/`, `scripts/`, and `assets/`. The agent reads the short procedure first and opens a reference only when the app needs that module. The scripts cover the steps that are easy to get wrong, such as writing the `pear://` link `pear touch` only prints.

## What you can ask it to build

Describe the app. The agent is supposed to list every module that app needs and build all of them.

| You want | It reaches for |
| --- | --- |
| A desktop, terminal, or mobile app that ships to other peers | Pear, on the official `hello-pear-*` template for that surface |
| Files and folders a group shares | Hyperdrive, Corestore, Hyperswarm |
| A sorted table | Hyperbee |
| A large blob | Hyperblobs |
| A log more than one person can append | Autobase. One writer per Hypercore. `apply` stays a pure reducer |
| Notes or secrets that follow a person, opened by an invite | Autopass, the library PearPass is built on |
| A model that runs on the device and does not take an API key | QVAC, in a Bare worker. The official terminal host is `hello-pear-qvac-tui` |
| An address the person holds | WDK. The wallet seed is a different phrase from the Keet identity |
| A TCP or UDP port, with no account | Holesail |
| The same person on two devices | `keet-identity-key` |
| Something still reachable when the laptop is asleep | A blind peer, or `pear seed` |

A shared folder with a local model and an address is one app. The skill is there to keep those pieces in one Bare worker, on one swarm, instead of inventing a server to glue them together.

The family those products come from is [tether.io/data](https://tether.io/data/): Keet, Holepunch, Pear, QVAC, and Northern Data. Northern Data is the infrastructure investment. It is not a package, and the skill will not scaffold it. Keet, the product, has calls, video, and files. A text log this skill copies is not Keet. Say that plainly if someone asks for Keet.

## What the agent is required to keep

- The screen draws. The peer-to-peer work lives in a Bare worker.
- One Corestore. One Hyperswarm. Peers find each other on `discoveryKey`. The public key is the capability you hand to someone.
- Shared mutable state goes through Autobase. The reducer does not touch the network or the clock.
- Node.js 22.17 or newer, npm 10.9 or newer. Pear from [install.pears.com](https://install.pears.com). The version flag is `pear -v`.
- Official docs win when this repo and the web disagree: [docs.pears.com](https://docs.pears.com), [docs.qvac.tether.io](https://docs.qvac.tether.io), [docs.wdk.tether.io](https://docs.wdk.tether.io), [docs.holesail.io](https://docs.holesail.io).

`scripts/check-env.mjs` runs before the agent writes the app. `scripts/set-upgrade.mjs` stores the link from `pear touch`. `scripts/verify-app.mjs` runs before the agent calls the app done. If two peers never ran, the agent says the run is unverified.

## A sitting you can run first

[tether-p2p-demo](https://github.com/Crisvond-hnt/tether-p2p-demo) is one app on this stack: a thread, a note, an address, and a model on the machine that asked. `npm install`, then `npm start`. It is a way to see the pieces move. It is not the skill, and it is not the limit of what the skill will build.

Apache License 2.0. See `LICENSE`.
