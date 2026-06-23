import { useCallback, useEffect, useState } from 'react';
import { createPublicClient, http, formatUnits, type PublicClient } from 'viem';
import { celo, celoAlfajores } from 'viem/chains';
import { useWallet } from './useWallet';
import type { Currency } from '../utils/prizes';

// ── Config ─────────────────────────────────────────────────────────────────
const IS_TESTNET = import.meta.env.VITE_NETWORK === 'testnet';
const CHAIN      = IS_TESTNET ? celoAlfajores : celo;

export const CONTRACT_ADDRESS = (
  IS_TESTNET
    ? import.meta.env.VITE_CONTRACT_ALFAJORES
    : import.meta.env.VITE_CONTRACT_MAINNET
) as `0x${string}` | undefined;

export const TOKEN_ADDRESSES: Record<Currency, `0x${string}`> = IS_TESTNET
  ? {
      cUSD: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
      cCOP: '0x3a0EA4e0806805527C750ab9b34382642448468d',
    }
  : {
      cUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
      cCOP: '0x8A567e2aE79CA692Bd748aB832081C45de4041eA',
    };

// ── Minimal ABIs ───────────────────────────────────────────────────────────
const ERC20_ABI = [
  { name: 'approve',     type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { name: 'allowance',   type: 'function', stateMutability: 'view',       inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'balanceOf',   type: 'function', stateMutability: 'view',       inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
] as const;

const MINIBLOCK_ABI = [
  // Free mode
  { name: 'submitFreeScore',     type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'score', type: 'uint32' }, { name: 'blocksStacked', type: 'uint16' }, { name: 'perfectCount', type: 'uint16' }], outputs: [] },
  { name: 'freeScores',          type: 'function', stateMutability: 'view',       inputs: [{ name: '', type: 'address' }], outputs: [{ name: 'score', type: 'uint32' }, { name: 'blocksStacked', type: 'uint16' }, { name: 'perfectCount', type: 'uint16' }, { name: 'timestamp', type: 'uint40' }] },
  { name: 'freeScorersCount',    type: 'function', stateMutability: 'view',       inputs: [], outputs: [{ type: 'uint256' }] },
  // Sessions
  { name: 'sessionCount',        type: 'function', stateMutability: 'view',       inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'sessions',            type: 'function', stateMutability: 'view',       inputs: [{ name: '', type: 'uint256' }], outputs: [{ name: 'token', type: 'address' }, { name: 'stakeAmount', type: 'uint256' }, { name: 'startTime', type: 'uint64' }, { name: 'endTime', type: 'uint64' }, { name: 'state', type: 'uint8' }, { name: 'totalPool', type: 'uint256' }, { name: 'platformFee', type: 'uint256' }, { name: 'playerCount', type: 'uint32' }] },
  { name: 'joinSession',         type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'sessionId', type: 'uint256' }], outputs: [] },
  { name: 'submitSessionScore',  type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'sessionId', type: 'uint256' }, { name: 'score', type: 'uint32' }, { name: 'perfectCount', type: 'uint16' }, { name: 'nonce', type: 'uint256' }, { name: 'sig', type: 'bytes' }], outputs: [] },
  { name: 'claimPayout',         type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'sessionId', type: 'uint256' }], outputs: [] },
  { name: 'getPlayerEntry',      type: 'function', stateMutability: 'view',       inputs: [{ name: 'sessionId', type: 'uint256' }, { name: 'player', type: 'address' }], outputs: [{ name: 'stake', type: 'uint256' }, { name: 'score', type: 'uint32' }, { name: 'perfectCount', type: 'uint16' }, { name: 'payout', type: 'uint256' }, { name: 'claimed', type: 'bool' }] },
  { name: 'previewPayouts',      type: 'function', stateMutability: 'view',       inputs: [{ name: 'sessionId', type: 'uint256' }], outputs: [{ name: 'players', type: 'address[]' }, { name: 'scores', type: 'uint32[]' }, { name: 'payouts', type: 'uint256[]' }] },
  // Events
  { name: 'FreeScoreSubmitted',  type: 'event', inputs: [{ name: 'player', type: 'address', indexed: true }, { name: 'score', type: 'uint32', indexed: false }, { name: 'blocksStacked', type: 'uint16', indexed: false }, { name: 'perfectCount', type: 'uint16', indexed: false }] },
  { name: 'SessionFinalized',    type: 'event', inputs: [{ name: 'sessionId', type: 'uint256', indexed: true }, { name: 'pool', type: 'uint256', indexed: false }, { name: 'fee', type: 'uint256', indexed: false }, { name: 'playerCount', type: 'uint32', indexed: false }] },
] as const;

