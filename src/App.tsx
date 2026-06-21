/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Gamepad2, 
  Lock, 
  ShieldAlert, 
  Calculator, 
  Heart, 
  BadgeCheck, 
  Check, 
  Bot, 
  Trash2, 
  Volume2, 
  VolumeX,
  FileSpreadsheet,
  Settings,
  X,
  ExternalLink,
  Download,
  MessageSquare
} from 'lucide-react';
import { Slope3D, RetroFootball, EquationClicker, Math2048, playSound } from './nativeGames';
import { RAW_GAMES } from './gamesData';

// Definitions for game items
interface GameItem {
  id: string;
  title: string;
  description: string;
  category: 'native' | '3d' | 'puzzle' | 'sports' | 'casual' | 'horror';
  isNative: boolean;
  iframeUrl?: string;
  thumbnailUrl: string;
  playCount: number;
  tags: string[];
  nativeComponent?: string;
  subtitle?: string;
  isSpecial?: boolean;
  isSuggest?: boolean;
  isComment?: boolean;
}

// Custom category mapper functions
function determineGameCategory(title: string): '3d' | 'puzzle' | 'sports' | 'casual' | 'horror' {
  const t = title.toLowerCase();
  if (t.includes('slope') || t.includes('3d') || t.includes('drive') || t.includes('moto') || t.includes('run') || t.includes('tunnel') || t.includes('geometry') || t.includes('retro bowl')) return '3d';
  if (t.includes('chess') || t.includes('sudoku') || t.includes('2048') || t.includes('puzzle') || t.includes('math') || t.includes('block') || t.includes('sort') || t.includes('connect')) return 'puzzle';
  if (t.includes('ball') || t.includes('football') || t.includes('soccer') || t.includes('billiards') || t.includes('sports') || t.includes('bowl') || t.includes('basketball') || t.includes('tennis') || t.includes('golf')) return 'sports';
  if (t.includes('fnaf') || t.includes('horror') || t.includes('creep') || t.includes('slender') || t.includes('dark') || t.includes('abandoned') || t.includes('scary')) return 'horror';
  return 'casual';
}

function determineGameDescription(title: string, category: string): string {
  if (category === '3d') {
    return `Enjoy high-speed immersive unblocked 3D coordinates. Roll, jump, and dodge linear grids in ${title}.`;
  }
  if (category === 'puzzle') {
    return `Train your mathematical IQ with ${title}. Solve challenging number patterns, logic puzzles, and grids.`;
  }
  if (category === 'sports') {
    return `Compete in sports simulations offline. Evade defenders, score, and show off tactics on the ${title} stage.`;
  }
  if (category === 'horror') {
    return `Brace yourself for eerie atmosphere and psychological puzzles. Unravel mysteries in the dark coordinates of ${title}.`;
  }
  return `Play absolute unblocked arcade gaming with ${title} online. Polished retro controls running inside stable cache frameworks.`;
}

// Unsplash images that match each category perfectly
const UNSPLASH_IMAGES = {
  '3d': [
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=400&auto=format&fit=crop&q=80',
  ],
  'puzzle': [
    'https://images.unsplash.com/photo-1516116211223-5c359a36298a?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1596495578065-6e0763fa1141?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
  ],
  'sports': [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&auto=format&fit=crop&q=80',
  ],
  'horror': [
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1533925565074-bcec6719e7a2?w=400&auto=format&fit=crop&q=80',
  ],
  'casual': [
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1502481851512-e9e2529beff9?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80',
  ],
};

function getGameThumbnail(id: string, category: '3d' | 'puzzle' | 'sports' | 'casual' | 'horror'): string {
  const list = UNSPLASH_IMAGES[category] || UNSPLASH_IMAGES['casual'];
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return list[sum % list.length];
}

