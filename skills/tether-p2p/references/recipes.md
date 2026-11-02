# Recipes

Clone the official host first. Then add only the blocks below. Recheck https://docs.pears.com if a signature looks stale.

## A — P2P text room (not Keet)

Keet on https://tether.io/data/ is chat **plus video, calls, and unbounded files**. This recipe is text messages and optional blob ids.

**Host:** `hello-pear-electron` (or RN / bare).  
**Goal:** two processes, invite string, messages, optional file pointer.  
**Do not invent this.** Copy `assets/room.cjs` → `workers/room.cjs`. `openRoom(store, swarm)`. Prove: `scripts/prove-room.mjs`.

```js
import Corestore from 'corestore'
import Hyperswarm from 'hyperswarm'
import Autobase from 'autobase'
import Hyperbee from 'hyperbee'

const store = new Corestore(storagePath)
const swarm = new Hyperswarm()
swarm.on('connection', (socket) => store.replicate(socket))

const base = new Autobase(store.namespace('room'), bootstrapKeyOrNull, {
  valueEncoding: 'json',
  open: (viewStore) => new Hyperbee(viewStore.get({ name: 'view' }), {
    keyEncoding: 'utf-8',
    valueEncoding: 'json'
  }),
  apply: async (nodes, view, host) => {
    for (const { value } of nodes) {
      if (value.addWriter) {
        const key = Buffer.isBuffer(value.addWriter)
          ? value.addWriter
          : Buffer.from(value.addWriter, 'hex')
        await host.addWriter(key, { indexer: true })
        continue
      }
      if (value.type === 'message') {
        await view.put('msg/' + value.id, value)
      }
    }
  }
})
await base.ready()
await swarm.join(base.discoveryKey, { server: true, client: true }).flushed()
// first writer admits the second (hex — JSON cannot carry a raw Buffer key):
// await base.append({ addWriter: other.local.key.toString('hex') })
// and in apply: await host.addWriter(Buffer.from(value.addWriter, 'hex'), { indexer: true })

await base.append({ type: 'message', id: crypto.randomUUID(), text: 'hello' })
await base.update()
```

- Invite / pair using the template’s **blind-pairing** flow — do not invent email login.
- Files: `hyperblobs` put → store `id` on the message. Or Hyperdrive path.
- Optional authorship: `keet-identity-key` — `generateMnemonic` / `from` / `bootstrap` / `attestData` / `verify`. Persist mnemonic encrypted; never log it.
- UI talks to the worker over the existing preload / RPC. Renderer does not import `autobase`.

Docs: https://docs.pears.com/getting-started/ · https://docs.pears.com/p2p/reference/building-blocks/autobase/

## B — Vault (PearPass-shaped)

**Host:** Electron or bare. **Lib:** `autopass` + **Corestore 7**.  
Copy `assets/vault.cjs`. Prove: `scripts/prove-vault.mjs`.

```js
import Autopass from 'autopass'
import Corestore from 'corestore'

const pass = new Autopass(new Corestore('./vault'))
const invite = await pass.createInvite()
// other device:
const pair = Autopass.pair(new Corestore('./vault-b'), invite)
const other = await pair.finished()
await other.ready()
```

- No REST backup. Optional `addMirror(blindPeerKey)`.
- Invite is a capability — show QR, do not paste in public issues.

https://github.com/holepunchto/autopass

## C — On-device AI (QVAC)

**Prefer host:** `hello-pear-qvac-tui` or a **second Bare worker**.

Copy `assets/qvac-worker.js` into a **second Bare worker**. Official host: `hello-pear-qvac-tui`. `@qvac/inference` is Bare-only. Prove: `scripts/prove-qvac.mjs` (static).

```js
const sdk = await import('@qvac/inference')
const { llmPlugin } = await import('@qvac/inference/llamacpp-completion/plugin')
sdk.registerPlugin(llmPlugin)

const modelId = await sdk.loadModel({
  modelSrc: sdk.LLAMA_3_2_1B_INST_Q4_0,
  modelConfig: { ctx_size: 8192 },
  onProgress: (p) => {}
})
const run = sdk.completion({
  modelId,
  history: [{ role: 'user', content: userText }],
  captureThinking: true
})
for await (const event of run.events) {
  if (event.type === 'contentDelta') {}
}
await sdk.unloadModel({ modelId })
```

- Models: local path, HTTPS, registry constant, or `pear://<drive>/file.gguf`.
- Assess fit on mobile before download.
- Prompts stay in-process. `qvac serve --openai` (port 11434) is for **local tools**, not a public SaaS.
- Recheck https://docs.qvac.tether.io/reference/api/ before new method names.

## D — Tunnel (Holesail)

Use when the other program speaks **TCP/UDP**, not Hypercore.

```sh
npx holesail --live 3000 --host 127.0.0.1
# prints hs://…  — treat like an SSH key
npx holesail --connect hs://… --port 4000 --host 127.0.0.1
```

Prove: `scripts/prove-holesail.mjs`.

- Do **not** wrap `store.replicate` in Holesail.
- Bind localhost. Treat `hs://` as a secret.
- `require('holesail-server')` from **Node 22 fails** (`bare-dgram` / `require.addon`). Use the CLI, or call the JS API from Bare.
- Pair with `qvac serve` only to reach a local OpenAI-compatible port.

https://docs.holesail.io

## E — Room + pay

Recipe A, then copy `assets/wallet.mjs` **in the same worker**, **new seed**. Prove: `scripts/prove-wallet.mjs`.

```js
import WDK from '@tetherto/wdk'
import EvmWalletManager from '@tetherto/wdk-wallet-evm'

const seed = WDK.getRandomSeedPhrase() // different from keet-identity mnemonic
const wdk = new WDK(seed)
wdk.registerWallet('ethereum', EvmWalletManager, { provider: rpcUrl })
const account = await wdk.getAccount('ethereum', 0)
```

- Name RPCs honestly. Chains are not Hypercores.
- https://docs.wdk.tether.io

## Ship (all Pear recipes)

```sh
pear touch
# package.json "upgrade": "pear://..."
pear stage <channel>
pear release <channel>     # production pointer
pear seed <channel>        # keep running, or --blind-peer
```

Dev: `--no-updates` / `updates: false` so a live release does not overwrite the working tree.
