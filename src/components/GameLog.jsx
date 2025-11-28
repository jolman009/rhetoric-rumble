const GameLog = ({ logs }) => {
    return (
        <div className="bg-slate-900 border border-slate-700 rounded p-4 h-32 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
                <div className="text-slate-500">Battle started...</div>
            ) : (
                logs.map((log, index) => (
                    <div key={index} className="mb-1 text-slate-300">
                        <span className="text-slate-500">[{log.turn}]</span> {log.message}
                    </div>
                ))
            )}
        </div>
    );
};

export default GameLog;