// ── Types ──────────────────────────────────────────────────────────────────
export interface SessionInfo {
  id: bigint;
  token: `0x${string}`;
  stakeAmount: bigint;
  stakeFormatted: string;
  endTime: bigint;
  secondsLeft: number;
  state: number;       // 0=Open 1=Finalized 2=Cancelled
  totalPool: bigint;
  poolFormatted: string;
  playerCount: number;
  currency: Currency;
}

export interface PlayerEntry {
  stake: bigint;
  score: number;
  perfectCount: number;
  payout: bigint;
  payoutFormatted: string;
  claimed: boolean;
}

function decimalsForCurrency(_c: Currency) { return 18; }

function detectCurrency(tokenAddr: string): Currency {
  const lower = tokenAddr.toLowerCase();
  for (const [cur, addr] of Object.entries(TOKEN_ADDRESSES)) {
    if (addr.toLowerCase() === lower) return cur as Currency;
  }
  return 'cUSD';
}

// ── Public client (read-only) ──────────────────────────────────────────────
let _publicClient: PublicClient | null = null;
function getPublicClient(): PublicClient {
  if (!_publicClient) {
    _publicClient = createPublicClient({ chain: CHAIN, transport: http() }) as PublicClient;
  }
  return _publicClient;
}

// ── Hook ──────────────────────────────────────────────────────────────────
export function useContract() {
  const { address, client: walletClient } = useWallet();
  const [activeSession, setActiveSession] = useState<SessionInfo | null>(null);
  const [playerEntry, setPlayerEntry]     = useState<PlayerEntry | null>(null);
  const [txPending, setTxPending]         = useState(false);
  const [txError, setTxError]             = useState<string | null>(null);

  const contractAddr = CONTRACT_ADDRESS;
  const publicClient = getPublicClient();

  // ── Load active session ──────────────────────────────────────────────────
  const refreshSession = useCallback(async () => {
    if (!contractAddr) return;
    try {
      const count = await publicClient.readContract({
        address: contractAddr, abi: MINIBLOCK_ABI, functionName: 'sessionCount',
      }) as bigint;

      if (count === 0n) return;

      // Find latest open session
      for (let i = count - 1n; i >= 0n; i--) {
        const s = await publicClient.readContract({
          address: contractAddr, abi: MINIBLOCK_ABI, functionName: 'sessions', args: [i],
        }) as any;

        if (s.state === 0) { // Open
          const currency   = detectCurrency(s.token);
          const decimals   = decimalsForCurrency(currency);
          const now        = Math.floor(Date.now() / 1000);
          const secondsLeft = Math.max(0, Number(s.endTime) - now);

          setActiveSession({
            id:             i,
            token:          s.token,
            stakeAmount:    s.stakeAmount,
            stakeFormatted: formatUnits(s.stakeAmount, decimals),
            endTime:        s.endTime,
            secondsLeft,
            state:          s.state,
            totalPool:      s.totalPool,
            poolFormatted:  formatUnits(s.totalPool, decimals),
            playerCount:    Number(s.playerCount),
            currency,
          });
          break;
        }
      }
    } catch (e) {
      console.error('refreshSession', e);
    }
  }, [contractAddr, publicClient]);

  // ── Load player entry for active session ─────────────────────────────────
  const refreshPlayerEntry = useCallback(async (sessionId: bigint) => {
    if (!contractAddr || !address) return;
    try {
      const e = await publicClient.readContract({
        address: contractAddr, abi: MINIBLOCK_ABI,
        functionName: 'getPlayerEntry', args: [sessionId, address as `0x${string}`],
      }) as any;

      const currency = activeSession?.currency ?? 'cUSD';
      const decimals = decimalsForCurrency(currency);
      setPlayerEntry({
        stake:          e.stake,
        score:          Number(e.score),
        perfectCount:   Number(e.perfectCount),
        payout:         e.payout,
        payoutFormatted: formatUnits(e.payout, decimals),
        claimed:        e.claimed,
      });
    } catch (e) {
      console.error('refreshPlayerEntry', e);
    }
  }, [contractAddr, address, publicClient, activeSession?.currency]);

  useEffect(() => { refreshSession(); }, [refreshSession]);
  useEffect(() => {
    if (activeSession) refreshPlayerEntry(activeSession.id);
  }, [activeSession, refreshPlayerEntry]);

  // ── Write helpers ─────────────────────────────────────────────────────────
  async function write(fn: () => Promise<`0x${string}`>) {
    setTxPending(true);
    setTxError(null);
    try {
      const hash = await fn();
      await publicClient.waitForTransactionReceipt({ hash });
      await refreshSession();
    } catch (e: any) {
      const msg = e?.shortMessage ?? e?.message ?? 'Transaction failed';
      setTxError(msg);
      throw e;
    } finally {
      setTxPending(false);
    }
  }

  // ── submitFreeScore ────────────────────────────────────────────────────────
  const submitFreeScore = useCallback(async (
    score: number, blocksStacked: number, perfectCount: number
  ) => {
    if (!contractAddr || !walletClient || !address) return;
    await write(() => walletClient.writeContract({
      address: contractAddr, abi: MINIBLOCK_ABI, functionName: 'submitFreeScore',
      args: [score, blocksStacked, perfectCount],
      account: address as `0x${string}`, chain: CHAIN,
    }));
  }, [contractAddr, walletClient, address]);

  // ── joinSession (approve + join) ──────────────────────────────────────────
  const joinSession = useCallback(async (sessionId: bigint, tokenAddr: `0x${string}`, stakeAmount: bigint) => {
    if (!contractAddr || !walletClient || !address) return;

    // 1. Check allowance
    const allowance = await publicClient.readContract({
      address: tokenAddr, abi: ERC20_ABI, functionName: 'allowance',
      args: [address as `0x${string}`, contractAddr],
    }) as bigint;

    // 2. Approve if needed
    if (allowance < stakeAmount) {
      await write(() => walletClient.writeContract({
        address: tokenAddr, abi: ERC20_ABI, functionName: 'approve',
        args: [contractAddr, stakeAmount],
        account: address as `0x${string}`, chain: CHAIN,
      }));
    }

    // 3. Join
    await write(() => walletClient.writeContract({
      address: contractAddr, abi: MINIBLOCK_ABI, functionName: 'joinSession',
      args: [sessionId],
      account: address as `0x${string}`, chain: CHAIN,
    }));
  }, [contractAddr, walletClient, address, publicClient]);

  // ── submitSessionScore (called with backend-signed data) ──────────────────
  const submitSessionScore = useCallback(async (
    sessionId: bigint,
    score:     number,
    perfects:  number,
    nonce:     bigint,
    sig:       `0x${string}`
  ) => {
    if (!contractAddr || !walletClient || !address) return;
    await write(() => walletClient.writeContract({
      address: contractAddr, abi: MINIBLOCK_ABI, functionName: 'submitSessionScore',
      args: [sessionId, score, perfects, nonce, sig],
      account: address as `0x${string}`, chain: CHAIN,
    }));
    if (activeSession) refreshPlayerEntry(activeSession.id);
  }, [contractAddr, walletClient, address, activeSession, refreshPlayerEntry]);

  // ── claimPayout ───────────────────────────────────────────────────────────
  const claimPayout = useCallback(async (sessionId: bigint) => {
    if (!contractAddr || !walletClient || !address) return;
    await write(() => walletClient.writeContract({
      address: contractAddr, abi: MINIBLOCK_ABI, functionName: 'claimPayout',
      args: [sessionId],
      account: address as `0x${string}`, chain: CHAIN,
    }));
    refreshPlayerEntry(sessionId);
  }, [contractAddr, walletClient, address, refreshPlayerEntry]);

  return {
    contractAddr,
    activeSession,
    playerEntry,
    txPending,
    txError,
    submitFreeScore,
    joinSession,
    submitSessionScore,
    claimPayout,
    refreshSession,
  };
}
