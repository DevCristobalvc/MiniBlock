import { useState } from 'react';
import { formatHash } from '../utils/hashGen';
import { useLanguage } from '../context/LanguageContext';

type Period = 'daily' | 'weekly' | 'all';

// Mock data until contract is wired
const MOCK: Record<Period, { address: string; score: number; blocks: number; perfect: number }[]> = {
  daily: [
    { address: '0xf3a1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0', score: 340, blocks: 34, perfect: 12 },
    { address: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', score: 275, blocks: 27, perfect: 8 },
    { address: '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1', score: 210, blocks: 21, perfect: 5 },
    { address: '0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2', score: 180, blocks: 18, perfect: 3 },
    { address: '0xd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3', score: 130, blocks: 13, perfect: 1 },
  ],
  weekly: [
    { address: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', score: 1820, blocks: 182, perfect: 54 },
    { address: '0xf3a1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0', score: 1540, blocks: 154, perfect: 41 },
    { address: '0xe5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4', score: 1210, blocks: 121, perfect: 28 },
    { address: '0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2', score: 990, blocks: 99, perfect: 19 },
    { address: '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1', score: 760, blocks: 76, perfect: 11 },
  ],
  all: [
    { address: '0xf3a1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0', score: 8400, blocks: 840, perfect: 260 },
    { address: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', score: 7200, blocks: 720, perfect: 210 },
    { address: '0xe5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4', score: 6100, blocks: 610, perfect: 180 },
    { address: '0xd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3', score: 5300, blocks: 530, perfect: 140 },
    { address: '0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2', score: 4100, blocks: 410, perfect: 95 },
  ],
};

const MEDALS = ['🥇', '🥈', '🥉'];
const PRIZE_SHARE = ['60%', '30%', '10%'];

interface Props {
  onBack: () => void;
}

export default function LeaderboardScreen({ onBack }: Props) {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<Period>('daily');
  const rows = MOCK[period];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      padding: '0 20px', paddingTop: '52px', paddingBottom: '36px',
      animation: 'fadeUp 0.35s ease both',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: 8, color: '#555', padding: '6px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>←</button>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.5px', margin: 0 }}>{t.leaderboard.title}</h2>
          <p style={{ fontSize: 10, color: '#444', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px', margin: 0, marginTop: 2 }}>{t.leaderboard.subtitle}</p>
        </div>
      </div>

      {/* Period toggle */}
      <div style={{ display: 'flex', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 10, padding: 3, marginBottom: 20, flexShrink: 0 }}>
        {([['daily', t.leaderboard.daily], ['weekly', t.leaderboard.weekly], ['all', t.leaderboard.all]] as [Period, string][]).map(([p, label]) => (
          <button key={p} onClick={() => setPeriod(p)} style={{
            flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: period === p ? '#1e1e1e' : 'transparent',
            color: period === p ? '#fff' : '#444',
            fontSize: 11, fontWeight: period === p ? 700 : 500,
            fontFamily: 'var(--font-mono)', letterSpacing: '0.5px',
            transition: 'all 0.15s',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Prize pool (daily only) */}
      {period === 'daily' && (
        <div style={{
          background: 'rgba(252,255,82,0.05)', border: '1px solid rgba(252,255,82,0.15)',
          borderRadius: 12, padding: '12px 16px', marginBottom: 16, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px', marginBottom: 4 }}>{t.leaderboard.prizePool}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.5px' }}>4.75 cUSD</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {PRIZE_SHARE.map((s, i) => (
                <div key={i} style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
                  {MEDALS[i]} {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rows */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map((row, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: i < 3 ? 'rgba(252,255,82,0.04)' : '#0d0d0d',
            border: `1px solid ${i < 3 ? 'rgba(252,255,82,0.12)' : '#1a1a1a'}`,
            borderRadius: 12, padding: '12px 14px',
          }}>
            <div style={{ fontSize: i < 3 ? 18 : 13, width: 28, textAlign: 'center', flexShrink: 0, color: i >= 3 ? '#333' : undefined, fontFamily: i >= 3 ? 'var(--font-mono)' : undefined, fontWeight: 700 }}>
              {i < 3 ? MEDALS[i] : `#${i + 1}`}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {formatHash(row.address)}
              </div>
              <div style={{ fontSize: 10, color: '#333', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                {row.blocks} {t.leaderboard.blocks} · {row.perfect} {t.leaderboard.perfect}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: i < 3 ? 'var(--accent)' : '#fff' }}>{row.score.toLocaleString()}</div>
              <div style={{ fontSize: 9, color: '#333', fontFamily: 'var(--font-mono)' }}>{t.leaderboard.xp}</div>
            </div>
          </div>
        ))}
      </div>

      <p style={{ textAlign: 'center', fontSize: 10, color: '#222', fontFamily: 'var(--font-mono)', marginTop: 16, flexShrink: 0 }}>
        {t.leaderboard.onChain}
      </p>
    </div>
  );
}
