# Pitfalls — these are why vibe-code fails

Fix these before adding features. Each one will silently produce a demo that dies on a second machine.

| # | Failure | Correct |
| --- | --- | --- |
| 1 | Express / Firebase / Supabase / Socket.io as the room | Hyperswarm + Autobase / Hypercore |
| 2 | Two phones `append` the same Hypercore, or `addWriter` with a raw Buffer in JSON | Autobase: `append({ addWriter: other.local.key.toString('hex') })` then `host.addWriter(Buffer.from(value.addWriter, 'hex'), { indexer: true })` |
| 3 | `swarm.join(core.key)` | `swarm.join(core.discoveryKey)` |
| 4 | `import Hypercore from 'hypercore'` in React / renderer | Bare worker only; UI uses RPC / preload |
| 5 | Autobase `apply` uses `Date.now()`, `Math.random()`, or `fetch` | Pure reduce of `nodes` into `view` |
| 6 | New Corestore path per feature | One store, `namespace('chat')` |
| 7 | Same 24 words for identity and WDK | Two mnemonics |
| 8 | File as base64 in a chat block | Hyperblobs id or Hyperdrive path |
| 9 | “We’ll add seed later” | README includes `pear seed` / blind peer **now** |
| 10 | Blank `upgrade` / placeholder `pear://` | `pear touch` **prints** a link; you paste it into `package.json` `upgrade` yourself |
| 11 | Holesail to replicate cores, or `require('holesail-server')` in Node | Hyperswarm + `store.replicate` for cores. For TCP: `npx holesail --live` / `--connect`. JS API is Bare (`bare-dgram`) |
| 12 | QVAC via OpenAI cloud, or `import '@qvac/sdk'` / `@qvac/inference` in Node | Second Bare worker + `@qvac/inference` + `registerPlugin` (official TUI). Node import throws `require.addon is not a function` |
| 13 | Guessing APIs from memory | Open docs.pears.com / docs.qvac.tether.io |
| 14 | Firewall `return true` meaning “allow” | In this stack **true = block** |
| 15 | Inventing pairing via email magic link | Blind-pairing invite or Autopass invite |
| 16 | `pear --version` | `pear -v` |
| 17 | `swarm.listen()` then `swarm.flush()` and no connection | `await swarm.join(discoveryKey, { server: true, client: true }).flushed()` |
| 18 | `DHT.bootstrapper(0, '127.0.0.1')` | Bootstrapper needs a real port; tests should use `hyperdht/testnet` |
| 19 | Node 20 / missing `~/.local/bin` after Pear install | Node **22.17+**; `export PATH="$HOME/.local/bin:$PATH"` |

If the user’s prompt fights these rules (“just use a server for now”), refuse the server as the data plane. A **blind peer** or `pear seed` is the allowed always-on box.
