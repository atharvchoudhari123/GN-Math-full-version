/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Award, RotateCcw, Volume2, VolumeX, Sparkles, ChevronLeft, ChevronRight, Zap, Target, HelpCircle } from 'lucide-react';

// Play sound synthesizer function using Web Audio API
export function playSound(type: 'jump' | 'score' | 'gameover' | 'click', isMuted: boolean = false) {
  if (isMuted) return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'jump') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'score') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'gameover') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    }
  } catch (e) {
    // Ignore audio restrictions
  }
}

// ==========================================
// 1. SLOPE 3D RETRO CANVAS
// ==========================================
interface Slope3DProps {
  onBack: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

export function Slope3D({ onBack, isMuted, toggleMute }: Slope3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('slope_high_score') || '0', 10);
  });
  const [gameOver, setGameOver] = useState(false);

  // Keyboard controls
  const keys = useRef<{ [key: string]: boolean }>({});
  
  // Game state held in refs for the fast animation loop
  const gameStateRef = useRef({
    ballX: 0, // Left-Right position (-120 to 120)
    ballY: 15, // Hover height
    ballZ: 0, // Distance traveled
    ballSpeed: 6.0,
    ballTargetX: 0,
    cameraZ: -50,
    score: 0,
    platformColors: ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'],
    platforms: [] as Array<{
      width: number;
      length: number;
      x: number;
      y: number;
      z: number;
      color: string;
      obstacles: Array<{ x: number; z: number; size: number }>;
    }>,
  });

  // Track key presses
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
      if (['ArrowLeft', 'ArrowRight', 'a', 'd', ' '].includes(e.key)) {
        e.preventDefault(); // Stop page scrolling
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const generatePlatform = (z: number, colorIndex: number) => {
    const width = 120;
    const length = 400;
    const x = Math.sin(z / 1500) * 80;
    const color = gameStateRef.current.platformColors[colorIndex % gameStateRef.current.platformColors.length];
    
    // Procedurally place obstacles
    const obstacles: Array<{ x: number; z: number; size: number }> = [];
    if (z > 400) {
      // Place 1 to 3 obstacles depending on speed/stages
      const count = Math.min(3, Math.floor(z / 1200) + 1);
      for (let i = 0; i < count; i++) {
        obstacles.push({
          x: (Math.random() - 0.5) * 80,
          z: z + 80 + Math.random() * (length - 120),
          size: 14 + Math.random() * 8,
        });
      }
    }

    return { width, length, x, y: 0, z, color, obstacles };
  };

  const initGame = () => {
    const state = gameStateRef.current;
    state.ballX = 0;
    state.ballZ = 0;
    state.ballSpeed = 6.0;
    state.score = 0;
    setScore(0);
    setGameOver(false);

    // Initial sequence of platforms
    state.platforms = [];
    for (let i = 0; i < 5; i++) {
      state.platforms.push(generatePlatform(i * 400, i));
    }
    
    setIsPlaying(true);
    playSound('click', isMuted);
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      const state = gameStateRef.current;

      // Update ball metrics
      let dir = 0;
      if (keys.current['ArrowLeft'] || keys.current['a'] || keys.current['A']) dir = -1;
      if (keys.current['ArrowRight'] || keys.current['d'] || keys.current['D']) dir = 1;

      // Accelerate / turn the ball
      state.ballX += dir * 4.5;
      
      // Speed scales slowly
      state.ballSpeed = 6.0 + state.ballZ / 1500;
      state.ballZ += state.ballSpeed;

      // Keep scoring
      const currScore = Math.floor(state.ballZ / 15);
      if (currScore > state.score) {
        state.score = currScore;
        setScore(currScore);
        if (currScore % 100 === 0 && currScore > 0) {
          playSound('score', isMuted);
        }
      }

      // Check current active platform
      const activePlatformIndex = state.platforms.findIndex(p => p.z <= state.ballZ && p.z + p.length > state.ballZ);
      let activePlatform = activePlatformIndex !== -1 ? state.platforms[activePlatformIndex] : null;

      // Fall checks
      let onPlatform = false;
      if (activePlatform) {
        // Platform coordinate offsets due to curving x
        const relativeX = state.ballX - activePlatform.x;
        if (Math.abs(relativeX) <= activePlatform.width / 2) {
          onPlatform = true;
        }
      } else {
        // Between platforms or ahead
        onPlatform = true; // Fallback so players don't immediately die during platform swaps
      }

      // Check obstacles collision on active and upcoming platforms
      state.platforms.forEach(p => {
        p.obstacles.forEach(o => {
          const distZ = Math.abs(o.z - state.ballZ);
          const distX = Math.abs(o.x - state.ballX);
          if (distZ < 10 && distX < o.size / 2 + 6) {
            // Hit obstacle!
            setGameOver(true);
            setIsPlaying(false);
            playSound('gameover', isMuted);

            if (state.score > highScore) {
              setHighScore(state.score);
              localStorage.setItem('slope_high_score', state.score.toString());
            }
          }
        });
      });

      // Maintain platform generation queue
      if (state.platforms.length > 0 && state.platforms[0].z + state.platforms[0].length < state.ballZ - 100) {
        state.platforms.shift(); // Remove passed platform
        const lastZ = state.platforms[state.platforms.length - 1].z;
        const nextZ = lastZ + 400;
        state.platforms.push(generatePlatform(nextZ, Math.floor(nextZ / 400)));
      }

      // Border bounds fall code
      if (!onPlatform) {
        setGameOver(true);
        setIsPlaying(false);
        playSound('gameover', isMuted);
        if (state.score > highScore) {
          setHighScore(state.score);
          localStorage.setItem('slope_high_score', state.score.toString());
        }
      }

      // Render 3D Perspective Canvas View
      ctx.fillStyle = '#0a0b10';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Radial neon backdrop
      const radialGrd = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 50, canvas.width / 2, canvas.height / 2, canvas.width);
      radialGrd.addColorStop(0, '#0f111a');
      radialGrd.addColorStop(1, '#050508');
      ctx.fillStyle = radialGrd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Starfield grid details
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

      // Drawing function with perspective projection transformation
      const project = (x3d: number, y3d: number, z3d: number) => {
        const camX = x3d;
        const camY = y3d - 90; // Higher camera viewing angle
        const camZ = z3d - state.ballZ + 160; // Camera offset following the ball

        if (camZ <= 10) return null; // Behind camera clipping

        const viewportScale = 300; // Focal scale
        const px = (camX * viewportScale) / camZ + canvas.width / 2;
        const py = (camY * viewportScale) / camZ + canvas.height / 2 + 50;
        const sizeScale = viewportScale / camZ;

        return { x: px, y: py, size: sizeScale };
      };

      // Draw active tracks with retro scan lines
      state.platforms.forEach(p => {
        // We draw the flat platform quad by calculating project positions for all 4 corners
        const p1 = project(p.x - p.width / 2, p.y, p.z);
        const p2 = project(p.x + p.width / 2, p.y, p.z);
        const p3 = project(p.x + p.width / 2, p.y, p.z + p.length);
        const p4 = project(p.x - p.width / 2, p.y, p.z + p.length);

        if (p1 && p2 && p3 && p4) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.lineTo(p4.x, p4.y);
          ctx.closePath();

          // Dark track surface
          ctx.fillStyle = '#0f121d';
          ctx.fill();

          // Bright neon side-borders
          ctx.lineWidth = Math.max(1, 150 / (p.z - state.ballZ + 200));
          ctx.strokeStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p4.x, p4.y);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.stroke();
          ctx.shadowBlur = 0; // reset

          // Draw grid patterns inside platform
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.lineWidth = 1;
          for (let tileZ = p.z; tileZ < p.z + p.length; tileZ += 40) {
            const lineStart = project(p.x - p.width / 2, p.y, tileZ);
            const lineEnd = project(p.x + p.width / 2, p.y, tileZ);
            if (lineStart && lineEnd) {
              ctx.beginPath();
              ctx.moveTo(lineStart.x, lineStart.y);
              ctx.lineTo(lineEnd.x, lineEnd.y);
              ctx.stroke();
            }
          }
        }

        // Draw obstacles on the current platform
        p.obstacles.forEach(o => {
          const pt = project(o.x, p.y - 12, o.z);
          if (pt) {
            const size = o.size * pt.size * 0.15;
            ctx.fillStyle = '#ef4444';
            ctx.strokeStyle = '#f87171';
            ctx.lineWidth = 2;
            
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 12;

            // Draw glowing 3D Cube shape
            ctx.fillRect(pt.x - size / 2, pt.y - size, size, size);
            ctx.strokeRect(pt.x - size / 2, pt.y - size, size, size);
            
            // Draw math sign on obstacle to make it themed!
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.max(10, size * 0.5)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('÷', pt.x, pt.y - size / 2 + 4);

            ctx.shadowBlur = 0;
          }
        });
      });

      // Draw Player Ball in 3D perspective (always stays near bottom of perspective center)
      const ballProjected = project(state.ballX, state.ballY, state.ballZ);
      if (ballProjected) {
        const radius = 14 * ballProjected.size * 0.15;

        // Draw outer ring glow
        ctx.shadowColor = '#60a5fa';
        ctx.shadowBlur = 15;
        
        const grad = ctx.createRadialGradient(
          ballProjected.x - radius * 0.3, 
          ballProjected.y - radius * 0.3, 
          radius * 0.1, 
          ballProjected.x, 
          ballProjected.y, 
          radius
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#3b82f6');
        grad.addColorStop(1, '#1e3a8a');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ballProjected.x, ballProjected.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Overlay classic math symbol x or π inside rolling ball
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = `bold ${Math.max(8, radius * 0.8)}px Courier New`;
        ctx.textAlign = 'center';
        ctx.fillText('f(x)', ballProjected.x, ballProjected.y + radius * 0.3);
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, gameOver, isMuted, highScore]);

  return (
    <div className="flex flex-col h-full bg-[#0d0e14] rounded-2xl border border-zinc-800 overflow-hidden relative" id="slope-game-container">
      {/* HUD Header */}
      <div className="flex justify-between items-center p-4 bg-zinc-950/80 border-b border-zinc-800 z-10">
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-bold tracking-wider text-sm flex items-center gap-1.5 uppercase">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
            Slope 3D Math Roll
          </span>
          <div className="text-zinc-500 text-xs hidden sm:block">A/D or Arrows to Steer</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-zinc-400 text-xs uppercase font-medium">Best:</span>
            <span className="text-amber-500 font-bold font-mono">{highScore}</span>
          </div>
          <button 
            onClick={toggleMute} 
            className="p-1 px-2 hover:bg-zinc-800 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
            id="slope-mute-btn"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={onBack} 
            className="text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded transition border border-zinc-700"
            id="slope-back"
          >
            Back
          </button>
        </div>
      </div>

      {/* Main Canvas Stage */}
      <div className="flex-1 relative flex items-center justify-center">
        <canvas 
          ref={canvasRef} 
          width={700} 
          height={420} 
          className="w-full max-w-3xl aspect-[16/10] bg-zinc-950 rounded-lg shadow-xl shadow-cyan-950/20"
        />

        {/* HUD Score Overlay Overlay */}
        {isPlaying && !gameOver && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-zinc-950/90 border border-emerald-500/30 px-6 py-2 rounded-full flex items-center gap-3 shadow-lg backdrop-blur" id="slope-hud">
            <span className="text-zinc-500 font-semibold text-xs uppercase tracking-wider">Formula Z:</span>
            <span className="text-emerald-400 font-black text-2xl font-mono">{score}</span>
          </div>
        )}

        {/* Play Overlay screen */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-[#07080e]/95 backdrop-blur-md flex flex-col justify-center items-center p-6 text-center z-10" id="slope-menu">
            {gameOver ? (
              <div className="animate-fade-in flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500 flex items-center justify-center text-red-500 mb-4 shadow-lg shadow-red-500/20">
                  <RotateCcw className="w-8 h-8 animate-spin-slow" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">System Crashed!</h2>
                <p className="text-zinc-400 text-sm mt-1 max-w-xs">You slipped off the coordinate plane or divided by zero.</p>
                <div className="mt-4 bg-zinc-900 border border-zinc-850 p-4 rounded-xl flex items-center gap-8 min-w-[240px] justify-center shadow-inner">
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wide">Final Formula Z</div>
                    <div className="text-2xl font-bold font-mono text-emerald-400">{score}</div>
                  </div>
                  <div className="border-l border-zinc-800 h-8"></div>
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wide font-medium">Record</div>
                    <div className="text-2xl font-bold font-mono text-yellow-500">{highScore}</div>
                  </div>
                </div>
                <button
                  onClick={initGame}
                  className="mt-6 flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold p-3 px-8 rounded-xl shadow-lg hover:scale-[1.03] transition duration-200 uppercase tracking-wider text-sm cursor-pointer"
                  id="slope-retry"
                >
                  <RotateCcw className="w-4 h-4" /> Recalculate
                </button>
              </div>
            ) : (
              <div className="max-w-md flex flex-col items-center">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 shadow-xl">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-cyan-400">Slope Math 3D</h1>
                <p className="text-zinc-400 mt-2 text-sm leading-relaxed">
                  Steer the equation ball down the infinite falling coordinate grid! Avoid division-by-zero red obstacles and secure the ultimate numeric value.
                </p>
                <div className="flex gap-6 mt-4 mb-6 bg-zinc-900/50 p-3 px-5 rounded-full border border-zinc-800/80">
                  <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" /> Left / Right keys to Steer
                  </div>
                  <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-400" /> Speed scales infinitely
                  </div>
                </div>
                <button
                  onClick={initGame}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-black p-4 px-10 rounded-xl shadow-xl hover:shadow-emerald-500/10 hover:scale-[1.03] active:scale-95 transition-all duration-200 uppercase tracking-widest text-sm cursor-pointer"
                  id="slope-play"
                >
                  <Play className="w-4 h-4 fill-current" /> Start Game
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2. RETRO FOOTBALL BLITZ
// ==========================================
export function RetroFootball({ onBack, isMuted, toggleMute }: Slope3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('football_high_score') || '0', 10);
  });
  const [gameOver, setGameOver] = useState(false);
  const [touchdowns, setTouchdowns] = useState(0);

  const keys = useRef<{ [key: string]: boolean }>({});
  const playerRef = useRef({
    x: 180,
    y: 350,
    width: 20,
    height: 20,
    speed: 5,
    jukeCooldown: 0,
  });

  const defendersRef = useRef<Array<{ x: number; y: number; speed: number; angle: number; currentSpeed: number }>>([]);
  const badgesRef = useRef<Array<{ x: number; y: number; type: 'star' | 'shield', spin: number }>>([]);
  const gameStats = useRef({ score: 0, touchdowns: 0, level: 1, yardage: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'w', 'a', 's', 'd', ' '].includes(e.key)) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const spawnDefender = (yOffset: number = -40) => {
    const canvas = canvasRef.current;
    const cw = canvas ? canvas.width : 400;
    return {
      x: 40 + Math.random() * (cw - 80),
      y: yOffset,
      speed: 2.0 + Math.random() * 1.5 + (gameStats.current.level * 0.2),
      angle: 0,
      currentSpeed: 2.0,
    };
  };

  const spawnBadge = () => {
    const canvas = canvasRef.current;
    const cw = canvas ? canvas.width : 400;
    return {
      x: 50 + Math.random() * (cw - 100),
      y: -40 - Math.random() * 300,
      type: Math.random() > 0.85 ? 'shield' as const : 'star' as const,
      spin: 0,
    };
  };

  const initGame = () => {
    playerRef.current.x = 180;
    playerRef.current.y = 350;
    defendersRef.current = [];
    badgesRef.current = [];
    gameStats.current.score = 0;
    gameStats.current.touchdowns = 0;
    gameStats.current.level = 1;
    gameStats.current.yardage = 0;
    
    setScore(0);
    setTouchdowns(0);
    setGameOver(false);

    // Initial spawning
    for (let i = 0; i < 4; i++) {
      defendersRef.current.push(spawnDefender(50 - i * 140));
    }
    for (let i = 0; i < 2; i++) {
      badgesRef.current.push(spawnBadge());
    }

    setIsPlaying(true);
    playSound('click', isMuted);
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const stats = gameStats.current;
      const player = playerRef.current;
      const defenders = defendersRef.current;
      const badges = badgesRef.current;

      // Update player cooldowns
      if (player.jukeCooldown > 0) player.jukeCooldown--;

      // Capture velocities
      let dx = 0;
      let dy = 0;
      if (keys.current['ArrowLeft'] || keys.current['a'] || keys.current['A']) dx = -1;
      if (keys.current['ArrowRight'] || keys.current['d'] || keys.current['D']) dx = 1;
      if (keys.current['ArrowUp'] || keys.current['w'] || keys.current['W']) dy = -1.2; // slight bias up
      if (keys.current['ArrowDown'] || keys.current['s'] || keys.current['S']) dy = 1;

      // Update Player positioning
      player.x += dx * player.speed;
      player.y += dy * player.speed;

      // Constraint bounds
      if (player.x < 30) player.x = 30;
      if (player.x > canvas.width - 30 - player.width) player.x = canvas.width - 30 - player.width;
      if (player.y > canvas.height - 40) player.y = canvas.height - 40;

      // Yardage scrolled when moving up
      stats.yardage += 0.25;
      stats.score = Math.floor(stats.yardage + stats.touchdowns * 100);
      setScore(stats.score);

      // Level difficulty scale
      stats.level = 1 + Math.floor(stats.yardage / 1200);

      // If player reaches the end-zone (y < 40)
      if (player.y < 35) {
        stats.touchdowns++;
        setTouchdowns(stats.touchdowns);
        playSound('score', isMuted);
        
        // Reset player stance
        player.y = 350;
        player.x = canvas.width / 2;
        
        // Boost up defenders
        defenders.forEach(d => {
          d.y = -50 - Math.random() * 100;
          d.speed += 0.3;
        });
      }

      // Defenders track CPU behavior
      defenders.forEach(d => {
        // Move downwards
        d.y += d.speed;

        // Pursue player x slowly
        const idealDiff = player.x - d.x;
        d.x += Math.sign(idealDiff) * (1.2 + stats.level * 0.15);

        // Reset if defender goes off screenbottom
        if (d.y > canvas.height + 20) {
          Object.assign(d, spawnDefender(-40));
        }

        // TACKLE COLLISION
        const distX = Math.abs((d.x + 8) - (player.x + player.width / 2));
        const distY = Math.abs((d.y + 8) - (player.y + player.height / 2));
        if (distX < 14 && distY < 14) {
          // Play slide/juke bypass check!
          const stateSpaceHeld = keys.current[' '];
          if (stateSpaceHeld && player.jukeCooldown === 0) {
            // Success Juke! Let's fling defender away
            player.jukeCooldown = 40;
            d.y += 180; // push back
            d.x += (Math.random() - 0.5) * 120;
            stats.yardage += 75; // Bonus yards
            playSound('jump', isMuted);
          } else {
            // Tackled!
            setGameOver(true);
            setIsPlaying(false);
            playSound('gameover', isMuted);
            if (stats.score > highScore) {
              setHighScore(stats.score);
              localStorage.setItem('football_high_score', stats.score.toString());
            }
          }
        }
      });

      // Badges mechanics (Stars / Shields)
      badges.forEach(b => {
        b.y += 3.0; // scroll down field
        b.spin += 0.1;

        if (b.y > canvas.height + 20) {
          Object.assign(b, spawnBadge());
        }

        // Player collision
        const distX = Math.abs(b.x - (player.x + 10));
        const distY = Math.abs(b.y - (player.y + 10));
        if (distX < 18 && distY < 18) {
          // Collected!
          playSound('score', isMuted);
          stats.yardage += b.type === 'shield' ? 240 : 120;
          Object.assign(b, spawnBadge());
        }
      });

      // ---------------------------------------------------
      // RENDER CANVAS STAGE
      // ---------------------------------------------------
      // Grass background with lines
      ctx.fillStyle = '#15803d'; // Rich green
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Retro Yard markers
      ctx.fillStyle = '#166534'; // slightly darker stripes
      const stripeHeight = 60;
      for (let i = 0; i < canvas.height; i += stripeHeight * 2) {
        ctx.fillRect(0, i, canvas.width, stripeHeight);
      }

      // Hash lines & numbers
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 3;
      ctx.strokeRect(30, 0, canvas.width - 60, canvas.height);

      // Side hashes
      ctx.lineWidth = 1.5;
      for (let i = 0; i < canvas.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(30, i);
        ctx.lineTo(40, i);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(canvas.width - 30, i);
        ctx.lineTo(canvas.width - 40, i);
        ctx.stroke();
      }

      // Endzone markers
      ctx.fillStyle = '#1e3a8a'; // Blue Endzone
      ctx.fillRect(30, 0, canvas.width - 60, 35);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 12px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillText('GENIZY MATH ENDZONE', canvas.width / 2, 22);

      // Draw Badges (collectable points)
      badges.forEach(b => {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.spin);
        if (b.type === 'shield') {
          ctx.fillStyle = '#f59e0b'; // Gold shield
          ctx.beginPath();
          ctx.moveTo(0, -8);
          ctx.lineTo(7, -3);
          ctx.lineTo(5, 7);
          ctx.lineTo(0, 10);
          ctx.lineTo(-5, 7);
          ctx.lineTo(-7, -3);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = '#22d3ee'; // Star item
          ctx.font = 'bold 15px Courier';
          ctx.fillText('⚡', -5, 5);
        }
        ctx.restore();
      });

      // Draw Defenders (Red Helmets)
      defenders.forEach(d => {
        ctx.fillStyle = '#dc2626'; // Helmet red
        ctx.beginPath();
        ctx.arc(d.x + 8, d.y + 8, 8, 0, Math.PI * 2);
        ctx.fill();

        // Helmet visor (Black stripe)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(d.x + 4, d.y + 5, 8, 3);
        
        // Jersey number shadow
        ctx.fillStyle = '#ffffff';
        ctx.font = '7px Arial';
        ctx.fillText('8', d.x + 6, d.y + 13);
      });

      // Draw Player Quarterback (Green/Azure Helmet)
      ctx.fillStyle = '#38bdf8'; // Blue player
      ctx.beginPath();
      ctx.arc(player.x + 10, player.y + 10, 10, 0, Math.PI * 2);
      ctx.fill();
      
      // Face shield
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(player.x + 5, player.y + 3, 10, 3);

      // Player number
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 8px Arial';
      ctx.fillText('10', player.x + 6, player.y + 13);

      // Juke effect ring
      if (player.jukeCooldown > 15) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x + 10, player.y + 10, 16, 0, Math.PI * 2);
        ctx.stroke();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, gameOver, isMuted, highScore]);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] rounded-2xl border border-zinc-800 overflow-hidden relative" id="football-container">
      {/* HUD Header */}
      <div className="flex justify-between items-center p-4 bg-zinc-950/80 border-b border-zinc-800 z-10">
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 font-bold tracking-wider text-sm flex items-center gap-1.5 uppercase">
            <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping"></span>
            Retro Football Blitz
          </span>
          <div className="text-zinc-500 text-xs hidden sm:block">Move: WASD / Arrows | Juke: Space</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-zinc-400 text-xs uppercase">High:</span>
            <span className="text-amber-500 font-bold font-mono">{highScore}</span>
          </div>
          <button 
            onClick={toggleMute} 
            className="p-1 px-2 hover:bg-zinc-800 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
            id="football-mute-btn"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={onBack} 
            className="text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded transition border border-zinc-700"
            id="football-back"
          >
            Back
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative flex items-center justify-center">
        <canvas 
          ref={canvasRef} 
          width={360} 
          height={400} 
          className="bg-green-950 rounded-lg shadow-xl shadow-cyan-950/20"
        />

        {/* Live HUD scoreboard */}
        {isPlaying && !gameOver && (
          <div className="absolute top-4 left-4 right-4 flex justify-between px-4" id="football-hud">
            <div className="bg-zinc-950/95 border border-zinc-800 px-4 py-1.5 rounded-lg text-xs font-mono font-bold text-cyan-400 shadow shadow-cyan-500/10">
              Score: {score}
            </div>
            <div className="bg-zinc-950/95 border border-zinc-800 px-4 py-1.5 rounded-lg text-xs font-mono font-bold text-amber-400 shadow shadow-amber-500/10">
              Touchdowns: {touchdowns}
            </div>
          </div>
        )}

        {/* Play Overlay screen */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-[#06070a]/95 backdrop-blur-md flex flex-col justify-center items-center p-6 text-center z-10" id="football-menu">
            {gameOver ? (
              <div className="animate-fade-in flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500 flex items-center justify-center text-red-500 mb-4 shadow-lg shadow-red-500/20">
                  <RotateCcw className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">Tackled in the field!</h2>
                <div className="mt-4 bg-zinc-900 border border-zinc-850 p-4 rounded-xl flex items-center gap-8 min-w-[240px] justify-center shadow-inner">
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wide">Yards & Blitz</div>
                    <div className="text-2xl font-bold font-mono text-cyan-400">{score}</div>
                  </div>
                  <div className="border-l border-zinc-800 h-8"></div>
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wide">TD Record</div>
                    <div className="text-2xl font-bold font-mono text-yellow-500">{touchdowns}</div>
                  </div>
                </div>
                <button
                  onClick={initGame}
                  className="mt-6 flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-black p-3 px-8 rounded-xl shadow-lg hover:scale-[1.03] transition duration-200 uppercase tracking-wider text-sm cursor-pointer"
                  id="football-retry"
                >
                  <RotateCcw className="w-4 h-4" /> Start Next Drive
                </button>
              </div>
            ) : (
              <div className="max-w-md flex flex-col items-center">
                <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4 shadow-xl">
                  <Play className="w-8 h-8 fill-current" />
                </div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400">Retro Football Blitz</h1>
                <p className="text-zinc-400 mt-2 text-sm leading-relaxed">
                  Evade red helmet defenders, run down the field stripes to reach the Endzone, collect neon star energy boosts, and score unlimited touchdowns!
                </p>
                <div className="flex flex-col gap-2 mt-4 mb-6 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80 w-full text-left max-w-xs">
                  <div className="text-xs text-zinc-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span> WASD or Arrow Keys to run
                  </div>
                  <div className="text-xs text-zinc-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span> Space key to Juke tackle (triggers cooldown)
                  </div>
                  <div className="text-xs text-zinc-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Stars yield massive scoring bonus
                  </div>
                </div>
                <button
                  onClick={initGame}
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-zinc-950 font-black p-4 px-10 rounded-xl shadow-xl hover:scale-[1.03] active:scale-95 transition-all duration-200 uppercase tracking-wider text-sm cursor-pointer"
                  id="football-start"
                >
                  Kick Off Play
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 3. QUANTUM EQUATION CLICKER
// ==========================================
export function EquationClicker({ onBack }: { onBack: () => void }) {
  const [formulas, setFormulas] = useState(0);
  const [clickValue, setClickValue] = useState(1);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; text: string }>>([]);
  const [upgrades, setUpgrades] = useState([
    { id: 1, name: 'Pocket Abacus', count: 0, cost: 15, cps: 0.1, desc: 'Increases arithmetic processing speed' },
    { id: 2, name: 'Wolfram Solver Web API', count: 0, cost: 100, cps: 1.0, desc: 'Auto-scrapes integrals and algebraic limits' },
    { id: 3, name: 'Algebra Neural Network', count: 0, cost: 1100, cps: 8.0, desc: 'Uses transformers to derive linear matrices' },
    { id: 4, name: 'Quantum CPU Solver', count: 0, cost: 12000, cps: 47.0, desc: 'Overclocks subatomic math calculations' },
    { id: 5, name: 'Gemini Math Cluster', count: 0, cost: 130000, cps: 260.0, desc: 'Harnesses a datacenter to solve grand equations' },
  ]);

  const [activeConstant, setActiveConstant] = useState({ symbol: 'π', name: 'Pi (3.14159)' });

  // Load state on mount
  useEffect(() => {
    const saved = localStorage.getItem('incremental_formulas');
    if (saved) {
      setFormulas(parseFloat(saved));
    }
  }, []);

  // Save state on frequency
  useEffect(() => {
    localStorage.setItem('incremental_formulas', formulas.toString());
  }, [formulas]);

  // Handle continuous Auto CPS ticks
  useEffect(() => {
    const totalCPS = upgrades.reduce((sum, item) => sum + item.count * item.cps, 0);
    if (totalCPS === 0) return;

    const timer = setInterval(() => {
      setFormulas(prev => prev + totalCPS / 10);
    }, 100);

    return () => clearInterval(timer);
  }, [upgrades]);

  const clickMajorConstant = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setFormulas(prev => prev + clickValue);
    
    // Add particle text
    const textArray = ['e = mc²', 'y = mx + b', 'X = [-b ± √(b² - 4ac)]/2a', 'a² + b² = c²', '∫ e^x dx', 'd/dx (sinx)'];
    const randomFormula = textArray[Math.floor(Math.random() * textArray.length)];

    const newParticle = {
      id: Date.now() + Math.random(),
      x,
      y,
      text: `+${clickValue} [${randomFormula}]`,
    };

    setParticles(prev => [...prev, newParticle]);
    playSound('click', false);

    // Timeout remove particle
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 1200);
  };

  const buyUpgrade = (id: number) => {
    const item = upgrades.find(u => u.id === id);
    if (!item || formulas < item.cost) return;

    setFormulas(prev => prev - item.cost);
    
    // Update count and cost
    setUpgrades(prev => prev.map(u => {
      if (u.id === id) {
        return {
          ...u,
          count: u.count + 1,
          cost: Math.floor(u.cost * 1.15),
        };
      }
      return u;
    }));

    // Every Professor/Solver purchased recalculates click power slightly
    if (id === 1) setClickValue(prev => prev + 1);
    if (id === 3) setClickValue(prev => prev + 5);

    playSound('score', false);
  };

  const changeConstant = () => {
    const constants = [
      { symbol: 'π', name: 'Pi (3.14159...)' },
      { symbol: 'e', name: "Euler's Constant (2.71828...)" },
      { symbol: '∞', name: 'Infinity Absolute' },
      { symbol: 'ɸ', name: 'Golden Ratio (1.618...)' },
      { symbol: 'Σ', name: 'Sigma Summation' },
    ];
    const currentIndex = constants.findIndex(c => c.symbol === activeConstant.symbol);
    const nextItem = constants[(currentIndex + 1) % constants.length];
    setActiveConstant(nextItem);
    playSound('click', false);
  };

  const getCPS = () => {
    return upgrades.reduce((sum, item) => sum + item.count * item.cps, 0);
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-zinc-950 text-white rounded-2xl border border-zinc-800 overflow-hidden" id="clicker-container">
      {/* Left side: Golden math symbol to click */}
      <div className="flex-1 p-6 flex flex-col justify-between items-center bg-[#07070b] relative border-b md:border-b-0 md:border-r border-zinc-800">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Infinity Calculus Clicker</span>
          </div>
          <button 
            onClick={onBack} 
            className="text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 hover:text-white px-3 py-1 rounded transition"
            id="clicker-back"
          >
            Back
          </button>
        </div>

        {/* Current score statistics */}
        <div className="text-center my-6 z-10" id="clicker-score-panel">
          <div className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Formulas Calculated</div>
          <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 font-mono" id="formulas-count">
            {Math.floor(formulas).toLocaleString()}
          </div>
          <div className="text-sm text-zinc-400 font-mono mt-1">
            Production: <span className="text-purple-400 font-bold">{getCPS().toFixed(1)}</span> formulas/sec
          </div>
        </div>

        {/* Giant Clickable Vector Container */}
        <div 
          onClick={clickMajorConstant}
          className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-tr from-purple-950 via-zinc-900 to-indigo-950 border-4 border-purple-500/30 flex items-center justify-center cursor-pointer select-none relative hover:border-purple-400/90 active:scale-95 transition-all duration-150 shadow-2xl shadow-purple-900/15 group"
          id="clicker-main-element"
        >
          {/* Inner ring animation inside core clicker */}
          <div className="absolute inset-2 rounded-full border border-purple-500/10 group-hover:scale-105 duration-300 transition-all border-dashed animate-spin-slow"></div>

          <span className="text-7xl md:text-8xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-purple-200 to-pink-400 drop-shadow group-hover:scale-110 transition duration-200">
            {activeConstant.symbol}
          </span>

          {/* Floating animated particles */}
          {particles.map(p => (
            <span 
              key={p.id} 
              style={{ left: p.x, top: p.y }}
              className="absolute text-xs font-mono text-purple-300 bg-zinc-950/80 border border-purple-500/20 p-1 px-2 rounded pointer-events-none animate-bounce whitespace-nowrap"
            >
              {p.text}
            </span>
          ))}
        </div>

        {/* Dynamic button to change multiplier constant */}
        <div className="text-center z-10">
          <button 
            onClick={changeConstant}
            className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-purple-300 p-2 px-4 rounded-xl transition cursor-pointer"
            id="clicker-switch"
          >
            Switch Constant: <strong className="text-white">{activeConstant.name}</strong>
          </button>
          <div className="text-[10px] text-zinc-500 mt-2 font-mono">Each professor increases click factor +{clickValue}</div>
        </div>
      </div>

      {/* Right side: Upgrades shop */}
      <div className="w-full md:w-[320px] bg-zinc-950/40 p-4 overflow-y-auto flex flex-col gap-3 min-h-[350px] md:max-h-[500px]" id="clicker-upgrades">
        <h3 className="text-xs uppercase font-bold text-zinc-400 flex items-center gap-1.5 pb-2 border-b border-zinc-805 tracking-wider font-mono">
          <Award className="w-4 h-4 text-purple-400" /> Computing upgrades & Faculty
        </h3>

        {upgrades.map(u => {
          const isAffordable = formulas >= u.cost;
          return (
            <button
              key={u.id}
              disabled={!isAffordable}
              onClick={() => buyUpgrade(u.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all flex justify-between items-center group relative cursor-pointer ${
                isAffordable 
                  ? 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 hover:border-purple-500/40 shadow' 
                  : 'bg-zinc-950/50 border-zinc-900 opacity-60'
              }`}
              id={`upgrade-item-${u.id}`}
            >
              <div className="flex-1 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold font-mono ${isAffordable ? 'text-white' : 'text-zinc-500'}`}>
                    {u.name}
                  </span>
                  {u.count > 0 && (
                    <span className="p-0.5 px-1.5 text-[9px] font-bold bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full font-mono">
                      v{u.count}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight">{u.desc}</p>
                <div className="text-[9px] text-purple-400/80 font-mono mt-1 uppercase">
                  Contribution: +{(u.count * u.cps).toFixed(1)} CPS
                </div>
              </div>

              <div className="text-right flex flex-col justify-center items-end min-w-[70px]">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-mono">Calculus Cost</span>
                <span className={`text-xs font-bold font-mono ${isAffordable ? 'text-purple-400' : 'text-zinc-500'}`}>
                  {u.cost}
                </span>
                <span className="text-[9px] text-zinc-600 font-mono block mt-0.5">+{u.cps}/s each</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 4. 2048 EQUATION FUSION
// ==========================================
export function Math2048({ onBack, isMuted, toggleMute }: Slope3DProps) {
  const [grid, setGrid] = useState<number[][]>(() => [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('2048_high_score') || '0', 10);
  });
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const getEmptyCells = (currentGrid: number[][]) => {
    const cells: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentGrid[r][c] === 0) cells.push({ r, c });
      }
    }
    return cells;
  };

  const addRandomTile = (currentGrid: number[][]) => {
    const emptyCells = getEmptyCells(currentGrid);
    if (emptyCells.length === 0) return currentGrid;

    const newGrid = currentGrid.map(row => [...row]);
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
  };

  const resetGame = () => {
    let freshGrid = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    freshGrid = addRandomTile(freshGrid);
    freshGrid = addRandomTile(freshGrid);
    setGrid(freshGrid);
    setScore(0);
    setGameOver(false);
    setHasWon(false);
    playSound('click', isMuted);
  };

  // Setup game on start
  useEffect(() => {
    resetGame();
  }, []);

  const slideLeft = (matrix: number[][], currentScoreScore: number) => {
    let scoreGain = 0;
    const nextMatrix = matrix.map(row => {
      // 1. filter out zeroes
      let filtered = row.filter(val => val !== 0);
      const outputRow: number[] = [];
      
      // 2. merge adjacent identical cells
      for (let i = 0; i < filtered.length; i++) {
        if (filtered[i] === filtered[i + 1]) {
          const combined = filtered[i] * 2;
          outputRow.push(combined);
          scoreGain += combined;
          if (combined === 2048) {
            setHasWon(true);
          }
          i++; // Skip step next cell
        } else {
          outputRow.push(filtered[i]);
        }
      }

      // 3. pad tailing zeroes
      while (outputRow.length < 4) {
        outputRow.push(0);
      }
      return outputRow;
    });

    return { nextMatrix, scoreGain };
  };

  const rotateClockwise = (matrix: number[][]) => {
    const n = 4;
    const rotated = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        rotated[c][n - 1 - r] = matrix[r][c];
      }
    }
    return rotated;
  };

  const checkGameLoose = (currentGrid: number[][]) => {
    // If empty cells exists, not lost
    if (getEmptyCells(currentGrid).length > 0) return false;

    // Check adjacent matches horizontal or vertical
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (r < 3 && currentGrid[r][c] === currentGrid[r + 1][c]) return false;
        if (c < 3 && currentGrid[r][c] === currentGrid[r][c + 1]) return false;
      }
    }
    return true;
  };

  const handleKeyPress = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameOver) return;

    let currentMatrix = grid.map(r => [...r]);
    let rotatedCount = 0;

    // Rotate matrix to transform direction slide to slideLeft execution
    if (dir === 'UP') {
      currentMatrix = rotateClockwise(rotateClockwise(rotateClockwise(currentMatrix)));
      rotatedCount = 1;
    } else if (dir === 'RIGHT') {
      currentMatrix = rotateClockwise(rotateClockwise(currentMatrix));
      rotatedCount = 2;
    } else if (dir === 'DOWN') {
      currentMatrix = rotateClockwise(currentMatrix);
      rotatedCount = 3;
    }

    const result = slideLeft(currentMatrix, score);
    let finalMatrix = result.nextMatrix;

    // Restore rotation
    for (let i = 0; i < rotatedCount; i++) {
      finalMatrix = rotateClockwise(finalMatrix);
    }

    // Check if grid actually modified
    let gridChanged = false;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (finalMatrix[r][c] !== grid[r][c]) {
          gridChanged = true;
          break;
        }
      }
    }

    if (gridChanged) {
      const spicedMatrix = addRandomTile(finalMatrix);
      setGrid(spicedMatrix);
      
      const newScore = score + result.scoreGain;
      setScore(newScore);
      if (result.scoreGain > 0) {
        playSound('score', isMuted);
      }

      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('2048_high_score', newScore.toString());
      }

      if (checkGameLoose(spicedMatrix)) {
        setGameOver(true);
        playSound('gameover', isMuted);
      }
    }
  };

  // Keyboard binding
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) handleKeyPress('LEFT');
      if (['ArrowRight', 'd', 'D'].includes(e.key)) handleKeyPress('RIGHT');
      if (['ArrowUp', 'w', 'W'].includes(e.key)) handleKeyPress('UP');
      if (['ArrowDown', 's', 'S'].includes(e.key)) handleKeyPress('DOWN');
      
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [grid, score, gameOver]);

  const tileColors: { [key: number]: { bg: string, text: string, name: string } } = {
    2: { bg: 'bg-zinc-800 border-emerald-500/30 text-emerald-400', text: 'text-emerald-400', name: 'Fraction 1/2' },
    4: { bg: 'bg-zinc-800 border-cyan-500/30 text-cyan-400', text: 'text-cyan-400', name: 'Identity' },
    8: { bg: 'bg-emerald-950/40 border-emerald-500 text-emerald-300', text: 'text-emerald-300', name: 'Matrix X' },
    16: { bg: 'bg-cyan-950/40 border-cyan-500 text-cyan-300', text: 'text-cyan-300', name: 'Secant θ' },
    32: { bg: 'bg-indigo-950/40 border-indigo-500 text-indigo-300', text: 'text-indigo-300', name: 'Vector v' },
    64: { bg: 'bg-violet-950/40 border-violet-500 text-violet-300', text: 'text-violet-300', name: 'Integral ∫' },
    128: { bg: 'bg-purple-950/40 border-purple-500 text-purple-200', text: 'text-purple-200', name: 'Derivative' },
    256: { bg: 'bg-amber-950/40 border-amber-500 text-amber-300 font-bold', text: 'text-amber-300', name: 'Polynomial' },
    512: { bg: 'bg-orange-950/40 border-orange-500 text-orange-200 font-bold', text: 'text-orange-200', name: 'Logarithm' },
    1024: { bg: 'bg-pink-950/40 border-pink-400 text-pink-200 font-black', text: 'text-pink-200', name: 'Quadratic' },
    2048: { bg: 'bg-[#1e1140] border-yellow-400 text-yellow-300 font-black shadow-lg shadow-yellow-500/10 animate-pulse', text: 'text-yellow-300', name: 'Limit Euler' },
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white rounded-2xl border border-zinc-800 overflow-hidden relative" id="math2048-container">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-zinc-950/80 border-b border-zinc-800 z-10 w-full">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" />
          <span className="text-white font-bold text-sm tracking-wider uppercase">2048: Fusion Calculus</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-zinc-500 text-xs">High:</span>
            <span className="text-amber-500 font-bold font-mono">{highScore}</span>
          </div>
          <button 
            onClick={toggleMute} 
            className="p-1 px-2 hover:bg-zinc-800 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
            id="2048-mute"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={onBack} 
            className="text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded transition border border-zinc-700"
            id="2048-back"
          >
            Back
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row items-center justify-around p-6 gap-6 relative">
        {/* Core HUD Info */}
        <div className="text-center md:text-left flex flex-col items-center md:items-start" id="2048-info-panel">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-400 uppercase tracking-wide">
            Equation 2048
          </h1>
          <p className="text-xs text-zinc-500 max-w-xs mt-1 leading-relaxed text-center md:text-left">
            Slide matching numerical constants to fuse them into advanced trigonometric forms until you reach the limit theorem level 2048!
          </p>
          <div className="mt-4 flex gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 px-5 text-center shadow-inner min-w-[90px]">
              <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">Formulas</div>
              <div className="text-xl font-bold text-indigo-400 font-mono">{score}</div>
            </div>
          </div>
          
          <button 
            onClick={resetGame}
            className="mt-4 flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-850 text-indigo-400 border border-zinc-800 rounded-xl p-2 px-4 text-xs font-bold transition cursor-pointer"
            id="2048-reset"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Grid
          </button>

          {/* Controls key layout */}
          <div className="hidden md:flex flex-col mt-6 gap-1 bg-zinc-900/40 p-3 rounded-xl border border-zinc-850 text-xs">
            <span className="text-[10px] text-indigo-400/80 uppercase font-bold font-mono tracking-wide">Keybindings</span>
            <span className="text-zinc-500">Left / A: Move columns Left</span>
            <span className="text-zinc-500">Right / D: Move columns Right</span>
            <span className="text-zinc-500">Up / W: Compress Rows UP</span>
            <span className="text-zinc-500">Down / S: Compress Rows DOWN</span>
          </div>
        </div>

        {/* 4x4 Grid representation */}
        <div className="relative p-3 bg-[#0d0e14] rounded-2xl border border-zinc-800 shadow-2xl" id="2048-matrix-grid">
          <div className="grid grid-cols-4 gap-2.5 w-72 h-72">
            {grid.map((row, rIdx) => 
              row.map((val, cIdx) => {
                const colors = tileColors[val] || { bg: 'bg-zinc-900/40 border-zinc-850 text-zinc-600', text: 'text-zinc-650', name: 'Zero' };
                return (
                  <div 
                    key={`${rIdx}-${cIdx}`}
                    className={`rounded-xl border flex flex-col items-center justify-center transition-all duration-150 relative ${colors.bg}`}
                    id={`tile-${rIdx}-${cIdx}`}
                  >
                    {val > 0 ? (
                      <>
                        <span className="text-xl font-black font-mono leading-none tracking-tight">
                          {val}
                        </span>
                        <span className="text-[7px] text-zinc-500 leading-none mt-1 uppercase absolute bottom-1 truncate max-w-[55px] font-medium text-center">
                          {colors.name.replace(' Fraction', '')}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-zinc-800 font-mono">0</span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Lost Overlay state or Win overlay */}
          {(gameOver || hasWon) && (
            <div className="absolute inset-0 bg-[#05060b]/95 backdrop-blur flex flex-col items-center justify-center text-center p-4 rounded-2xl border border-zinc-800 shadow-2xl z-20 animate-fade-in" id="2048-overlay">
              {gameOver ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500 flex items-center justify-center text-red-400 mb-3">
                    <HelpCircle className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-black uppercase text-white tracking-wider">No Valid Combinations!</h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-[180px]">The columns locked completely and equations saturated.</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500 flex items-center justify-center text-amber-400 mb-3 animate-bounce">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black uppercase text-yellow-400 tracking-wider">Theorem Verified!</h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-[180px]">You compounded variables until reaching the 2048 formula limit!</p>
                </>
              )}
              
              <button
                onClick={resetGame}
                className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold p-2.5 px-6 rounded-xl text-xs uppercase shadow cursor-pointer"
                id="2048-retry-btn"
              >
                Recalculate Grid
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
