export default function PlayerHand({ cards, score, result, gameOver }) {
    return (
        <>
            <div className="scoreboard">
                <strong>Deine Punktzahl: {score}</strong>
                {gameOver && <div className="result">{result}</div>}
            </div>
            <div className="card-row">
                {cards.map((card, idx) => (
                    <img key={card.code + idx} src={card.image} alt={`${card.value} of ${card.suit}`} width={100} />
                ))}
            </div>
        </>
    );
}
