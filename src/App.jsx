import { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'
import EnemyArea from './components/EnemyArea'
import PlayerArea from './components/PlayerArea'
import GameLog from './components/GameLog'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import { cards } from './data/cards'

// --- Game Component ---
const Game = ({ user }) => {
  // 1. Game State
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
  const [turn, setTurn] = useState("player"); // "player" | "enemy" | "game_over"

  // New: Energy System
  const maxEnergy = 3;
  const [currentEnergy, setCurrentEnergy] = useState(maxEnergy);

  const [logs, setLogs] = useState([
    { turn: "System", message: "Battle started! You have 3 Energy." }
  ]);

  // Initial Hand (Taking first 3 cards for demo)
  const [hand, setHand] = useState(cards.slice(0, 3));

  const enemy = {
    id: "enemy_01",
    name: "The Internet Troll",
    weakness: "Logos",
    resistance: "Pathos",
    hp: enemyHP,
    dialogue: "U mad bro?"
  };

  // 2. Helper Functions
  const addLog = (turn, message) => {
    setLogs(prev => [{ turn, message }, ...prev]);
  };

  const saveGameResult = async (winner) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "game_sessions"), {
        userId: user.uid,
        userEmail: user.email,
        winner: winner,
        finalPlayerHP: playerHP,
        timestamp: serverTimestamp()
      });
      console.log("Game saved!");
    } catch (error) {
      console.error("Error saving game:", error);
    }
  };

  // 3. Turn Management
  const handleEndTurn = () => {
    if (turn !== "player") return;
    setTurn("enemy");
    // Enemy AI will trigger automatically via the useEffect below
  };

  // 4. Core Card Mechanics
  const handleCardPlay = (card) => {
    // A. Validation
    if (turn !== "player") return;
    if (currentEnergy < card.cost) {
      addLog("System", `Not enough Energy! This card costs ${card.cost}.`);
      return;
    }

    // B. Pay Cost
    setCurrentEnergy(prev => prev - card.cost);

    // C. Calculate Damage (Rock-Paper-Scissors Logic)
    let damage = card.damage;
    let message = "";

    // Logic: Logos > Ethos > Pathos > Logos
    if (card.type === "Logos" && enemy.weakness === "Logos") {
      damage = Math.floor(damage * 1.5);
      message = " (Critical Hit!)";
    } else if (card.type === "Pathos" && enemy.resistance === "Pathos") {
      damage = Math.floor(damage * 0.5);
      message = " (Resisted...)";
    }

    // D. Apply Damage & Special Effects
    setEnemyHP(prev => Math.max(0, prev - damage));
    addLog("Player", `Used ${card.name} for ${damage} damage!${message}`);

    // Trigger Special Effects
    if (card.specialEffect === "heal_10_hp") {
      setPlayerHP(prev => Math.min(100, prev + 10));
      addLog("Effect", "Restored 10 HP.");
    } else if (card.specialEffect === "restore_confidence") {
      setCurrentEnergy(prev => Math.min(maxEnergy, prev + 1));
      addLog("Effect", "Regained 1 Energy.");
    }

    // E. Check Win Condition
    if (enemyHP - damage <= 0) {
      setEnemyHP(0);
      setTurn("game_over");
      addLog("System", "VICTORY! You defeated The Troll.");
      saveGameResult("player");
    }
  };

  // 5. Enemy AI & Turn Reset
  useEffect(() => {
    if (turn === "enemy") {
      const timer = setTimeout(() => {
        // Enemy Logic: Random Attack
        const damage = Math.floor(Math.random() * 10) + 5;

        setPlayerHP(prev => Math.max(0, prev - damage));
        addLog("Enemy", `The Troll attacks for ${damage} damage!`);

        // Check Loss Condition
        if (playerHP - damage <= 0) {
          setPlayerHP(0);
          setTurn("game_over");
          addLog("System", "DEFEAT... You lost the argument.");
          saveGameResult("enemy");
        } else {
          // Pass turn back to player AND Refill Energy
          setTurn("player");
          setCurrentEnergy(maxEnergy);
          addLog("System", "Your turn! Energy refilled.");
        }
      }, 2000); // 2 second delay for dramatic effect

      return () => clearTimeout(timer);
    }
  }, [turn, playerHP, enemyHP]);

  // --- Render ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">

      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20">
        <div className="text-slate-500 text-sm flex gap-4 items-center">
          <span>Playing as: {user.email}</span>
          <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 underline">Teacher Dashboard</Link>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Main Battle Area */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 relative">
        <EnemyArea enemy={enemy} />

        {/* HUD: Turn & Energy Indicator */}
        <div className="absolute top-16 right-8 text-right bg-slate-900/50 p-4 rounded-lg backdrop-blur-sm border border-slate-700">
          <div className="text-xl font-bold text-slate-400 uppercase tracking-widest text-xs mb-1">Current Turn</div>
          <div className={`text-2xl font-bold ${turn === "player" ? "text-blue-400" : "text-red-400"}`}>
            {turn.toUpperCase()}
          </div>

          <div className="mt-4 text-xl font-bold text-slate-400 uppercase tracking-widest text-xs mb-1">Energy</div>
          <div className="text-3xl font-bold text-yellow-400 flex items-center justify-end gap-2">
            <span>⚡</span> {currentEnergy} / {maxEnergy}
          </div>
        </div>
      </div>

      {/* Game Logs */}
      <div className="absolute top-1/2 left-4 w-80 z-10 shadow-2xl">
        <GameLog logs={logs} />
      </div>

      {/* Player Controls Area */}
      <div className={`mt-auto bg-slate-900 border-t border-slate-700 transition-all duration-500 ${turn !== "player" ? "opacity-75 grayscale" : "opacity-100"}`}>
        <div className="max-w-5xl mx-auto p-6">

          {/* Control Bar: HP & End Turn */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-white font-bold text-xl">Player HP: {playerHP}/100</div>
            <button
              onClick={handleEndTurn}
              disabled={turn !== "player"}
              className={`px-8 py-3 rounded-lg font-bold shadow-lg transition-all transform hover:scale-105 ${turn === "player"
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-slate-700 text-slate-500 cursor-not-allowed"
                }`}
            >
              {turn === "player" ? "End Turn" : "Enemy Thinking..."}
            </button>
          </div>

          {/* Cards Hand */}
          <div className={turn !== "player" ? "pointer-events-none" : ""}>
            <PlayerArea
              hand={hand}
              hp={playerHP}
              onCardPlay={handleCardPlay}
              currentEnergy={currentEnergy}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- App Component (Auth Wrapper) ---
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>;
  if (!user) return <Login />;

  return (
    <Routes>
      <Route path="/" element={<Game user={user} />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;