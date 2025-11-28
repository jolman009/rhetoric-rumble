import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'
import EnemyArea from './components/EnemyArea'
import PlayerArea from './components/PlayerArea'
import GameLog from './components/GameLog'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import { cards } from './data/cards'

// Game Component
const Game = ({ user }) => {
  // Game State
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
  const [turn, setTurn] = useState("player"); // "player" | "enemy" | "game_over"
  const [logs, setLogs] = useState([
    { turn: "System", message: "Battle started against The Internet Troll!" }
  ]);

  // Initial Hand
  const [hand, setHand] = useState(cards.slice(0, 3));

  const enemy = {
    id: "enemy_01",
    name: "The Internet Troll",
    weakness: "Logos",
    resistance: "Pathos",
    hp: enemyHP,
    dialogue: "U mad bro?"
  };

  // Save Game Result
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

  // Helper: Add to Log
  const addLog = (turn, message) => {
    setLogs(prev => [{ turn, message }, ...prev]);
  };

  // Helper: Calculate Damage
  const calculateDamage = (cardType, baseDamage) => {
    let multiplier = 1;
    let message = "";

    if (cardType === "Logos") {
      multiplier = 1.5;
      message = " (Super Effective!)";
    } else if (cardType === "Pathos") {
      multiplier = 0.5;
      message = " (Not Effective...)";
    }

    return { damage: Math.floor(baseDamage * multiplier), message };
  };

  // Player Turn Handler
  const handleCardPlay = (card) => {
    if (turn !== "player") return;

    const { damage, message } = calculateDamage(card.type, card.damage);

    setEnemyHP(prev => Math.max(0, prev - damage));
    addLog("Player", `Used ${card.name} for ${damage} damage!${message}`);

    // Check Win Condition
    if (enemyHP - damage <= 0) {
      setEnemyHP(0);
      setTurn("game_over");
      addLog("System", "You defeated The Internet Troll!");
      saveGameResult("player");
      return;
    }

    setTurn("enemy");
  };

  // Enemy AI Turn Handler
  useEffect(() => {
    if (turn === "enemy") {
      const timer = setTimeout(() => {
        const damage = Math.floor(Math.random() * 11) + 10;

        setPlayerHP(prev => Math.max(0, prev - damage));
        addLog("Enemy", `The Troll attacks for ${damage} damage!`);

        // Check Loss Condition
        if (playerHP - damage <= 0) {
          setPlayerHP(0);
          setTurn("game_over");
          addLog("System", "You were defeated...");
          saveGameResult("enemy");
        } else {
          setTurn("player");
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [turn, playerHP, enemyHP]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header with Sign Out */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20 pointer-events-none">
        <div className="text-slate-500 text-sm pointer-events-auto flex gap-4 items-center">
          <span>Playing as: {user.email}</span>
          <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 underline">Teacher Dashboard</Link>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded text-sm pointer-events-auto transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Top: Enemy Area */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 relative">
        <EnemyArea enemy={enemy} />

        {/* Turn Indicator */}
        <div className="absolute top-4 right-4 text-xl font-bold text-slate-500">
          Turn: <span className={turn === "player" ? "text-blue-400" : "text-red-400"}>{turn.toUpperCase()}</span>
        </div>
      </div>

      {/* Middle: Game Log / Arena */}
      <div className="absolute top-1/2 left-4 w-80 z-10">
        <GameLog logs={logs} />
      </div>

      {/* Bottom: Player Area */}
      <div className={`mt-auto transition-opacity duration-500 ${turn !== "player" ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        <PlayerArea hand={hand} hp={playerHP} onCardPlay={handleCardPlay} />
      </div>
    </div>
  );
};

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
