import { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import HomeScreen from './components/HomeScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import type { Currency } from './utils/prizes';

type Screen = 'home' | 'game' | 'result' | 'leaderboard';
type Mode = 'free' | 'stake';

interface GameResult { score: number; perfectCount: number; mode: Mode; currency: Currency; stake: number; }

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [mode, setMode] = useState<Mode>('free');
  const [currency, setCurrency] = useState<Currency>('cUSD');
  const [stake, setStake] = useState(0.10);
  const [result, setResult] = useState<GameResult | null>(null);
  const [gameKey, setGameKey] = useState(0);

  function startGame(m: Mode, cur: Currency = 'cUSD', s: number = 0.10) {
    setMode(m); setCurrency(cur); setStake(s);
    setGameKey(k => k + 1); setScreen('game');
  }

  function handleGameOver(score: number, perfectCount: number) {
    setResult({ score, perfectCount, mode, currency, stake });
    setScreen('result');
  }

  return (
    <LanguageProvider>
      <div className="app-shell">
        {screen === 'home' && <HomeScreen onPlay={startGame} onLeaderboard={() => setScreen('leaderboard')} />}
        {screen === 'game' && <GameScreen key={gameKey} mode={mode} onGameOver={handleGameOver} onBack={() => setScreen('home')} />}
        {screen === 'result' && result && (
          <ResultScreen
            score={result.score} perfectCount={result.perfectCount}
            mode={result.mode} currency={result.currency} stake={result.stake}
            onPlayAgain={() => { setGameKey(k => k + 1); setScreen('game'); }}
            onHome={() => { setResult(null); setScreen('home'); }}
            onLeaderboard={() => setScreen('leaderboard')}
          />
        )}
        {screen === 'leaderboard' && <LeaderboardScreen onBack={() => setScreen('home')} />}
      </div>
    </LanguageProvider>
  );
}
