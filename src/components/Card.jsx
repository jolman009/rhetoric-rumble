const Card = ({ card, onClick }) => {
    return (
        <div
            onClick={() => onClick(card)}
            className="bg-white border-2 border-slate-300 rounded-lg p-4 w-48 h-64 shadow-lg hover:scale-105 transition-transform cursor-pointer flex flex-col justify-between"
        >
            <div className="font-bold text-lg text-slate-800">{card.name}</div>
            <div className="text-sm text-slate-600 italic">"{card.text}"</div>
            <div className="mt-2">
                <div className="text-xs font-bold text-blue-600 uppercase">{card.type}</div>
                <div className="flex justify-between mt-2 text-sm font-semibold">
                    <span className="text-red-500">DMG: {card.damage}</span>
                    <span className="text-yellow-600">Cost: {card.cost}</span>
                </div>
            </div>
        </div>
    );
};

export default Card;
