# Stack (compressed)

Source of the pillar names: https://tether.io/data/ — Keet, Holepunch, Pears, QVAC, Northern Data. Map of what this skill may claim: [coverage.md](coverage.md).

```
Pillar page  Keet (product) · Holepunch (protocol) · Pears (platform) · QVAC (local AI) · Northern Data (investment, not code)
Build        Pear CLI · pear-runtime · pear:// · Bare
Data         Autobase → Hyperbee / Hyperdrive / Hyperblobs → Hypercore → Corestore
Network      Hyperswarm → HyperDHT · blind peer = awake ciphertext replica
Also real    PearPass/autopass · Holesail · WDK · keet-identity-key   (not named on tether.io/data)
```

| Need | Use |
| --- | --- |
| Event log, one writer | `hypercore` |
| Many named logs | `corestore` |
| Key/value | `hyperbee` |
| Large object, no path | `hyperblobs` |
| Files / app bundle | `hyperdrive` |
| Many writers | `autobase` |
| Find topic peers | `hyperswarm` |
| Dial a public key | `hyperdht` |
| Awake replica, no plaintext | `blind-peering` |
| Portable person | `keet-identity-key` |
| Invite vault | `autopass` |
| Ship GUI / mobile / CLI | Pear + Bare |
| On-device model | `@qvac/inference` in a Bare worker (official TUI) |
| Wallet | `@tetherto/wdk` |
| Legacy TCP/UDP | Holesail — not Hypercore sync |

Official: https://docs.pears.com · https://docs.qvac.tether.io · https://docs.wdk.tether.io · https://docs.holesail.io · https://keet.io · https://pears.com/vision
