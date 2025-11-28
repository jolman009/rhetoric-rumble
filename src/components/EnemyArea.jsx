import HealthBar from './HealthBar';

const EnemyArea = ({ enemy }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="mb-4">
                <HealthBar current={enemy.hp} max={100} label={enemy.name} />
            </div>
            <div className="w-48 h-48 bg-red-900 rounded-full flex items-center justify-center border-4 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                <span className="text-6xl">👹</span>
            </div>
            <div className="mt-4 text-slate-300 italic">"{enemy.dialogue}"</div>
        </div>
    );
};

export default EnemyArea;
