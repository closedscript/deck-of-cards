export default function PlayerHand({playerCards = [], score}) {
    return (
        <>
            <div className="scoreboard">
                <strong>Deine Punktzahl: {score}</strong>
            </div>
            <div className="card-row">
                {playerCards.map((card, idx) => {
                    if (!card) return null;
                    return (
                        <img
                            key={card.code + idx}
                            src={card.image}
                            alt={`${card.value} of ${card.suit}`}
                            width={100}
                        />
                    );
                })}
            </div>
        </>
    );
}
