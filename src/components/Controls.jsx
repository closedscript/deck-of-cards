export default function Controls({ onHit, onStand, onNewGame, onBet, betPlaced, loading, money, gameOver, playerStand }) {
    return (
        <div>
            <button onClick={onHit} disabled={gameOver || playerStand || loading || !betPlaced}>
                Karte ziehen
            </button>
            <button onClick={onStand} disabled={gameOver || playerStand || loading || !betPlaced}>
                Stand
            </button>
            <button onClick={onNewGame} disabled={!gameOver || loading}>
                Neues Spiel starten
            </button>

            <br /><br />
            <button onClick={() => onBet(5)} disabled={betPlaced || loading || money < 5}>5.- CHF</button>
            <button onClick={() => onBet(10)} disabled={betPlaced || loading || money < 10}>10.- CHF</button>
            <button onClick={() => onBet(50)} disabled={betPlaced || loading || money < 50}>50.- CHF</button>
            <button onClick={() => onBet(100)} disabled={betPlaced || loading || money < 100}>100.- CHF</button>
        </div>
    );
}
