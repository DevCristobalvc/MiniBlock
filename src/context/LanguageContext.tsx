import { createContext, useContext, useState, type ReactNode } from 'react';

const EN = {
  home: {
    tagline: 'STACK BLOCKS · VALIDATE THE CHAIN',
    latestHash: 'latest_hash',
    freePlays: 'FREE PLAYS',
    entry: 'ENTRY',
    prize: 'PRIZE POOL',
    howTitle: 'HOW IT WORKS',
    how: [
      ['01', 'Block enters as PENDING TX — hash computes in real time'],
      ['02', 'Press VALIDATE BLOCK to confirm it on-chain'],
      ['03', 'Perfect alignment = full block + bonus XP + bigger payout'],
    ],
    posTitle: 'PROOF OF STACK',
    posDesc: 'Stake cUSD or cCOP to enter the prize pool. Top validators split the rewards linearly — the higher you rank, the more you earn. Even 2nd place walks away with something.',
    playFree: '▶ PLAY FREE',
    stake: '⬡ STAKE & PLAY',
    connectWallet: 'CONNECT WALLET',
    connecting: 'CONNECTING...',
    leaderboard: 'VIEW LEADERBOARD →',
    stakeWith: 'STAKE WITH',
    stakeAmount: 'STAKE AMOUNT',
    confirm: 'CONFIRM STAKE',
  },
  game: {
    quit: '← QUIT',
    xp: 'XP',
    validate: '⬡ VALIDATE BLOCK',
    perfect: 'PERFECT BLOCK!',
    plusXp: '+10 XP',
    multi: 'x2 MULTIPLIER!',
    chain: 'x PERFECT CHAIN',
    free: 'FREE',
    stake: '⬡ STAKE',
    multi2: 'x2 MULTI',
  },
  result: {
    confirmed: 'BLOCK CONFIRMED',
    validated: '✓ VALIDATED',
    computing: 'COMPUTING...',
    grade: 'CONSENSUS GRADE',
    xpEarned: 'XP EARNED',
    blocks: 'BLOCKS STACKED',
    perfect: 'PERFECT VALID.',
    mode: 'MODE',
    blockHash: 'BLOCK HASH',
    mineAgain: '↺ MINE AGAIN',
    leaderboard: 'LEADERBOARD',
    home: '← HOME',
    consensus: '★ CONSENSUS ACHIEVED',
    payoutTitle: 'ESTIMATED PAYOUT',
    payoutNote: 'Final payout depends on total pool at close',
  },
  leaderboard: {
    title: 'LEADERBOARD',
    subtitle: 'TOP VALIDATORS ON CELO',
    daily: 'DAILY',
    weekly: 'WEEKLY',
    all: 'ALL TIME',
    prizePool: "TODAY'S PRIZE POOL",
    onChain: 'SCORES ON CELO MAINNET',
    blocks: 'blocks',
    perfect: 'perfect',
    xp: 'XP',
  },
} as const;

const ES: typeof EN = {
  home: {
    tagline: 'APILA BLOQUES · VALIDA LA CADENA',
    latestHash: 'ultimo_hash',
    freePlays: 'GRATIS',
    entry: 'ENTRADA',
    prize: 'PREMIO',
    howTitle: 'CÓMO JUGAR',
    how: [
      ['01', 'Un bloque entra como TX PENDIENTE — el hash calcula en tiempo real'],
      ['02', 'Presiona VALIDAR BLOQUE para confirmarlo on-chain'],
      ['03', 'Alineación perfecta = bloque completo + XP extra + más ganancias'],
    ],
    posTitle: 'PROOF OF STACK',
    posDesc: 'Apuesta cUSD o cCOP para entrar al pozo. Los mejores validadores se reparten linealmente — entre más alto tu rank, más ganas. Hasta el 2do lugar se lleva algo.',
    playFree: '▶ JUGAR GRATIS',
    stake: '⬡ APOSTAR Y JUGAR',
    connectWallet: 'CONECTAR WALLET',
    connecting: 'CONECTANDO...',
    leaderboard: 'VER RANKING →',
    stakeWith: 'APOSTAR CON',
    stakeAmount: 'MONTO A APOSTAR',
    confirm: 'CONFIRMAR APUESTA',
  },
  game: {
    quit: '← SALIR',
    xp: 'XP',
    validate: '⬡ VALIDAR BLOQUE',
    perfect: '¡BLOQUE PERFECTO!',
    plusXp: '+10 XP',
    multi: '¡MULTIPLICADOR x2!',
    chain: 'x CADENA PERFECTA',
    free: 'GRATIS',
    stake: '⬡ APUESTA',
    multi2: 'x2 MULTI',
  },
  result: {
    confirmed: 'BLOQUE CONFIRMADO',
    validated: '✓ VALIDADO',
    computing: 'CALCULANDO...',
    grade: 'GRADO DE CONSENSO',
    xpEarned: 'XP GANADO',
    blocks: 'BLOQUES APILADOS',
    perfect: 'VALID. PERFECTAS',
    mode: 'MODO',
    blockHash: 'HASH DEL BLOQUE',
    mineAgain: '↺ MINAR DE NUEVO',
    leaderboard: 'RANKING',
    home: '← INICIO',
    consensus: '★ CONSENSO LOGRADO',
    payoutTitle: 'PAGO ESTIMADO',
    payoutNote: 'El pago final depende del pozo total al cierre',
  },
  leaderboard: {
    title: 'RANKING',
    subtitle: 'TOP VALIDADORES EN CELO',
    daily: 'HOY',
    weekly: 'SEMANA',
    all: 'TOTAL',
    prizePool: 'POZO DE HOY',
    onChain: 'PUNTAJES EN CELO MAINNET',
    blocks: 'bloques',
    perfect: 'perfectos',
    xp: 'XP',
  },
};

export type Translations = typeof EN;
type Lang = 'en' | 'es';

interface LangCtx { lang: Lang; t: Translations; setLang: (l: Lang) => void; }
const Ctx = createContext<LangCtx>({ lang: 'en', t: EN, setLang: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  return <Ctx.Provider value={{ lang, t: lang === 'en' ? EN : ES, setLang }}>{children}</Ctx.Provider>;
}

export function useLanguage() { return useContext(Ctx); }
