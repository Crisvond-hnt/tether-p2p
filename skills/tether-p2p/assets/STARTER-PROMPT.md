# Starter prompt

Paste after the skill is installed (or `@` / `$` the skill). Replace the goal.

```
Use the tether-p2p skill. Follow SKILL.md in order. Run its scripts; do not skip them.

Build: [one sentence — e.g. a desktop P2P chat with invite links and optional file pointers]

Constraints:
- Exactly one recipe (A–E). No extra products.
- Official Pear template from the skill table. No Express/Firebase/Socket.io data plane.
- P2P only in workers/. One Corestore, one Hyperswarm, discoveryKey, join().flushed().
- Autobase apply is a pure reducer. addWriter keys are hex.
- Run: node <skill>/scripts/check-env.mjs
       node <skill>/scripts/set-upgrade.mjs .
       node <skill>/scripts/verify-app.mjs .
- README: pear touch (via the script), npm start, pear seed.
- If you cannot run two peers, say unverified at runtime.

If an API is unclear, fetch docs.pears.com or docs.qvac.tether.io — do not guess.
```

Installed from the skill repo: use the prompt above.

Map checkout, https://github.com/Crisvond-hnt/teather : follow `AGENTS.md` and `skills/tether-p2p/SKILL.md`.

The Tether P2P demo, https://github.com/Crisvond-hnt/tether-p2p-demo : `npm install`, then `npm start`. That opens your window. Press Open the other window for the friend. `--cli` keeps the terminal.
