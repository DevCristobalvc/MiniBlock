import { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useLanguage } from '../context/LanguageContext';
import { randomBlockHash } from '../utils/hashGen';
import { STAKE_OPTIONS, calcPayouts, formatAmount, type Currency } from '../utils/prizes';

interface Props {
  onPlay: (mode: 'free' | 'stake', currency?: Currency, stake?: number) => void;
  onLeaderboard: () => void;
}

export default function HomeScreen({ onPlay, onLeaderboard }: Props) {
  const { shortAddress, connected, connecting, error, isMiniPay, connect } = useWallet();
  const { lang, t, setLang } = useLanguage();
  const [tickHash, setTickHash] = useState(randomBlockHash());
  const [blockHeight] = useState(() => 4_200_000 + Math.floor(Math.random() * 9999));

  const [currency, setCurrency] = useState<Currency>('cUSD');
  const [stakeIdx, setStakeIdx] = useState(0);
  const [showStake, setShowStake] = useState(false);
  const stakeAmount = STAKE_OPTIONS[currency][stakeIdx];
  const [mockPool] = useState(() => ({
    players: 7 + Math.floor(Math.random() * 14),
    total: parseFloat((1.2 + Math.random() * 4).toFixed(2)),
  }));

  useEffect(() => {
    const t = setInterval(() => setTickHash(randomBlockHash()), 2000);
    return () => clearInterval(t);
  }, []);

  const payouts = calcPayouts(mockPool.players + 1, stakeAmount);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', animation: 'fadeUp 0.3s ease both' }}>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', flexShrink: 0 }}>
        <div className="badge">
          <span style={{ color: '#22c55e', fontSize: 7 }}>●</span>
          CELO · #{blockHeight.toLocaleString()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Lang toggle */}
          <div style={{ display: 'flex', background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: 8, overflow: 'hidden' }}>
            {(['en', 'es'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                background: lang === l ? '#1e1e1e' : 'transparent',
                color: lang === l ? '#fff' : '#333',
                border: 'none', padding: '4px 10px', fontSize: 10,
                fontFamily: 'var(--font-mono)', fontWeight: lang === l ? 700 : 400,
                cursor: 'pointer', textTransform: 'uppercase',
              }}>{l}</button>
            ))}
          </div>
          {connected
            ? <div className="badge badge-green">⬡ {shortAddress}</div>
            : <button onClick={connect} disabled={connecting || isMiniPay} style={{
                background: 'none', border: '1px solid #2a2a2a', borderRadius: 8,
                color: '#555', fontSize: 10, fontFamily: 'var(--font-mono)',
                padding: '5px 12px', cursor: 'pointer', letterSpacing: '0.5px',
              }}>
                {connecting ? t.home.connecting : t.home.connectWallet}
              </button>
          }
        </div>
      </div>

      {/* ── Scrollable middle (no scrollbar shown) ── */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', paddingTop: 8, paddingBottom: 4 }}>
          <img src="/icon.png" alt="" style={{ width: 52, height: 52, marginBottom: 10, imageRendering: 'pixelated' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-2px', color: '#fff', lineHeight: 1, margin: 0 }}>
            MINI<span style={{ color: 'var(--accent)' }}>BLOCK</span>
          </h1>
          <p style={{ color: '#383838', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.8px', marginTop: 5 }}>
            {t.home.tagline}
          </p>
        </div>

        {/* Live hash ticker */}
        <div style={{
          background: '#080808', border: '1px solid #161616', borderRadius: 8,
          padding: '6px 10px', fontFamily: 'var(--font-mono)', fontSize: 9,
          color: 'rgba(252,255,82,0.25)', overflow: 'hidden', whiteSpace: 'nowrap',
          textOverflow: 'ellipsis', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0,
        }}>
          <span style={{ color: '#1e1e1e', flexShrink: 0 }}>{t.home.latestHash}</span>
          <span>{tickHash}</span>
        </div>

        {/* PoS card */}
        <div style={{ background: '#080808', border: '1px solid rgba(252,255,82,0.1)', borderRadius: 12, padding: '11px 13px' }}>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.5px', marginBottom: 6 }}>
            ⬡ {t.home.posTitle}
          </div>
          <p style={{ fontSize: 12, color: '#4a4a4a', lineHeight: 1.5, margin: 0 }}>{t.home.posDesc}</p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          <StatCard label={t.home.freePlays} value="∞" />
          <StatCard label={t.home.entry} value="0.10+" sub=" cUSD" accent />
          <StatCard label={`${mockPool.players} PLAYERS`} value={mockPool.total.toFixed(2)} sub=" c$" />
        </div>

        {/* How it works */}
        <div style={{ background: '#080808', border: '1px solid #161616', borderRadius: 10, padding: '10px 12px' }}>
          <p style={{ fontSize: 9, color: '#252525', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px', marginBottom: 8, textTransform: 'uppercase' }}>
            {t.home.howTitle}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {t.home.how.map(([n, text]) => (
              <div key={n} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 700, flexShrink: 0, paddingTop: 1 }}>{n}</span>
                <span style={{ fontSize: 11, color: '#4a4a4a', lineHeight: 1.4 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stake panel — toggled */}
        {showStake && (
          <div style={{ background: '#080808', border: '1px solid #1e1e1e', borderRadius: 12, padding: '12px 13px', animation: 'fadeUp 0.2s ease both' }}>
            <p style={{ fontSize: 9, color: '#333', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px', marginBottom: 8, textTransform: 'uppercase' }}>{t.home.stakeWith}</p>

            <div style={{ display: 'flex', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 8, padding: 3, marginBottom: 10 }}>
              {(['cUSD', 'cCOP'] as Currency[]).map(c => (
                <button key={c} onClick={() => { setCurrency(c); setStakeIdx(0); }} style={{
                  flex: 1, padding: '5px 0', borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: currency === c ? '#1e1e1e' : 'transparent',
                  color: currency === c ? '#fff' : '#333',
                  fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', transition: 'all 0.15s',
                }}>{c}</button>
              ))}
            </div>

            <p style={{ fontSize: 9, color: '#2a2a2a', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px', marginBottom: 6, textTransform: 'uppercase' }}>{t.home.stakeAmount}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5, marginBottom: 10 }}>
              {STAKE_OPTIONS[currency].map((amt, i) => (
                <button key={i} onClick={() => setStakeIdx(i)} style={{
                  padding: '6px 4px', borderRadius: 7,
                  background: stakeIdx === i ? 'var(--accent)' : '#0d0d0d',
                  border: `1px solid ${stakeIdx === i ? 'var(--accent)' : '#1e1e1e'}`,
                  color: stakeIdx === i ? '#000' : '#444',
                  fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', cursor: 'pointer',
                }}>
                  {currency === 'cCOP' ? `$${amt.toLocaleString()}` : `${amt}`}
                </button>
              ))}
            </div>

            {/* Payout preview */}
            <div style={{ background: '#0a0a0a', border: '1px solid #181818', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
              <p style={{ fontSize: 9, color: '#252525', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px', marginBottom: 6 }}>
                PAYOUT PREVIEW · {mockPool.players + 1} PLAYERS
              </p>
              {[1, 2, 3].map(rank => {
                const payout = payouts[rank - 1] ?? 0;
                const diff = payout - stakeAmount;
                return (
                  <div key={rank} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: rank === 1 ? 'var(--accent)' : rank === 2 ? '#666' : '#444', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>#{rank}</span>
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#888' }}>{formatAmount(payout, currency)}</span>
                    <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: diff >= 0 ? '#22c55e' : '#ef4444' }}>
                      {diff >= 0 ? '+' : ''}{formatAmount(Math.abs(diff), currency)}
                    </span>
                  </div>
                );
              })}
              <p style={{ fontSize: 9, color: '#1e1e1e', fontFamily: 'var(--font-mono)', marginTop: 5 }}>
                Rank {Math.ceil((mockPool.players + 1) * 0.6) + 1}+ → no payout
              </p>
            </div>

            <button className="btn-primary" onClick={() => onPlay('stake', currency, stakeAmount)} style={{ fontSize: 13, padding: '11px', borderRadius: 10, letterSpacing: '0.5px' }}>
              {t.home.confirm} · {formatAmount(stakeAmount, currency)}
            </button>
          </div>
        )}

        <div style={{ height: 4 }} />
      </div>

      {/* ── Bottom CTAs — always visible ── */}
      <div style={{ padding: '10px 18px 16px', flexShrink: 0, borderTop: '1px solid #0d0d0d', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '7px 11px', fontSize: 11, color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>
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
          <button className="btn-secondary" onClick={() => setShowStake(false)} style={{ fontSize: 13, color: '#555', borderColor: '#1e1e1e' }}>
            ✕ CANCEL
          </button>
        )}

        <button onClick={onLeaderboard} style={{ background: 'none', border: 'none', color: '#282828', fontSize: 11, fontFamily: 'var(--font-mono)', cursor: 'pointer', letterSpacing: '0.5px', padding: '2px 0' }}>
          {t.home.leaderboard}
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{ background: '#080808', border: '1px solid #161616', borderRadius: 10, padding: '9px 6px', textAlign: 'center' }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: accent ? 'var(--accent)' : '#fff', lineHeight: 1 }}>
        {value}{sub && <span style={{ fontSize: 8, fontWeight: 600 }}>{sub}</span>}
      </div>
      <div style={{ fontSize: 8, color: '#252525', marginTop: 4, fontFamily: 'var(--font-mono)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}
