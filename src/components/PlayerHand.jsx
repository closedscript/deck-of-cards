export default function PlayerHand({ playerCards = [], score, result, gameOver }) {
    return (
        <>
            <div className="scoreboard">
                {gameOver && result && (
                    <div className="result">
                        <strong><i>{result}</i></strong>
                    </div>
                )}
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