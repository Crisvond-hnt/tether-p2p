# Starter prompt

Paste after the skill is installed (or `@` / `$` the skill). Replace the goal with the app you want. Name every part of it. The agent composes those parts. It does not drop them down to a single chat.

```
Use the tether-p2p skill. Follow SKILL.md. Run its scripts; do not skip them.

Build: [the app, in one sentence. Include files, a vault, a local model, a wallet, or a tunnel if you want them.]

Constraints:
- List every module the app needs, then build the whole list. Do not stop after the first block.
- Official Pear template from the skill table, unless the app is only a Holesail tunnel.
- No Express, Firebase, or Socket.io data plane.
- P2P only in workers/. One Corestore, one Hyperswarm, discoveryKey, join().flushed().
- Autobase apply is a pure reducer. addWriter keys are hex.
- Identity phrase and WDK seed are two phrases, when both exist.
- Run: node <skill>/scripts/check-env.mjs
       node <skill>/scripts/set-upgrade.mjs .
       node <skill>/scripts/verify-app.mjs .
- README: pear touch (via the script), how to run, pear seed.
- If you cannot run two peers, say unverified at runtime.

If an API is unclear, fetch docs.pears.com, docs.qvac.tether.io, docs.wdk.tether.io, or docs.holesail.io. Do not guess.
```

Installed from the skill repo: use the prompt above.

Map checkout, https://github.com/Crisvond-hnt/teather : follow `AGENTS.md` and `skills/tether-p2p/SKILL.md`.

The Tether P2P demo, https://github.com/Crisvond-hnt/tether-p2p-demo : one sitting on this stack. `npm install`, then `npm start`. It is not the limit of the skill.
