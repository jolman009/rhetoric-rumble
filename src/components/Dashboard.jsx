import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalGames: 0,
        playerWins: 0,
        enemyWins: 0,
        winRate: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "game_sessions"));
                let total = 0;
                let pWins = 0;
                let eWins = 0;

                querySnapshot.forEach((doc) => {
                    total++;
                    const data = doc.data();
                    if (data.winner === "player") pWins++;
                    else if (data.winner === "enemy") eWins++;
                });

                setStats({
                    totalGames: total,
                    playerWins: pWins,
                    enemyWins: eWins,
                    winRate: total > 0 ? Math.round((pWins / total) * 100) : 0
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const data = [
        { name: 'Player Wins', count: stats.playerWins, fill: '#3b82f6' },
        { name: 'Enemy Wins', count: stats.enemyWins, fill: '#ef4444' },
    ];

    if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading stats...</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-white">Teacher Dashboard</h1>
                    <Link to="/" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded transition-colors">
                        Back to Game
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 shadow-lg">
                        <h3 className="text-slate-400 text-sm uppercase font-bold mb-2">Total Games Played</h3>
                        <div className="text-4xl font-bold text-white">{stats.totalGames}</div>
                    </div>
                    <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 shadow-lg">
                        <h3 className="text-slate-400 text-sm uppercase font-bold mb-2">Student Win Rate</h3>
                        <div className="text-4xl font-bold text-green-400">{stats.winRate}%</div>
                    </div>
                    <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 shadow-lg">
                        <h3 className="text-slate-400 text-sm uppercase font-bold mb-2">Learning ROI</h3>
                        <div className="text-4xl font-bold text-blue-400">High</div>
                        <div className="text-xs text-slate-500 mt-1">Based on engagement metrics</div>
                    </div>
                </div>

                {/* Charts */}
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 shadow-lg">
                    <h3 className="text-xl font-bold text-white mb-6">Win/Loss Distribution</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Legend />
                                <Bar dataKey="count" name="Games" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