const NATIVE_GAMES: GameItem[] = [
  {
    id: 'suggest_games',
    title: '[!] SUGGEST GAMES',
    subtitle: '.gg/D4c9VFYWyU',
    description: 'Join the unblocked community discord or write game suggestions directly here.',
    category: 'casual',
    isNative: false,
    isSpecial: true,
    isSuggest: true,
    playCount: 99420,
    tags: ['HOT', 'NEW', 'COMMUNITY'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'comments_board',
    title: '[!] COMMENTS',
    subtitle: 'LOCAL CHATRACKET',
    description: 'Express your scores, tips, or notes to fellow coordinates offline.',
    category: 'casual',
    isNative: false,
    isSpecial: true,
    isComment: true,
    playCount: 88204,
    tags: ['NEW', 'CHAT', 'FORUM'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'slope3d',
    title: 'Slope 3D',
    description: 'Roll down 3D neon courses natively. Keep balance and avoid falling into equations!',
    category: 'native',
    isNative: true,
    nativeComponent: 'Slope3D',
    playCount: 843912,
    tags: ['3D', 'HOT', 'SPEED'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'retro_football',
    title: 'Retro Football',
    description: 'American classic side-scroll football tactics simulator running offline.',
    category: 'sports',
    isNative: true,
    nativeComponent: 'RetroFootball',
    playCount: 310492,
    tags: ['SPORTS', 'HOT', 'RETRO'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'equation_clicker',
    title: 'Equation Clicker',
    description: 'Natively formulated algebra idle tycoon clicking calculator game.',
    category: 'puzzle',
    isNative: true,
    nativeComponent: 'EquationClicker',
    playCount: 204910,
    tags: ['PUZZLE|IDLE', 'NEW'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'math_2048',
    title: 'Math 2048',
    description: 'Legendary arithmetic sliding grid tile game matching identical coordinate exponents.',
    category: 'puzzle',
    isNative: true,
    nativeComponent: 'Math2048',
    playCount: 412093,
    tags: ['PUZZLE|IDLE', 'HOT'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1516116211223-5c359a36298a?w=400&auto=format&fit=crop&q=80'
  }
];

const REPOSITORY_GAMES: GameItem[] = RAW_GAMES.map((raw, index) => {
  const category = determineGameCategory(raw.title);
  const description = determineGameDescription(raw.title, category);
  const thumbnailUrl = getGameThumbnail(raw.id, category);
  
  const playCount = Math.floor(10000 + (Math.sin(index) + 1.2) * 54300);
  
  const tags: string[] = [];
  if (category === '3d') tags.push('3D');
  if (category === 'puzzle') tags.push('PUZZLE|IDLE');
  if (category === 'sports') tags.push('SPORTS');
  if (index % 7 === 0) tags.push('HOT');
  if (index % 9 === 0) tags.push('NEW');
  if (tags.length === 0) tags.push('ALL');

  return {
    id: raw.id,
    title: raw.title,
    description,
    category,
    isNative: false,
    iframeUrl: raw.url,
    thumbnailUrl,
    playCount,
    tags
  };
});

const INITIAL_GAMES_LIST = [...NATIVE_GAMES, ...REPOSITORY_GAMES];

// Disguise presets for the dynamic Tab Cloaker
interface CloakPreset {
  id: string;
  name: string;
  title: string;
  iconPath: string;
}

const CLOAK_PRESETS: CloakPreset[] = [
  { id: 'default', name: 'Default (gn-math)', title: 'gn-math - Ultimate algebra hub', iconPath: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=32&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  { id: 'classroom', name: 'Google Classroom', title: 'Classes', iconPath: 'https://ssl.gstatic.com/classroom/favicon.png' },
  { id: 'drive', name: 'Google Drive', title: 'My Drive - Google Drive', iconPath: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png' },
  { id: 'canvas', name: 'Canvas LMS', title: 'Dashboard - Canvas Student', iconPath: 'https://du11hjcvx0uqb.cloudfront.net/br/v1.23.0/images/favicon-canvas.ico' },
  { id: 'edpuzzle', name: 'Edpuzzle', title: 'Edpuzzle Lesson System', iconPath: 'https://static.edpuzzle.com/images/favicons/favicon-32x32.png' },
  { id: 'wikipedia', name: 'Wikipedia', title: 'Mathematics - Wikipedia', iconPath: 'https://en.wikipedia.org/static/favicon/wikipedia.ico' },
  { id: 'khan', name: 'Khan Academy', title: 'Algebra II | Khan Academy', iconPath: 'https://www.khanacademy.org/favicon.ico' }
];

export default function App() {
  // Game list data matching original request and earlier formats
  const [games] = useState<GameItem[]>(INITIAL_GAMES_LIST);

  // Active state management
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('genizy_favorites') || '[]');
  });

  // gn-math custom visual state filters matching screenshot
  const [sortMethod, setSortMethod] = useState<'name' | 'popular' | 'new'>('name');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');

  // Multi-tab Settings overlay dashboard trigger
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'utils' | 'cloaker' | 'panic' | 'favorites' | 'faq'>('utils');

  // Interactive popup modals for custom special cards
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);

  // Local comments guestbook state
  const [comments, setComments] = useState<Array<{ name: string; text: string; time: string }>>(() => {
    const saved = localStorage.getItem('gnmath_comments');
    if (saved) return JSON.parse(saved);
    return [
      { name: "MathGamer", text: "Yo bad parenting 1 is creepier than fnaf!", time: "Today, 10:14 AM" },
      { name: "algebra_pro", text: "Slope 3D math roll offline highscore is 942, beat that guys.", time: "Today, 11:20 AM" },
      { name: "ClassroomLurker", text: "The Google Classroom cloak and Panic bindings work perfectly when the teacher walks past!", time: "Yesterday, 3:45 PM" }
    ];
  });

  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  // Local user game request suggestion wishlist state
  const [suggestions, setSuggestions] = useState<Array<{ title: string; count: number }>>(() => {
    const saved = localStorage.getItem('gnmath_suggestions');
    if (saved) return JSON.parse(saved);
    return [
      { title: "Subway Surfers", count: 84 },
      { title: "Drift Hunters", count: 47 },
      { title: "Retro Bowl 2", count: 31 }
    ];
  });
  const [newSuggestName, setNewSuggestName] = useState('');

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const item = {
      name: newCommentName.trim() || 'Anonymous Student',
      text: newCommentText.trim(),
      time: 'Just now'
    };
    const updated = [item, ...comments];
    setComments(updated);
    localStorage.setItem('gnmath_comments', JSON.stringify(updated));
    setNewCommentText('');
    playSound('click', isAudioMuted);
  };

  const submitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuggestName.trim()) return;
    const name = newSuggestName.trim();
    let updated = [...suggestions];
    const existing = updated.find(s => s.title.toLowerCase() === name.toLowerCase());
    if (existing) {
      existing.count += 1;
    } else {
      updated.push({ title: name, count: 1 });
    }
    updated.sort((a,b) => b.count - a.count);
    setSuggestions(updated);
    localStorage.setItem('gnmath_suggestions', JSON.stringify(updated));
    setNewSuggestName('');
    playSound('score', isAudioMuted);
  };
  
  // URL check for standalone direct embeds inside about:blank
  const [embedMode, setEmbedMode] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const embedId = params.get('embed');
    if (embedId) {
      setEmbedMode(embedId);
    }
  }, []);

  // Standalone offline game pack downloader
  const downloadGameOffline = (game: GameItem, e: React.MouseEvent) => {
    e.stopPropagation();
    
    let htmlContent = "";
    if (game.isNative) {
      htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${game.title} - Standalone Native</title>
  <style>
    body, html {
      margin: 0; padding: 0; width: 100%; height: 100%; background: #07080c; color: white;
      font-family: sans-serif; display: flex; align-items: center; justify-content: center;
    }
    .card {
      text-align: center; max-width: 450px; background: #0b0c13; padding: 30px; border-radius: 16px; border: 1px solid #1e293b;
    }
    .btn {
      display: inline-block; background: #ff5a5a; color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>${game.title}</h1>
    <p>${game.description}</p>
    <a class="btn" href="${window.location.origin}?embed=${game.id}" target="_blank">Launch Game Online</a>
  </div>
</body>
</html>`;
    } else {
      htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${game.title} - Standalone Offline Player</title>
  <style>
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #000; }
    iframe { width: 100%; height: 100%; border: none; }
  </style>
</head>
<body>
  <iframe src="${game.iframeUrl}" allowfullscreen allow="autoplay; encrypted-media; gyroscope"></iframe>
</body>
</html>`;
    }

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `offline-game-${game.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    playSound('score', isAudioMuted);
  };
  
  // Game session triggers
  const [runningGame, setRunningGame] = useState<GameItem | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Tab cloaker preferences
  const [activeCloakId, setActiveCloakId] = useState(() => {
    return localStorage.getItem('genizy_cloak_preset') || 'default';
  });
  const [panicKey, setPanicKey] = useState(() => {
    return localStorage.getItem('genizy_panic_key') || 'Escape';
  });
  const [panicRedirectUrl, setPanicRedirectUrl] = useState(() => {
    return localStorage.getItem('genizy_panic_url') || 'https://classroom.google.com';
  });

  // Homework App simulator features
  const [homeworkEquation, setHomeworkEquation] = useState('f(x) = x^2 - 4x + 4');
  const [notesText, setNotesText] = useState('Algebra notes - limits are useful descriptors...');
  const [aiPrompts, setAiPrompts] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: 'Mathematical Solver online. Ask me to formulate proofs or calculate geometry.' }
  ]);
  const [aiInput, setAiInput] = useState('');

  // Setup Dyn Cloaking favicon & titles
  useEffect(() => {
    const selectedPreset = CLOAK_PRESETS.find(p => p.id === activeCloakId) || CLOAK_PRESETS[0];
    document.title = selectedPreset.title;
    
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = selectedPreset.iconPath;
  }, [activeCloakId]);

  // Listen to Panic Key anywhere in the application viewport
  useEffect(() => {
    const handlePanicPress = (e: KeyboardEvent) => {
      if (e.key === panicKey) {
        playSound('gameover', isAudioMuted);
        window.location.href = panicRedirectUrl;
      }
    };
    window.addEventListener('keydown', handlePanicPress);
    return () => window.removeEventListener('keydown', handlePanicPress);
  }, [panicKey, panicRedirectUrl, isAudioMuted]);

  // Launch unblocked inside safe blank window cache to evade filter systems
  const launchAboutBlank = (game: GameItem) => {
    playSound('jump', isAudioMuted);
    
    // For native offline games play natively inside our beautiful sandbox frame
    if (game.isNative) {
      setRunningGame(game);
      return;
    }

    try {
      const activePreset = CLOAK_PRESETS.find(p => p.id === activeCloakId) || CLOAK_PRESETS[0];
      const gameUrl = game.iframeUrl || "";
      
      const newWin = window.open('about:blank', '_blank');
      if (!newWin) {
        // Fallback to inline theater panel if user popup blocks are strictly engaged
        setRunningGame(game);
        return;
      }

      // Write untraceable iframe wrapper to the document cache
      const doc = newWin.document;
      doc.title = activePreset.title;
      
      // Inject Favicon Link dynamically
      const iconLink = doc.createElement('link');
      iconLink.rel = 'icon';
      iconLink.href = activePreset.iconPath;
      doc.head.appendChild(iconLink);

      // Create styling reset and unblocked iframe wrapper
      const styles = doc.createElement('style');
      styles.innerHTML = `
        body, html { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:#000; }
        iframe { width:100%; height:100%; border:none; outline:none; }
      `;
      doc.head.appendChild(styles);

      const iframe = doc.createElement('iframe');
      iframe.src = gameUrl;
      iframe.allowFullscreen = true;
      iframe.allow = "autoplay; encrypted-media; gyroscope";
      doc.body.appendChild(iframe);
    } catch (err) {
      setRunningGame(game);
    }
  };

  const handleAiSolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    
    const userMsg = aiInput.trim();
    const updated = [...aiPrompts, { sender: 'user' as const, text: userMsg }];
    setAiPrompts(updated);
    setAiInput('');
    playSound('click', isAudioMuted);

    setTimeout(() => {
      let botResponse = "Coordinate resolution successful. Linear calculation evaluated safely.";
      if (userMsg.toLowerCase().includes('slope') || userMsg.toLowerCase().includes('derivative')) {
        botResponse = "Slope indicates rise over run. For function line y = mx + c, the slope is represented by 'm' coordinate vectors.";
      } else if (userMsg.toLowerCase().includes('limit')) {
        botResponse = "A limit computes horizontal boundaries as x approaches infinite math coordinates safely.";
      }
      setAiPrompts(prev => [...prev, { sender: 'bot', text: botResponse }]);
      playSound('score', isAudioMuted);
    }, 1000);
  };

  // Toggle favorite
  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let updated = [...favorites];
    if (updated.includes(id)) {
      updated = updated.filter(item => item !== id);
    } else {
      updated.push(id);
    }
    setFavorites(updated);
    localStorage.setItem('genizy_favorites', JSON.stringify(updated));
    playSound('click', isAudioMuted);
  };

  // Filter and sort mechanics modeled strictly from cloned reference screenshots
  const filteredGames = games
    .filter(g => {
      // 1. Text Search query
      const matchesSearch = searchQuery === "" || 
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        g.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Select tag box dropdown (ALL/HOT/NEW/etc.)
      const matchesTag = selectedTag === 'ALL' || g.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      // Pin Interactive boards strictly to the top 
      if (a.isSpecial && !b.isSpecial) return -1;
      if (!a.isSpecial && b.isSpecial) return 1;

      if (sortMethod === 'popular') {
        return b.playCount - a.playCount;
      }
      if (sortMethod === 'new') {
        const aIsNew = a.tags.includes('NEW') ? 1 : 0;
        const bIsNew = b.tags.includes('NEW') ? 1 : 0;
        return bIsNew - aIsNew;
      }
      return a.title.localeCompare(b.title);
    });

  const favoritedList = games.filter(g => favorites.includes(g.id));

  const selectCloakPreset = (id: string) => {
    setActiveCloakId(id);
    localStorage.setItem('genizy_cloak_preset', id);
    playSound('click', isAudioMuted);
  };

  if (embedMode) {
    const embeddedGame = games.find(g => g.id === embedMode);
    if (!embeddedGame) {
      return (
        <div className="flex h-screen w-screen bg-[#07080c] items-center justify-center font-mono text-zinc-500">
          <span>Game math component not found.</span>
        </div>
      );
    }
    
    return (
      <div className="w-screen h-screen bg-black">
        {embeddedGame.isNative ? (
          <div className="w-full h-full p-4 relative">
            <div className="absolute top-4 right-4 z-50">
              <button 
                onClick={() => {
                  setIsAudioMuted(!isAudioMuted);
                  playSound('click', !isAudioMuted);
                }}
                className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-zinc-400 hover:text-white"
                title={isAudioMuted ? "Unmute Audio" : "Mute Audio"}
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
            {embeddedGame.nativeComponent === 'Slope3D' && (
              <Slope3D 
                onBack={() => {}} 
                isMuted={isAudioMuted} 
                toggleMute={() => setIsAudioMuted(!isAudioMuted)} 
              />
            )}
            {embeddedGame.nativeComponent === 'RetroFootball' && (
              <RetroFootball 
                onBack={() => {}} 
                isMuted={isAudioMuted} 
                toggleMute={() => setIsAudioMuted(!isAudioMuted)} 
              />
            )}
            {embeddedGame.nativeComponent === 'EquationClicker' && (
              <EquationClicker onBack={() => {}} />
            )}
            {embeddedGame.nativeComponent === 'Math2048' && (
              <Math2048 
                onBack={() => {}} 
                isMuted={isAudioMuted} 
                toggleMute={() => setIsAudioMuted(!isAudioMuted)} 
              />
            )}
          </div>
        ) : (
          <iframe 
            src={embeddedGame.iframeUrl} 
            title={embeddedGame.title} 
            className="w-full h-full border-none bg-black" 
            allowFullScreen 
            allow="autoplay; encrypted-media; gyroscope"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0e15] text-zinc-100 font-sans flex flex-col selection:bg-rose-500 selection:text-white" id="main-application-frame">
      {/* ========================================================= */}
      {/* CORE TOP HEADER (EXACTLY MATCHING THE CLONED BRAND SCREENSHOT) */}
      {/* ========================================================= */}
      <header className="bg-[#ff5a5a] text-white py-3 px-6 flex flex-wrap items-center justify-between gap-4 shadow-lg sticky top-0 z-40 transition-colors duration-150" id="clone-header-bar">
        {/* Brand logo title */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => { setRunningGame(null); playSound('click', isAudioMuted); }}
            className="text-2xl font-black tracking-tighter uppercase cursor-pointer select-none text-white hover:opacity-90 flex items-center gap-1.5"
          >
            GN-MATH
            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono font-bold tracking-normal align-middle uppercase border border-white/20">V3.0</span>
          </div>
        </div>

        {/* Search and Sort Filter controls modeled strictly from screenshot */}
        <div className="flex-1 max-w-2xl px-2 flex flex-wrap items-center gap-3">
          {/* 1. Search Box input */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-white/50 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search zones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 hover:border-white/30 focus:border-white/40 rounded-xl p-2 pl-9 text-xs placeholder-white/60 text-white focus:outline-none font-medium transition"
              id="game-search"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-white/60 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. Sorted by Select Box dropdown */}
          <div className="relative min-w-[90px]">
            <select
              value={sortMethod}
              onChange={(e) => { setSortMethod(e.target.value as any); playSound('click', isAudioMuted); }}
              className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl p-2 pr-6 text-xs text-white font-bold cursor-pointer focus:outline-none appearance-none transition"
              id="sort-select"
            >
              <option value="name" className="text-zinc-900 font-bold">Name</option>
              <option value="popular" className="text-zinc-900 font-bold">Popular</option>
              <option value="new" className="text-zinc-900 font-bold">New</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-white/60">
              <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>

          {/* 3. Dropdown tags box */}
          <div className="relative min-w-[130px]">
            <select
              value={selectedTag}
              onChange={(e) => { setSelectedTag(e.target.value); playSound('click', isAudioMuted); }}
              className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl p-2 pr-6 text-xs text-white font-bold cursor-pointer focus:outline-none appearance-none transition uppercase"
              id="tags-select"
            >
              <option value="ALL" className="text-zinc-900 font-bold">(SELECT TAG)</option>
              <option value="HOT" className="text-zinc-900 font-bold">★ HOT</option>
              <option value="NEW" className="text-zinc-900 font-bold">⚡ NEW</option>
              <option value="MULT|BUILD" className="text-zinc-900 font-bold">👥 MULT|BUILD</option>
              <option value="3D" className="text-zinc-900 font-bold">🧊 3D</option>
              <option value="SPORTS" className="text-zinc-900 font-bold">⚽ SPORTS / STUNTS</option>
              <option value="PUZZLE|IDLE" className="text-zinc-900 font-bold">🧩 PUZZLE|IDLE</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-white/60">
              <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>

        {/* Right utility triggers */}
        <div className="flex items-center gap-2">
          {/* Mute toggle */}
          <button
            onClick={() => { setIsAudioMuted(!isAudioMuted); playSound('click', !isAudioMuted); }}
            className="w-10 h-10 bg-white/10 hover:bg-white/15 active:scale-95 rounded-xl flex items-center justify-center transition cursor-pointer border border-white/20"
            title={isAudioMuted ? "Unmute sound keys" : "Mute sound keys"}
          >
            {isAudioMuted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
          </button>

          {/* Quick Settings Gear button (activates utilities/cloaker sheet modal) */}
          <button
            onClick={() => { setShowSettingsModal(true); playSound('click', isAudioMuted); }}
            className="w-10 h-10 bg-white/10 hover:bg-white/15 active:scale-95 rounded-xl flex items-center justify-center transition cursor-pointer border border-white/20 text-white"
            title="Secure Disguise settings, Tab cloaker presets, & panic commands"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>

          {/* Core high accuracy statistics banner */}
          <div className="hidden lg:flex flex-col text-right pl-2 border-l border-white/20 select-none font-mono">
            <span className="text-[9px] uppercase tracking-wider text-white/75 leading-none">Sandbox Mode</span>
            <span className="text-[11px] font-black text-rose-100 leading-none mt-1">SECURE (99.8%)</span>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* DYNAMIC STABILIZED SCREEN AREA */}
      {/* ========================================================= */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6" id="main-stage">
        
        {/* Dynamic header notification banner for classroom bypass options */}
        <div className="bg-[#121422] border border-rose-500/10 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Stealth about:blank Redirect Engaged</h2>
              <p className="text-[11px] text-zinc-400 leading-normal mt-0.5">
                All game tabs run securely inside an untraceable <b>about:blank</b> system cache to mask GoGuardian history tags.
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-zinc-900 border border-zinc-850 p-1 px-3 rounded text-zinc-400 font-mono">
            Panic Key binding: <b className="text-[#ff5a5a] font-bold uppercase">{panicKey}</b>
          </span>
        </div>

        {/* Running game direct iframe viewport */}
        {runningGame ? (
          <div className="bg-[#121422] rounded-2xl border border-zinc-850 overflow-hidden relative shadow-2xl flex flex-col min-h-[550px]" id="active-theater-view">
            <div className="p-3 bg-zinc-950/60 border-b border-zinc-900 flex justify-between items-center gap-4">
              <button
                onClick={() => { setRunningGame(null); playSound('click', isAudioMuted); }}
                className="flex items-center gap-2 bg-[#ff5a5a] hover:bg-[#ff4646] font-bold text-white p-2 px-4 rounded-xl text-xs transition cursor-pointer"
                id="exit-game"
              >
                ← Back to Arcade Grid
              </button>

              <div className="text-center">
                <span className="text-[9px] uppercase text-zinc-500 font-semibold tracking-wider font-mono">Active Sandbox:</span>
                <p className="text-sm font-black text-[#ff5a5a]">{runningGame.title}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => { launchAboutBlank(runningGame); }}
                  className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-805 rounded-xl p-2 px-3 text-xs transition cursor-pointer"
                  title="Force relaunch this coordinate package in an unblocked about:blank web wrapper"
                  id="open-about-blank"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> 
                  <span className="hidden md:inline">Unblocked Tab</span>
                </button>
                <button
                  onClick={() => { toggleFavorite(runningGame.id); }}
                  className={`p-2 rounded-xl border transition ${
                    favorites.includes(runningGame.id) 
                      ? 'bg-rose-950/40 border-rose-500/30 text-rose-400' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                  id="fav-game-toggle"
                >
                  <Heart className={`w-3.5 h-3.5 ${favorites.includes(runningGame.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-black relative flex items-center justify-center min-h-[450px]">
              {runningGame.isNative ? (
                <div className="w-full h-full p-4 relative">
                  {runningGame.nativeComponent === 'Slope3D' && (
                    <Slope3D 
                      onBack={() => setRunningGame(null)} 
                      isMuted={isAudioMuted} 
                      toggleMute={() => setIsAudioMuted(!isAudioMuted)} 
                    />
                  )}
                  {runningGame.nativeComponent === 'RetroFootball' && (
                    <RetroFootball 
                      onBack={() => setRunningGame(null)} 
                      isMuted={isAudioMuted} 
                      toggleMute={() => setIsAudioMuted(!isAudioMuted)} 
                    />
                  )}
                  {runningGame.nativeComponent === 'EquationClicker' && (
                    <EquationClicker onBack={() => setRunningGame(null)} />
                  )}
                  {runningGame.nativeComponent === 'Math2048' && (
                    <Math2048 
                      onBack={() => setRunningGame(null)} 
                      isMuted={isAudioMuted} 
                      toggleMute={() => setIsAudioMuted(!isAudioMuted)} 
                    />
                  )}
                </div>
              ) : (
                <iframe 
                  src={runningGame.iframeUrl}
                  title={runningGame.title}
                  className="w-full h-full min-h-[450px] border-none bg-[#09090d]"
                  allowFullScreen
                  allow="autoplay; encrypted-media; gyroscope"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  id="game-iframe-element"
                />
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Playable sandbox games grid matching custom gn-math design */}
            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="games-grid">
                {filteredGames.map((game) => {
                  const isFav = favorites.includes(game.id);

                  // Specialized render styles for comments/suggest blocks
                  if (game.isSpecial) {
                    return (
                      <div
                        key={game.id}
                        onClick={() => {
                          if (game.isComment) setShowCommentsModal(true);
                          if (game.isSuggest) setShowSuggestModal(true);
                          playSound('click', isAudioMuted);
                        }}
                        className="bg-[#121422] rounded-2xl border-2 border-dashed border-rose-500/20 hover:border-rose-500/40 p-5 py-6 transition-all duration-205 cursor-pointer flex flex-col justify-between hover:translate-y-[-2px] relative group overflow-hidden"
                        id={`special-card-${game.id}`}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/10 transition"></div>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <span className="p-1 px-2.5 text-[9px] bg-rose-500/10 border border-rose-500/20 rounded-md text-[#ff5a5a] font-black uppercase tracking-wider font-mono">
                              Interactive board
                            </span>
                            <span className="text-[10px] text-zinc-500 font-bold font-mono">
                              {game.subtitle}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <h3 className="text-md font-bold text-white group-hover:text-[#ff5a5a] transition uppercase leading-tight font-mono">
                              {game.title}
                            </h3>
                            <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">
                              {game.description}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-900/60 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                          <span>LOCAL MATRIX BOARD</span>
                          <span className="text-[#ff5a5a] font-black uppercase text-[9px]">LAUNCH NOW →</span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={game.id}
                      onClick={() => { 
                        // Directly trigger unblocked window popup for ultimate convenience or fallback to inline theater play!
                        launchAboutBlank(game);
                        playSound('click', isAudioMuted);
                      }}
                      className="bg-[#121422] rounded-2xl border border-zinc-900/80 hover:border-zinc-800 p-4 transition-all duration-200 cursor-pointer group flex flex-col justify-between hover:translate-y-[-2px] relative overflow-hidden"
                      id={`game-card-${game.id}`}
                    >
                      {/* Interactive top controls card overlay actions */}
                      <div className="flex justify-between items-start mb-3">
                        <span className="p-1 px-2 text-[9px] bg-zinc-900 border border-zinc-850 rounded-md text-zinc-400 font-bold uppercase tracking-wider font-mono">
                          {game.category}
                        </span>
                        
                        <div className="flex items-center gap-1.5 z-10 font-sans">
                          {/* Offline bundle packaging downloader */}
                          <button
                            onClick={(e) => { e.stopPropagation(); downloadGameOffline(game, e); }}
                            className="p-1.5 rounded-lg border bg-zinc-900/40 border-zinc-850 text-zinc-500 hover:text-rose-400 hover:border-rose-500/20 transition cursor-pointer"
                            title="Download offline math game file package"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* Save favorite */}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(game.id, e); }}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              isFav 
                                ? 'bg-rose-950/40 border-rose-500/20 text-[#ff5a5a]' 
                                : 'bg-zinc-900/40 border-zinc-850 text-zinc-500 hover:text-[#ff5a5a]'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Display thumbnail gradient */}
                      <div className="w-full aspect-[16/10] rounded-xl flex items-center justify-center relative overflow-hidden bg-zinc-900 border border-zinc-850/40 shadow-inner mb-3">
                        <img 
                          src={game.thumbnailUrl} 
                          alt={game.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-3">
                          <span className="text-white font-black text-sm tracking-tight truncate w-full uppercase font-mono">{game.title}</span>
                        </div>
                        <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-10 font-bold text-xs select-none">
                          PLAY
                        </div>
                      </div>

                      <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2 min-h-[32px] mb-3">
                        {game.description}
                      </p>

                      <div className="pt-2 border-t border-zinc-900/60 flex justify-between items-center text-[9px] text-zinc-500 font-mono select-none">
                        <span>Plays: {game.playCount.toLocaleString()}</span>
                        <span className="text-[#ff5a5a] font-bold group-hover:translate-x-0.5 transition duration-150">LAUNCH UNBLOCKED →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-16 text-center bg-zinc-950 rounded-2xl border border-zinc-900 max-w-lg mx-auto">
                <Search className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-white font-bold uppercase text-sm font-mono tracking-wider">No matches inside matrix</h3>
                <p className="text-zinc-550 text-xs max-w-sm mx-auto leading-relaxed mt-1">
                  We currently do not have any unblocked game coordinates matching "<b>{searchQuery}</b>". Reset your search index above.
                </p>
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="mt-4 bg-[#ff5a5a] text-white p-2.5 px-6 rounded-xl text-xs font-bold transition hover:bg-[#ff4646]"
                >
                  Clear search filters
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* LOCAL COMMENTS BOARD [!] POPUP MODAL OVERLAY */}
      {/* ========================================================= */}
      {showCommentsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 shadow-2xl" id="comments-modal">
          <div className="bg-[#121422] border border-zinc-800 rounded-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#ff5a5a] text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 fill-current" />
                <h3 className="font-bold font-mono uppercase tracking-wider text-sm">GUESTBOOK & COORD CHAT</h3>
              </div>
              <button 
                onClick={() => setShowCommentsModal(false)} 
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4 font-sans">
              <form onSubmit={submitComment} className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-3">
                <span className="text-[10px] text-zinc-400 font-mono uppercase font-bold tracking-wider block">Express Coordinates Note</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Your Pseudonym / Handle"
                    value={newCommentName}
                    onChange={(e) => setNewCommentName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-rose-400 font-mono flex items-center justify-center bg-rose-950/20 rounded-lg border border-rose-900/35">Local persistence: ON</span>
                </div>
                <textarea
                  required
                  placeholder="Type your highscore alerts, questions or study room coordinates..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white placeholder-zinc-500 focus:outline-none resize-none leading-relaxed"
                  rows={3}
                />
                <button 
                  type="submit" 
                  className="w-full bg-[#ff5a5a] hover:bg-[#ff4646] text-white p-2 rounded-lg text-xs font-bold transition font-mono uppercase"
                >
                  Publish Note
                </button>
              </form>

              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] text-zinc-500 font-mono uppercase font-bold tracking-wider">Active Guestbook records</h4>
                <div className="space-y-2.5">
                  {comments.map((c, i) => (
                    <div key={i} className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-rose-400 font-bold">{c.name}</span>
                        <span className="text-zinc-500">{c.time}</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed font-mono">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* REQUEST SUGGEST GAMES [!] POPUP MODAL OVERLAY */}
      {/* ========================================================= */}
      {showSuggestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 shadow-2xl" id="suggest-modal">
          <div className="bg-[#121422] border border-zinc-800 rounded-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#ff5a5a] text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5" />
                <h3 className="font-bold font-mono uppercase tracking-wider text-sm">SUGGEST UNBLOCKED GAME</h3>
              </div>
              <button 
                onClick={() => setShowSuggestModal(false)} 
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4 font-sans">
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-900 space-y-1">
                <h4 className="text-xs font-bold text-white uppercase font-mono">Join the gn-math unblocked discord server!</h4>
                <p className="text-[11px] text-zinc-500 leading-normal">
                  Our unblocked sandbox catalog coordinates expand daily. Copy our server invitation code key: <b>.gg/D4c9VFYWyU</b>
                </p>
              </div>

              <form onSubmit={submitSuggestion} className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-3">
                <span className="text-[10px] text-zinc-400 font-mono uppercase font-bold tracking-wider block">Write a code title request</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g., Geometry Dash Lite, drift hunters..."
                    value={newSuggestName}
                    onChange={(e) => setNewSuggestName(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                  <button 
                    type="submit" 
                    className="bg-[#ff5a5a] hover:bg-[#ff4646] text-white p-2 px-4 rounded-lg text-xs font-bold transition font-mono uppercase"
                  >
                    Submit
                  </button>
                </div>
              </form>

              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] text-zinc-500 font-mono uppercase font-bold tracking-wider">Top requested Wishlist records</h4>
                <div className="bg-zinc-950 rounded-xl border border-zinc-900 overflow-hidden">
                  {suggestions.map((s, i) => (
                    <div key={i} className="p-3 flex justify-between items-center text-xs font-mono border-b border-zinc-900 last:border-b-0">
                      <span className="text-zinc-350 font-medium">{i+1}. {s.title}</span>
                      <span className="text-rose-400 font-bold bg-rose-950/20 px-2 py-0.5 rounded border border-rose-900/10">{s.count} requests</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CORE EXTENDED SECURE UTILITIES & COVERS OVERLAY PANEL */}
      {/* ========================================================= */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex justify-end animate-fade-in" id="settings-overlay-panel">
          <div className="bg-[#0f111a] border-l border-zinc-850 max-w-xl w-full h-full flex flex-col justify-between overflow-hidden shadow-2xl">
            {/* Header */}
            <div>
              <div className="p-5 bg-zinc-950 border-b border-zinc-900 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#ff5a5a]" />
                  <div>
                    <h3 className="font-bold text-white uppercase tracking-wider text-xs font-mono">Disguise & Proxy Control</h3>
                    <p className="text-[10px] text-zinc-500 leading-none mt-0.5">Custom sandbox config panel</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-850 flex items-center justify-center text-zinc-400 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sub tabs */}
              <div className="flex bg-zinc-950/40 p-2 border-b border-zinc-900 gap-1 overflow-x-auto select-none">
                {(['utils', 'cloaker', 'panic', 'favorites', 'faq'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => { setSettingsTab(tab); playSound('click', isAudioMuted); }}
                    className={`p-1.5 px-3 rounded-lg text-[10px] uppercase font-bold tracking-wider transition ${
                      settingsTab === tab 
                        ? 'bg-[#ff5a5a] text-white' 
                        : 'bg-transparent text-zinc-400 hover:text-white'
                    }`}
                  >
                    {tab === 'utils' && 'Calculator/Notes'}
                    {tab === 'cloaker' && 'Tab Cloaker'}
                    {tab === 'panic' && 'Panic binds'}
                    {tab === 'favorites' && 'Saved Favs'}
                    {tab === 'faq' && 'SECFAQ'}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Display based on activeTab */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* 1. Calculator & Notepad */}
              {settingsTab === 'utils' && (
                <div className="space-y-4 font-sans text-white">
                  <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-rose-400">
                      <Calculator className="w-4.5 h-4.5" />
                      <h4 className="text-xs font-bold uppercase font-mono">Linear Coordinate Graphing</h4>
                    </div>
                    <input
                      type="text"
                      value={homeworkEquation}
                      onChange={(e) => setHomeworkEquation(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-lg p-2 text-xs font-mono text-rose-400 focus:outline-none"
                      placeholder="e.g., y = 3x - 1"
                    />
                    <div className="aspect-[16/9] bg-zinc-900 rounded-xl border border-zinc-855 relative overflow-hidden flex items-center justify-center">
                      <svg className="w-full h-full stroke-rose-500 fill-none opacity-60" viewBox="0 0 100 60">
                        <path d="M 0 30 Q 25 10 50 30 T 100 30" strokeWidth="1.5" />
                      </svg>
                    </div>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-rose-400">
                      <FileSpreadsheet className="w-4.5 h-4.5" />
                      <h4 className="text-xs font-bold uppercase font-mono">Clara Secure Notepad</h4>
                    </div>
                    <textarea
                      rows={6}
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-lg p-2 text-xs text-zinc-300 font-mono resize-none focus:outline-none"
                      placeholder="Copy text snippets, formulas, or homework lists here secure..."
                    />
                  </div>
                </div>
              )}

              {/* 2. Custom Tab Cloaker Page */}
              {settingsTab === 'cloaker' && (
                <div className="space-y-4 font-sans text-white">
                  <p className="text-xs text-zinc-400 leading-normal font-mono">
                    Click a preset below to mask this browser tab immediately with an algebraic identity setup:
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {CLOAK_PRESETS.map((preset) => {
                      const isActive = activeCloakId === preset.id;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => selectCloakPreset(preset.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                            isActive 
                              ? 'bg-rose-950/20 border-rose-500/30 text-[#ff5a5a]' 
                              : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img src={preset.iconPath} alt="Favicon" className="w-5 h-5 rounded object-cover shrink-0" onError={(e)=>{e.currentTarget.src='https://ssl.gstatic.com/classroom/favicon.png'}}/>
                            <div className="min-w-0">
                              <span className="text-xs font-bold font-mono block">{preset.name}</span>
                              <span className="text-[9px] text-zinc-550 block truncate font-mono">Title: "{preset.title}"</span>
                            </div>
                          </div>
                          {isActive && <Check className="w-4 h-4 text-[#ff5a5a]" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Panic & Hotkey redirects binds */}
              {settingsTab === 'panic' && (
                <div className="space-y-4 font-mono font-sans text-white">
                  <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-3">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold block">Panic Binding Hotkey</label>
                    <select
                      value={panicKey}
                      onChange={(e) => { setPanicKey(e.target.value); localStorage.setItem('genizy_panic_key', e.target.value); playSound('click', isAudioMuted); }}
                      className="w-full bg-zinc-900 border border-zinc-800 text-xs text-rose-400 font-bold p-2.5 rounded-lg focus:outline-none cursor-pointer"
                    >
                      <option value="Escape">Escape Key</option>
                      <option value="F4">F4 Key</option>
                      <option value="F2">F2 Key</option>
                      <option value="F8">F8 Key</option>
                      <option value="p">Letter key 'P'</option>
                      <option value="`">Grave Accent key '`'</option>
                    </select>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-2">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold block">Panic Destination Redirect</label>
                    <input
                      type="text"
                      value={panicRedirectUrl}
                      onChange={(e) => { setPanicRedirectUrl(e.target.value); localStorage.setItem('genizy_panic_url', e.target.value); }}
                      className="w-full bg-zinc-900 border border-zinc-800 text-xs p-2.5 rounded-lg text-zinc-300 focus:outline-none"
                    />
                    <div className="flex gap-1.5 pt-1 overflow-x-auto">
                      {(['https://classroom.google.com', 'https://google.com', 'https://en.wikipedia.org/wiki/Algebra'] as const).map(u => (
                        <button
                          key={u}
                          onClick={() => { setPanicRedirectUrl(u); playSound('click', isAudioMuted); }}
                          className="text-[8px] bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white p-1 px-2 rounded uppercase cursor-pointer shrink-0"
                        >
                          {u.includes('classroom') ? 'Google Classroom' : u.includes('google') ? 'Google Search' : 'Algebra wiki'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. saved Favorites */}
              {settingsTab === 'favorites' && (
                <div className="space-y-4 font-sans text-white">
                  <h4 className="text-xs font-bold uppercase text-rose-400 font-mono">Your Saved Bookmarks</h4>
                  {favoritedList.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {favoritedList.map(game => (
                        <div key={game.id} className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl flex items-center justify-between gap-3">
                          <span className="text-xs font-bold text-white font-mono uppercase truncate">{game.title}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => { setRunningGame(game); setShowSettingsModal(false); playSound('click', isAudioMuted); }}
                              className="bg-[#ff5a5a] text-white p-1 px-3 rounded text-[10px] font-bold uppercase font-mono"
                            >
                              Launch
                            </button>
                            <button
                              onClick={(e) => toggleFavorite(game.id, e)}
                              className="text-zinc-500 hover:text-rose-400 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 leading-normal font-mono">No favorited coordinates bookmarks recorded yet. Click the heart icons on cards to save.</p>
                  )}
                </div>
              )}

              {/* 5. security FAQ */}
              {settingsTab === 'faq' && (
                <div className="space-y-4 font-mono text-xs text-zinc-400 leading-relaxed font-sans text-white">
                  <div className="space-y-1">
                    <h5 className="text-white font-bold text-rose-400 uppercase">What is about:blank cloaking?</h5>
                    <p>It opens the frame under the special browser process named "about:blank". This leaves school logging filters checking browser history blind to actual coordinate activity.</p>
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-white font-bold text-[#ff5a5a] uppercase">Bypass Rating</h5>
                    <p>Rating status: <b>SECURE</b>. Completely local, cookie-safe, zero server logging vectors.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 bg-zinc-950 border-t border-zinc-900 text-center font-mono text-[10px] text-zinc-500 select-none">
              GN-MATH CLONED PLATFORM V3.0 • AUTHORIZED: ATHARV
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
