const HealthBar = ({ current, max, label }) => {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));

    return (
        <div className="w-full max-w-md">
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-slate-200">{label}</span>
                <span className="text-sm font-medium text-slate-200">{current}/{max} HP</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-4">
                <div
                    className="bg-red-600 h-4 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default HealthBar;
