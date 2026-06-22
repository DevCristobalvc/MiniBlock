# MiniBlock

A blockchain-themed stack game built as a MiniPay Mini App on Celo.

Stack blocks to build a chain. Each block is a pending transaction — when it lands, the hash is validated and sealed on-chain.

## Gameplay

- A block enters as a **PENDING** transaction, hash scrambling in real-time
- Tap **VALIDATE BLOCK** to confirm it on the chain
- Perfect alignment = full block width + 25 XP bonus
- Misaligned = overhanging portion is cut, next block is narrower
- 3 perfect validations in a row = **x2 XP multiplier**
- Game over when a block is too small to continue

## Modes

| Mode | Entry | Reward |
|------|-------|--------|
| Free | — | XP + Leaderboard |
| Stake | 0.10 cUSD | Top 3 split daily prize pool |

## Stack

- React 18 + TypeScript
- Vite
- viem (wallet + Celo interaction)
- Canvas API (no game engine)

## Run locally

```bash
npm install
npm run dev
```

## MiniPay integration

The app auto-detects MiniPay via `window.ethereum.isMiniPay` and connects automatically. On standard browsers, a manual connect button is shown.

```ts
if (window.ethereum?.isMiniPay) {
  // auto-connect, no button needed
}
```

- Wallet client: `viem` with `celo` chain
- Legacy transactions only (no EIP-1559)
- feeCurrency: USDm for gas

## Smart contract (Celo Mainnet)

Stores: `wallet`, `score`, `perfect_count`, `timestamp` per game session.

Deploy target: Celo Mainnet — `npm run deploy`

## Screens

1. **Home** — wallet connect, prize pool info, how-to
2. **Game** — canvas stack game with hash animation
3. **Result** — score, grade, block hash reveal animation
4. **Leaderboard** — daily / weekly / all-time with prize pool

## Proof of Ship

Built for [Celo Proof of Ship](https://talent.app/~/earn/celo-proof-of-ship) · June 2026
