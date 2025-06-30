export default function DealerHand({ cards, hiddenCard, score, showHidden }) {
    return (
        <>
            <div className="scoreboard" style={{ marginTop: '2rem' }}>
                <strong>Dealer Punktzahl: {score}</strong>
            </div>
            <div className="card-row">
                {cards.map((card, idx) => (
                    <img key={card.code + idx} src={card.image} alt={`${card.value} of ${card.suit}`} width={100} />
                ))}
                {!showHidden && hiddenCard && (
                    <img src="https://deckofcardsapi.com/static/img/back.png" alt="Verdeckte Karte" width={100} />
                )}
            </div>
        </>
    );
}
