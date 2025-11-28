import Card from './Card';
import HealthBar from './HealthBar';

const PlayerArea = ({ hand, hp, onCardPlay }) => {
    return (
        <div className="w-full bg-slate-800 p-6 border-t border-slate-700">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex justify-center">
                    <HealthBar current={hp} max={100} label="Player" />
                </div>

                <div className="flex justify-center gap-4 overflow-x-auto pb-4">
                    {hand.map((card) => (
                        <Card key={card.id} card={card} onClick={onCardPlay} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PlayerArea;
