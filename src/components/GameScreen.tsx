import { useEffect, useRef, useCallback, useState } from 'react';
import { randomBlockHash } from '../utils/hashGen';
import { useLanguage } from '../context/LanguageContext';

const BLOCK_H = 36;
const INITIAL_W = 200;
const CANVAS_W = 360;
const CANVAS_H = 520;
const GROUND_Y = CANVAS_H - 48;
const SPEED_BASE = 1.8;
const SPEED_INC = 0.14;
const SPEED_MAX = 10;
const HASH_MS = 55;
const PERFECT_TOL = 6;
const BLOCK_COLORS = ['#161616', '#141414', '#181818', '#131313', '#1a1a1a'];

interface PlacedBlock {
  x: number; y: number; w: number;
  blockNum: number; hash: string;
  perfect: boolean; color: string;
}

interface Props {
  mode: 'free' | 'stake';
  onGameOver: (score: number, perfectCount: number) => void;
  onBack: () => void;
}

export default function GameScreen({ mode, onGameOver, onBack }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dpr = useRef(1);

  const blocks = useRef<PlacedBlock[]>([]);
  const movX = useRef(0);
  const movDir = useRef<1 | -1>(1);
  const movSpeed = useRef(SPEED_BASE);
  const liveHash = useRef(randomBlockHash());
  const alive = useRef(true);
  const rafId = useRef(0);
  const hashTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const blockCount = useRef(0);

  const { t } = useLanguage();
  // Speed oscillation: base speed + sine wave to feel alive
  const speedPhase = useRef(Math.random() * Math.PI * 2);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);
  const [pendingHash, setPendingHash] = useState('0x' + '—'.repeat(16));
  const fbTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const perfectCountRef = useRef(0);

  const flash = useCallback((text: string, color: string) => {
    setFeedback({ text, color });
    if (fbTimer.current) clearTimeout(fbTimer.current);
    fbTimer.current = setTimeout(() => setFeedback(null), 900);
  }, []);

  // ── draw ──────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const d = dpr.current;

    ctx.clearRect(0, 0, CANVAS_W * d, CANVAS_H * d);

    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.022)';
    ctx.lineWidth = 1;
    const gs = 40 * d;
    for (let x = 0; x < CANVAS_W * d; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H * d); ctx.stroke(); }
    for (let y = 0; y < CANVAS_H * d; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W * d, y); ctx.stroke(); }

    ctx.save();
    ctx.scale(d, d);

    // placed blocks
    blocks.current.forEach((b) => {
      if (b.perfect) { ctx.save(); ctx.shadowColor = '#fcff52'; ctx.shadowBlur = 16; }

      ctx.fillStyle = b.perfect ? '#fcff52' : b.color;
      rr(ctx, b.x, b.y, b.w, BLOCK_H, 5);
      ctx.fill();

      ctx.strokeStyle = b.perfect ? 'rgba(252,255,82,0.45)' : 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      rr(ctx, b.x, b.y, b.w, BLOCK_H, 5);
      ctx.stroke();
      if (b.perfect) ctx.restore();

      if (b.w > 50) {
        ctx.fillStyle = b.perfect ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.4)';
        ctx.font = `bold 8px 'JetBrains Mono',monospace`;
        ctx.textAlign = 'left';
        ctx.fillText(`#${b.blockNum}`, b.x + 7, b.y + 13);
      }
      if (b.w > 80) {
        ctx.fillStyle = b.perfect ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.1)';
        ctx.font = `6px 'JetBrains Mono',monospace`;
        const maxChars = Math.floor((b.w - 14) / 5.2);
        ctx.fillText(b.hash.slice(0, maxChars), b.x + 7, b.y + 26);
      }
    });

    // moving block — no label, just hash animation
    if (alive.current) {
      const top = blocks.current[blocks.current.length - 1];
      const mw = top.w;
      const my = top.y - BLOCK_H - 3;
      const mx = movX.current;

      ctx.fillStyle = '#0d0d0d';
      rr(ctx, mx, my, mw, BLOCK_H, 5);
      ctx.fill();

      // animated hash text (clipped)
      if (mw > 40) {
        ctx.save();
        ctx.beginPath(); rr(ctx, mx, my, mw, BLOCK_H, 5); ctx.clip();
        ctx.fillStyle = 'rgba(252,255,82,0.2)';
        ctx.font = `6px 'JetBrains Mono',monospace`;
        ctx.textAlign = 'left';
        const h = liveHash.current;
        const chars = Math.floor((mw - 10) / 5.2);
        ctx.fillText(h.slice(2, 2 + chars), mx + 5, my + 13);
        if (mw > 80) ctx.fillText(h.slice(34, 34 + chars), mx + 5, my + 24);
        ctx.restore();
      }

      // pulsing border
      const pulse = 0.4 + 0.28 * Math.sin(Date.now() / 200);
      ctx.strokeStyle = `rgba(252,255,82,${pulse})`;
      ctx.lineWidth = 1.5;
      rr(ctx, mx, my, mw, BLOCK_H, 5);
      ctx.stroke();
    }

    ctx.restore();
  }, []);

  // ── loop ──────────────────────────────────────────────────────────────────
  const loop = useCallback(() => {
    if (!alive.current) return;
    const top = blocks.current[blocks.current.length - 1];
    // Oscillate speed ±15% around the target to feel organic
    speedPhase.current += 0.025;
    const oscillation = 1 + 0.15 * Math.sin(speedPhase.current);
    movX.current += movDir.current * movSpeed.current * oscillation;
    if (movX.current + top.w > CANVAS_W + 12) movDir.current = -1;
    if (movX.current < -12) movDir.current = 1;
    draw();
    rafId.current = requestAnimationFrame(loop);
  }, [draw]);

  // ── place ─────────────────────────────────────────────────────────────────
  const place = useCallback(() => {
    if (!alive.current) return;
    const top = blocks.current[blocks.current.length - 1];
    const mw = top.w;
    const mx = movX.current;

    const oL = Math.max(mx, top.x);
    const oR = Math.min(mx + mw, top.x + top.w);
    const overlap = oR - oL;

    if (overlap <= 2) {
      alive.current = false;
      cancelAnimationFrame(rafId.current);
      if (hashTimer.current) clearInterval(hashTimer.current);
      setPendingHash(liveHash.current); // freeze hash on game over
      draw();
      setTimeout(() => onGameOver(scoreRef.current, perfectCountRef.current), 500);
      return;
    }

    const isPerfect = Math.abs(mx - top.x) <= PERFECT_TOL;
    const newX = isPerfect ? top.x : oL;
    const newW = isPerfect ? top.w : overlap;
    const newY = top.y - BLOCK_H - 3;
    blockCount.current++;

    blocks.current.push({
      x: newX, y: newY, w: newW,
      blockNum: blockCount.current,
      hash: randomBlockHash(),
      perfect: isPerfect,
      color: BLOCK_COLORS[blockCount.current % BLOCK_COLORS.length],
    });

    if (newY < CANVAS_H * 0.32) {
      const shift = CANVAS_H * 0.32 - newY;
      blocks.current.forEach(b => { b.y += shift; });
    }

    let pts: number;
    if (isPerfect) {
      streakRef.current++;
      perfectCountRef.current++;
      const mult = streakRef.current >= 3 ? 2 : 1;
      pts = 25 * mult;
      if (streakRef.current >= 3) flash(`${streakRef.current}${t.game.chain}`, '#fcff52');
      else flash(t.game.perfect, '#fcff52');
      setStreak(streakRef.current);
    } else {
      streakRef.current = 0;
      pts = 10;
      flash(t.game.plusXp, '#22c55e');
      setStreak(0);
    }
    scoreRef.current += pts;
    setScore(scoreRef.current);

    const side: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
    movDir.current = side;
    movX.current = side === 1 ? -newW - 10 : CANVAS_W + 10;
    // Speed: grows with block count, random burst every ~5 blocks, plus jitter
    const baseProgress = SPEED_BASE + blockCount.current * SPEED_INC;
    const burst = blockCount.current % 5 === 0 ? 0.6 + Math.random() * 0.8 : 0;
    const jitter = (Math.random() - 0.5) * 1.0;
    movSpeed.current = Math.min(baseProgress + burst + jitter, SPEED_MAX);
    // Reset oscillation phase on each new block for variety
    speedPhase.current = Math.random() * Math.PI * 2;
  }, [draw, flash, onGameOver]);

  // ── init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    dpr.current = window.devicePixelRatio || 1;
    const d = dpr.current;
    canvas.width = CANVAS_W * d;
    canvas.height = CANVAS_H * d;
    canvas.style.width = `${CANVAS_W}px`;
    canvas.style.height = `${CANVAS_H}px`;

    const gx = (CANVAS_W - INITIAL_W) / 2;
    blocks.current = [{ x: gx, y: GROUND_Y - BLOCK_H, w: INITIAL_W, blockNum: 0, hash: randomBlockHash(), perfect: true, color: '#fcff52' }];
    blockCount.current = 0;
    const s: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
    movDir.current = s;
    movX.current = s === 1 ? -INITIAL_W - 10 : CANVAS_W + 10;
    movSpeed.current = SPEED_BASE;
    scoreRef.current = 0; streakRef.current = 0; perfectCountRef.current = 0;
    alive.current = true;

    rafId.current = requestAnimationFrame(loop);
    hashTimer.current = setInterval(() => {
      liveHash.current = randomBlockHash();
      setPendingHash(liveHash.current);
    }, HASH_MS);

    return () => {
      alive.current = false;
      cancelAnimationFrame(rafId.current);
      if (hashTimer.current) clearInterval(hashTimer.current);
      if (fbTimer.current) clearTimeout(fbTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', userSelect: 'none', WebkitUserSelect: 'none', padding: '10px 14px 12px' }}>

      {/* HUD top */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexShrink: 0 }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: 8, color: '#555', padding: '5px 11px', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}
        >
          {t.game.quit}
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-1px' }}>{score}</div>
          <div style={{ fontSize: 9, color: '#444', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>{t.game.xp}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
          <span className={`badge ${mode === 'stake' ? 'badge-accent' : ''}`}>{mode === 'stake' ? t.game.stake : t.game.free}</span>
          {streak >= 3 && <span className="badge badge-accent" style={{ fontSize: 9 }}>{t.game.multi2}</span>}
        </div>
      </div>

      {/* Game frame */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        border: '1px solid #1e1e1e', borderRadius: 14, overflow: 'hidden',
        background: '#0a0a0a', position: 'relative', minHeight: 0,
      }}>
        {/* Frame header — terminal bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '7px 12px', borderBottom: '1px solid #181818', flexShrink: 0,
          background: '#0d0d0d',
        }}>
          <div style={{ display: 'flex', gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
          </div>

          {/* PENDING badge — fixed top center */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(252,255,82,0.08)', border: '1px solid rgba(252,255,82,0.2)',
            borderRadius: 6, padding: '3px 10px',
          }}>
            <span style={{
              display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
              background: '#fcff52', boxShadow: '0 0 6px #fcff52',
              animation: 'pulse-accent 1s infinite',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'rgba(252,255,82,0.7)', letterSpacing: '0.5px', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {pendingHash.slice(0, 22)}…
            </span>
          </div>

          <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: '#2a2a2a', letterSpacing: '0.5px' }}>
            :8545
          </span>
        </div>

        {/* Canvas */}
        <div style={{ position: 'relative', flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
          <canvas ref={canvasRef} style={{ display: 'block', maxWidth: '100%', maxHeight: '100%' }} />

          {feedback && (
            <div style={{
              position: 'absolute', top: '20%', left: '50%',
              transform: 'translate(-50%, -50%)',
              color: feedback.color, fontSize: 17, fontWeight: 900,
              fontFamily: 'var(--font-mono)', letterSpacing: '1px',
              textShadow: `0 0 22px ${feedback.color}`,
              pointerEvents: 'none', animation: 'fadeUp 0.25s ease both', whiteSpace: 'nowrap',
            }}>
              {feedback.text}
            </div>
          )}
        </div>

        {/* Validate button */}
        <div style={{ padding: '8px 12px 12px', flexShrink: 0, background: '#0d0d0d', borderTop: '1px solid #181818' }}>
          <button
            className="btn-primary"
            onClick={place}
            style={{ borderRadius: 10, fontSize: 14, padding: '12px 24px', letterSpacing: '1px' }}
          >
            {t.game.validate}
          </button>
        </div>
      </div>
    </div>
  );
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
