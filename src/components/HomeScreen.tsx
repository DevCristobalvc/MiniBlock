import { useEffect, useRef, useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useLanguage } from '../context/LanguageContext';
import { randomBlockHash } from '../utils/hashGen';
import { STAKE_OPTIONS, calcPayouts, formatAmount, type Currency } from '../utils/prizes';

interface Props {
  onPlay: (mode: 'free' | 'stake', currency?: Currency, stake?: number) => void;
  onLeaderboard: () => void;
}

export default function HomeScreen({ onPlay, onLeaderboard }: Props) {
  const { address, shortAddress, connected, connecting, error, isMiniPay, connect } = useWallet();
  const { lang, t, setLang } = useLanguage();
  const [tickHash, setTickHash] = useState(randomBlockHash());
  const [blockHeight] = useState(() => 4_200_000 + Math.floor(Math.random() * 9999));
  const hashRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stake config
  const [currency, setCurrency] = useState<Currency>('cUSD');
  const [stakeIdx, setStakeIdx] = useState(0);
  const [showStake, setShowStake] = useState(false);

  const stakeAmount = STAKE_OPTIONS[currency][stakeIdx];

  // Mock pool size (will come from contract)
  const [mockPool] = useState(() => ({ players: 7 + Math.floor(Math.random() * 14), total: parseFloat((1.2 + Math.random() * 4).toFixed(2)) }));

  useEffect(() => {
    hashRef.current = setInterval(() => setTickHash(randomBlockHash()), 2000);
    return () => { if (hashRef.current) clearInterval(hashRef.current); };
  }, []);

  // Preview payouts for mock pool
  const payouts = calcPayouts(mockPool.players + 1, stakeAmount); // +1 = you joining

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', animation: 'fadeUp 0.3s ease both' }}>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="badge">
            <span style={{ color: '#22c55e', fontSize: 7 }}>●</span>
            CELO · #{blockHeight.toLocaleString()}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Lang toggle */}
          <div style={{ display: 'flex', background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 8, overflow: 'hidden' }}>
            {(['en', 'es'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                background: lang === l ? '#1e1e1e' : 'transparent', color: lang === l ? '#fff' : '#444',
                border: 'none', padding: '4px 10px', fontSize: 10, fontFamily: 'var(--font-mono)',
                fontWeight: lang === l ? 700 : 400, cursor: 'pointer', letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}>
                {l}
              </button>
            ))}
          </div>
          {connected ? (
            <div className="badge badge-green">⬡ {shortAddress}</div>
          ) : (
            <button onClick={connect} disabled={connecting || isMiniPay} style={{
              background: 'none', border: '1px solid #2a2a2a', borderRadius: 8,
              color: connecting ? '#333' : '#666', fontSize: 10,
              fontFamily: 'var(--font-mono)', padding: '5px 12px', cursor: 'pointer', letterSpacing: '0.5px',
            }}>
              {connecting ? t.home.connecting : t.home.connectWallet}
            </button>
          )}
        </div>
      </div>

      {/* ── Scrollable middle ── */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '0 18px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '18px 0 14px' }}>
          <img src="/icon.png" alt="MiniBlock" style={{ width: 56, height: 56, marginBottom: 10, imageRendering: 'pixelated' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <h1 style={{ fontSize: 38, fontWeight: 900, letterSpacing: '-2px', color: '#fff', lineHeight: 1, margin: 0 }}>
            MINI<span style={{ color: 'var(--accent)' }}>BLOCK</span>
          </h1>
          <p style={{ color: '#444', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.8px', marginTop: 5 }}>
            {t.home.tagline}
          </p>
        </div>

        {/* Live hash ticker */}
        <div style={{ background: '#090909', border: '1px solid #181818', borderRadius: 8, padding: '6px 10px', marginBottom: 12, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(252,255,82,0.28)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'flex', gap: 8 }}>
          <span style={{ color: '#222', flexShrink: 0 }}>{t.home.latestHash}</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{tickHash}</span>
        </div>

        {/* PoS description */}
        <div style={{ background: '#090909', border: '1px solid rgba(252,255,82,0.1)', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.5px' }}>⬡ {t.home.posTitle}</span>
          </div>
          <p style={{ fontSize: 12, color: '#555', lineHeight: 1.55, margin: 0 }}>{t.home.posDesc}</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
          <StatCard label={t.home.freePlays} value="∞" />
          <StatCard label={t.home.entry} value="0.10+" sub=" cUSD" accent />
          <StatCard label={`${mockPool.players} PLAYERS`} value={`${mockPool.total.toFixed(2)}`} sub=" cUSD" />
        </div>

        {/* How it works */}
        <div style={{ background: '#090909', border: '1px solid #181818', borderRadius: 10, padding: '10px 12px', marginBottom: 4 }}>
          <p style={{ fontSize: 9, color: '#2a2a2a', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px', marginBottom: 8, textTransform: 'uppercase' }}>{t.home.howTitle}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {(t.home.how as [string, string][]).map(([n, text]) => (
              <div key={n} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 700, flexShrink: 0, paddingTop: 2 }}>{n}</span>
                <span style={{ fontSize: 11, color: '#555', lineHeight: 1.4 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stake config (expanded) */}
        {showStake && (
          <div style={{ background: '#090909', border: '1px solid #1e1e1e', borderRadius: 12, padding: '12px 14px', marginTop: 10, animation: 'fadeUp 0.2s ease both' }}>
            <p style={{ fontSize: 9, color: '#444', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px', marginBottom: 10, textTransform: 'uppercase' }}>{t.home.stakeWith}</p>

            {/* Currency toggle */}
            <div style={{ display: 'flex', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 8, padding: 3, marginBottom: 10 }}>
              {(['cUSD', 'cCOP'] as Currency[]).map(c => (
                <button key={c} onClick={() => { setCurrency(c); setStakeIdx(0); }} style={{
                  flex: 1, padding: '6px 0', borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: currency === c ? '#1e1e1e' : 'transparent',
                  color: currency === c ? '#fff' : '#444',
                  fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', transition: 'all 0.15s',
                }}>
                  {c}
                </button>
              ))}
            </div>

            {/* Stake amount */}
            <p style={{ fontSize: 9, color: '#333', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px', marginBottom: 6, textTransform: 'uppercase' }}>{t.home.stakeAmount}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 12 }}>
              {STAKE_OPTIONS[currency].map((amt, i) => (
                <button key={i} onClick={() => setStakeIdx(i)} style={{
                  padding: '7px 4px', borderRadius: 8,
                  background: stakeIdx === i ? 'var(--accent)' : '#111',
                  border: `1px solid ${stakeIdx === i ? 'var(--accent)' : '#1e1e1e'}`,
                  color: stakeIdx === i ? '#000' : '#555',
                  fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                  {currency === 'cCOP' ? `$${amt.toLocaleString()}` : `${amt}`}
                </button>
              ))}
            </div>

            {/* Payout preview */}
            <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
              <p style={{ fontSize: 9, color: '#2a2a2a', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px', marginBottom: 6 }}>PAYOUT PREVIEW ({mockPool.players + 1} PLAYERS)</p>
              {[1, 2, 3].map(rank => {
                const payout = payouts[rank - 1] ?? 0;
                const diff = payout - stakeAmount;
                return (
                  <div key={rank} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: rank === 1 ? 'var(--accent)' : rank === 2 ? '#888' : '#555', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>#{rank}</span>
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#fff' }}>{formatAmount(payout, currency)}</span>
                    <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: diff >= 0 ? '#22c55e' : '#ef4444' }}>
                      {diff >= 0 ? '+' : ''}{formatAmount(Math.abs(diff), currency)}
                    </span>
                  </div>
                );
              })}
              <div style={{ fontSize: 9, color: '#222', fontFamily: 'var(--font-mono)', marginTop: 6 }}>Rank {Math.ceil((mockPool.players + 1) * 0.6) + 1}+ → no payout</div>
            </div>

            <button className="btn-primary" onClick={() => onPlay('stake', currency, stakeAmount)} style={{ fontSize: 13, padding: '12px', borderRadius: 10, letterSpacing: '0.5px' }}>
              {t.home.confirm} · {formatAmount(stakeAmount, currency)}
            </button>
          </div>
        )}

        <div style={{ height: 8 }} />
      </div>

      {/* ── Fixed bottom CTAs ── */}
      <div style={{ padding: '10px 18px 18px', flexShrink: 0, borderTop: '1px solid #0f0f0f', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>
            {error}
          </div>
        )}
        <button className="btn-primary" onClick={() => onPlay('free')} style={{ fontSize: 15 }}>
          {t.home.playFree}
        </button>
        {!showStake ? (
          <button className="btn-secondary" onClick={() => connected ? setShowStake(true) : connect()} style={{ fontSize: 14 }}>
            {connected ? t.home.stake : t.home.connectWallet}
          </button>
        ) : (
          <button className="btn-secondary" onClick={() => setShowStake(false)} style={{ fontSize: 13, color: '#555' }}>
            ✕ CANCEL STAKE
          </button>
        )}
        <button onClick={onLeaderboard} style={{ background: 'none', border: 'none', color: '#2a2a2a', fontSize: 11, fontFamily: 'var(--font-mono)', cursor: 'pointer', letterSpacing: '0.5px', padding: '2px 0' }}>
          {t.home.leaderboard}
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{ background: '#090909', border: '1px solid #161616', borderRadius: 10, padding: '9px 6px', textAlign: 'center' }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: accent ? 'var(--accent)' : '#fff', lineHeight: 1 }}>
        {value}{sub && <span style={{ fontSize: 8, fontWeight: 600 }}>{sub}</span>}
      </div>
      <div style={{ fontSize: 8, color: '#2a2a2a', marginTop: 4, fontFamily: 'var(--font-mono)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}
