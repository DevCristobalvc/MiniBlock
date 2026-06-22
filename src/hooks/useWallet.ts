import { useState, useEffect, useCallback } from 'react';
import { createWalletClient, custom, type WalletClient } from 'viem';
import { celo } from 'viem/chains';

interface WalletState {
  address: string | null;
  shortAddress: string;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  isMiniPay: boolean;
  client: WalletClient | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

function shorten(addr: string) { return addr.slice(0, 6) + '...' + addr.slice(-4); }

export function useWallet(): WalletState {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<WalletClient | null>(null);

  const isMiniPay = typeof window !== 'undefined' && !!(window as any).ethereum?.isMiniPay;

  const connect = useCallback(async () => {
    const eth = (window as any).ethereum;
    if (!eth) {
      setError('No wallet found. Open in MiniPay or install MetaMask.');
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      // eth_requestAccounts triggers the MetaMask / MiniPay popup
      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
      if (!accounts?.length) throw new Error('No accounts returned');

      const walletClient = createWalletClient({ chain: celo, transport: custom(eth) });
      setClient(walletClient);
      setAddress(accounts[0]);
    } catch (e: any) {
      // User rejected (code 4001) — don't show error, just close
      if (e?.code !== 4001) setError(e?.message ?? 'Connection failed');
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => { setAddress(null); setClient(null); }, []);

  // Auto-connect MiniPay
  useEffect(() => { if (isMiniPay) connect(); }, [isMiniPay, connect]);

  // Sync account changes
  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;
    const handler = (accounts: string[]) => {
      if (!accounts.length) disconnect(); else setAddress(accounts[0]);
    };
    eth.on('accountsChanged', handler);
    return () => eth.removeListener?.('accountsChanged', handler);
  }, [disconnect]);

  return { address, shortAddress: address ? shorten(address) : '', connected: !!address, connecting, error, isMiniPay, client, connect, disconnect };
}
