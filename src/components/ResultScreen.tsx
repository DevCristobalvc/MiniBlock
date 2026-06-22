import { useEffect, useState } from 'react';
import { randomBlockHash } from '../utils/hashGen';
import { useLanguage } from '../context/LanguageContext';
import { calcPayouts, formatAmount, type Currency } from '../utils/prizes';

interface Props {
  score: number;
  perfectCount: number;
  mode: 'free' | 'stake';
  currency: Currency;
  stake: number;
  onPlayAgain: () => void;
  onHome: () => void;
  onLeaderboard: () => void;
}

export default function ResultScreen({ score, perfectCount, mode, currency, stake, onPlayAgain, onHome, onLeaderboard }: Props) {
  const { t } = useLanguage();
  const [txHash] = useState(randomBlockHash());
  const [displayHash, setDisplayHash] = useState(randomBlockHash());
  const [hashFinal, setHashFinal] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    let count = 0;
    const timer = setInterval(() => {
      setDisplayHash(randomBlockHash());
      count++;
      if (count > 20) { clearInterval(timer); setDisplayHash(txHash); setHashFinal(true); }
    }, 55);
    const r = setTimeout(() => setRevealed(true), 250);
    return () => { clearInterval(timer); clearTimeout(r); };
  }, [txHash]);

  const blocks = Math.max(1, Math.floor(score / 10));
  const grade = score >= 250 ? 'S' : score >= 150 ? 'A' : score >= 80 ? 'B' : 'C';
  const gradeColor = grade === 'S' ? '#fcff52' : grade === 'A' ? '#22c55e' : grade === 'B' ? '#60a5fa' : '#555';

  // Mock: assume you finished rank 1 in a pool of 8 players
  const mockPlayers = 8;
  const mockRank = Math.max(1, Math.min(mockPlayers, Math.ceil((1 - score / 400) * mockPlayers)));
  const payouts = calcPayouts(mockPlayers, stake);
  const myPayout = payouts[mockRank - 1] ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 18px', paddingTop: '48px', paddingBottom: '32px', animation: 'fadeUp 0.35s ease both' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div className="badge">{t.result.confirmed}</div>
        <div className={`badge ${hashFinal ? 'badge-green' : ''}`}>{hashFinal ? t.result.validated : t.result.computing}</div>
      </div>

      {/* Grade */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{
          fontSize: 80, fontWeight: 900, letterSpacing: '-3px', lineHeight: 1,
          color: gradeColor, textShadow: `0 0 40px ${gradeColor}44`,
          opacity: revealed ? 1 : 0, transform: revealed ? 'scale(1)' : 'scale(0.8)',
          transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          {grade}
        </div>
        <div style={{ fontSize: 10, color: '#333', fontFamily: 'var(--font-mono)', marginTop: 3, letterSpacing: '0.5px' }}>{t.result.grade}</div>
      </div>

      {/* Stats */}
      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 14, padding: '12px 14px', marginBottom: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Stat label={t.result.xpEarned} value={`+${score}`} accent />
          <Stat label={t.result.blocks} value={blocks} />
          <Stat label={t.result.perfect} value={perfectCount} />
          <Stat label={t.result.mode} value={mode === 'stake' ? currency : 'FREE'} />
        </div>
      </div>

      {/* Stake payout preview */}
      {mode === 'stake' && (
        <div style={{ background: 'rgba(252,255,82,0.04)', border: '1px solid rgba(252,255,82,0.12)', borderRadius: 12, padding: '10px 14px', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 9, color: '#444', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>{t.result.payoutTitle} · RANK #{mockRank}</span>
            <span style={{ fontSize: 9, color: myPayout > stake ? '#22c55e' : myPayout > 0 ? '#f59e0b' : '#ef4444', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              {myPayout > stake ? '▲ PROFIT' : myPayout > 0 ? '▶ PARTIAL' : '✕ NO PAYOUT'}
            </span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: myPayout > 0 ? 'var(--accent)' : '#444' }}>
            {myPayout > 0 ? formatAmount(myPayout, currency) : '—'}
          </div>
          <div style={{ fontSize: 9, color: '#333', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{t.result.payoutNote}</div>
        </div>
      )}

      {/* TX Hash */}
      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 12, padding: '10px 12px', marginBottom: 12 }}>
        <div style={{ fontSize: 9, color: '#2a2a2a', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px', marginBottom: 6 }}>{t.result.blockHash}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: hashFinal ? '#22c55e' : 'rgba(252,255,82,0.4)', wordBreak: 'break-all', lineHeight: 1.7, transition: 'color 0.4s' }}>
          {displayHash}
        </div>
      </div>

      {perfectCount >= 3 && (
        <div style={{ textAlign: 'center', color: 'var(--accent)', fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 12, letterSpacing: '0.5px' }}>
          ★ {perfectCount} {t.result.consensus}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
        <button className="btn-primary" onClick={onPlayAgain}>{t.result.mineAgain}</button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button className="btn-secondary" onClick={onLeaderboard} style={{ fontSize: 12 }}>{t.result.leaderboard}</button>
          <button className="btn-secondary" onClick={onHome} style={{ fontSize: 12 }}>{t.result.home}</button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: '#2a2a2a', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px', marginBottom: 4, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: accent ? 'var(--accent)' : '#fff', letterSpacing: '-0.5px' }}>{value}</div>
    </div>
  );
}
