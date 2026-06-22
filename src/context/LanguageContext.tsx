import { createContext, useContext, useState, type ReactNode } from 'react';

export interface Translations {
  home: {
    tagline: string; latestHash: string; freePlays: string; entry: string; prize: string;
    howTitle: string; how: [string, string][];
    posTitle: string; posDesc: string;
    playFree: string; stake: string; connectWallet: string; connecting: string; leaderboard: string;
    stakeWith: string; stakeAmount: string; confirm: string;
  };
  game: {
    quit: string; xp: string; validate: string; perfect: string; plusXp: string;
    multi: string; chain: string; free: string; stake: string; multi2: string;
  };
  result: {
    confirmed: string; validated: string; computing: string; grade: string;
    xpEarned: string; blocks: string; perfect: string; mode: string; blockHash: string;
    mineAgain: string; leaderboard: string; home: string; consensus: string;
    payoutTitle: string; payoutNote: string;
  };
  leaderboard: {
    title: string; subtitle: string; daily: string; weekly: string; all: string;
    prizePool: string; onChain: string; blocks: string; perfect: string; xp: string;
  };
}

const EN: Translations = {
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
    quit: '← QUIT', xp: 'XP', validate: '⬡ VALIDATE BLOCK',
    perfect: 'PERFECT BLOCK!', plusXp: '+10 XP', multi: 'x2 MULTIPLIER!',
    chain: 'x PERFECT CHAIN', free: 'FREE', stake: '⬡ STAKE', multi2: 'x2 MULTI',
  },
  result: {
    confirmed: 'BLOCK CONFIRMED', validated: '✓ VALIDATED', computing: 'COMPUTING...',
    grade: 'CONSENSUS GRADE', xpEarned: 'XP EARNED', blocks: 'BLOCKS STACKED',
    perfect: 'PERFECT VALID.', mode: 'MODE', blockHash: 'BLOCK HASH',
    mineAgain: '↺ MINE AGAIN', leaderboard: 'LEADERBOARD', home: '← HOME',
    consensus: 'CONSENSUS ACHIEVED', payoutTitle: 'ESTIMATED PAYOUT',
    payoutNote: 'Final payout depends on total pool at close',
  },
  leaderboard: {
    title: 'LEADERBOARD', subtitle: 'TOP VALIDATORS ON CELO',
    daily: 'DAILY', weekly: 'WEEKLY', all: 'ALL TIME',
    prizePool: "TODAY'S PRIZE POOL", onChain: 'SCORES ON CELO MAINNET',
    blocks: 'blocks', perfect: 'perfect', xp: 'XP',
  },
};

const ES: Translations = {
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
    quit: '← SALIR', xp: 'XP', validate: '⬡ VALIDAR BLOQUE',
    perfect: '¡BLOQUE PERFECTO!', plusXp: '+10 XP', multi: '¡MULTIPLICADOR x2!',
    chain: 'x CADENA PERFECTA', free: 'GRATIS', stake: '⬡ APUESTA', multi2: 'x2 MULTI',
  },
  result: {
    confirmed: 'BLOQUE CONFIRMADO', validated: '✓ VALIDADO', computing: 'CALCULANDO...',
    grade: 'GRADO DE CONSENSO', xpEarned: 'XP GANADO', blocks: 'BLOQUES APILADOS',
    perfect: 'VALID. PERFECTAS', mode: 'MODO', blockHash: 'HASH DEL BLOQUE',
    mineAgain: '↺ MINAR DE NUEVO', leaderboard: 'RANKING', home: '← INICIO',
    consensus: 'CONSENSO LOGRADO', payoutTitle: 'PAGO ESTIMADO',
    payoutNote: 'El pago final depende del pozo total al cierre',
  },
  leaderboard: {
    title: 'RANKING', subtitle: 'TOP VALIDADORES EN CELO',
    daily: 'HOY', weekly: 'SEMANA', all: 'TOTAL',
    prizePool: 'POZO DE HOY', onChain: 'PUNTAJES EN CELO MAINNET',
    blocks: 'bloques', perfect: 'perfectos', xp: 'XP',
  },
};

type Lang = 'en' | 'es';
interface LangCtx { lang: Lang; t: Translations; setLang: (l: Lang) => void; }
const Ctx = createContext<LangCtx>({ lang: 'en', t: EN, setLang: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  return <Ctx.Provider value={{ lang, t: lang === 'en' ? EN : ES, setLang }}>{children}</Ctx.Provider>;
}

export function useLanguage() { return useContext(Ctx); }
