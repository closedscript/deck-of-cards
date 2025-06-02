'use client';
import "./blackjack.css";

import { useEffect, useState } from "react";

export default function BlackJackGame() {
    const [deck, setDeck] = useState([]);
    const [deckId, setDeckId] = useState("");
    const [playerCards, setPlayerCards] = useState([]);
    const [dealerCards, setDealerCards] = useState([]);
    const [playerScore, setPlayerScore] = useState(0);
    const [dealerScore, setDealerScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [playerStand, setPlayerStand] = useState(false);
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(true);
    const [money, setMoney] = useState(1000);
    const [bet, setBet] = useState(0);
    const [betPlaced, setBetPlaced] = useState(false);

    useEffect(() => {
        fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6")
            .then((response) => response.json())
            .then((data) => {
                setDeckId(data.deck_id);
                fetch(`https://deckofcardsapi.com/api/deck/${data.deck_id}/draw/?count=312`)
                    .then((response) => response.json())
                    .then((data) => {
                        setDeck(data.cards);
                        setLoading(false);
                    });
            })
            .catch((error) => {
                console.error("Fehler beim Initialisieren des Decks:", error);
            });
    }, []);

    const calculateCardValue = (card, currentScore) => {
        if (["KING", "QUEEN", "JACK"].includes(card.value)) {
            return 10;
        } else if (card.value === "ACE") {
            return currentScore + 11 > 21 ? 1 : 11;
        } else {
            return parseInt(card.value, 10);
        }
    };

    const drawRandomCard = (setCards, setScore, currentScore) => {
        if (deck.length === 0) {
            console.error("Keine Karten mehr im Deck!");
            return currentScore;
        }

        const randomIndex = Math.floor(Math.random() * deck.length);
        const card = deck[randomIndex];

        setDeck((prevDeck) => prevDeck.filter((_, index) => index !== randomIndex));
        setCards((prevCards) => [...prevCards, card]);

        const cardValue = calculateCardValue(card, currentScore);
        const newScore = currentScore + cardValue;

        setScore(newScore);
        return newScore;
    };

    const drawPlayerCard = () => {
        if (!gameOver && !playerStand && betPlaced) {
            const newScore = drawRandomCard(setPlayerCards, setPlayerScore, playerScore);
            if (newScore > 21) {
                setGameOver(true);
                setResult("Bust! Du hast verloren.");
            }
        }
    };

    const handleStand = () => {
        if (!betPlaced) return;

        setPlayerStand(true);
        let dealerCurrentScore = dealerScore;

        const drawDealerCards = () => {
            if (dealerCurrentScore < 17) {
                dealerCurrentScore = drawRandomCard(setDealerCards, setDealerScore, dealerCurrentScore);
                setTimeout(drawDealerCards, 1000);
            } else {
                setGameOver(true);

                if (dealerCurrentScore > 21) {
                    setResult("Dealer Bust! Du hast gewonnen.");
                    setMoney(prev => prev + bet * 2);
                } else if (playerScore > dealerCurrentScore) {
                    setResult("Du hast gewonnen!");
                    setMoney(prev => prev + bet * 2);
                } else if (playerScore < dealerCurrentScore) {
                    setResult("Du hast verloren.");
                    // Kein Geld zurück
                } else {
                    setResult("Unentschieden!");
                    setMoney(prev => prev + bet); // Einsatz zurück
                }
            }
        };

        drawDealerCards();
    };

    const placeBet = (amount) => {
        if (money >= amount && !betPlaced && !loading) {
            setMoney(prev => prev - amount);
            setBet(amount);
            setBetPlaced(true);
        }
    };

    const startNewGame = () => {
        setLoading(true);
        fetch(`https://deckofcardsapi.com/api/deck/${deckId}/shuffle/?remaining=true`)
            .then((response) => response.json())
            .then(() => {
                setPlayerCards([]);
                setDealerCards([]);
                setPlayerScore(0);
                setDealerScore(0);
                setGameOver(false);
                setPlayerStand(false);
                setResult("");
                setBet(0);
                setBetPlaced(false);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Fehler beim Mischen des Decks:", error);
                setLoading(false);
            });
    };

    return (
        <div className="game-area">
            <h1>Blackjack</h1>

            <p>Geld: {money} €</p>
            <p>Einsatz: {bet} €</p>

            <div>
                <button onClick={drawPlayerCard} disabled={gameOver || playerStand || loading || !betPlaced}>
                    Karte ziehen
                </button>
                <button onClick={handleStand} disabled={gameOver || playerStand || loading || !betPlaced}>
                    Stand
                </button>
                <button onClick={startNewGame} disabled={!gameOver || loading}>
                    Neues Spiel starten
                </button>
            </div>

            <div className="scoreboard">
                <strong>Deine Punktzahl: {playerScore}</strong>
                {gameOver && <div className="result">{result}</div>}
            </div>

            <div className="card-row">
                {playerCards.map((card) => (
                    <img
                        key={card.code}
                        src={card.image}
                        alt={`${card.value} of ${card.suit}`}
                        width={100}
                    />
                ))}
            </div>

            {playerStand && (
                <>
                    <div className="scoreboard" style={{ marginTop: "2rem" }}>
                        <strong>Dealer Punktzahl: {dealerScore}</strong>
                    </div>

                    <div className="card-row">
                        {dealerCards.map((card) => (
                            <img
                                key={card.code}
                                src={card.image}
                                alt={`${card.value} of ${card.suit}`}
                                width={100}
                            />
                        ))}
                    </div>
                </>
            )}

            <br />
            <div>
                <button onClick={() => placeBet(5)} disabled={betPlaced || loading || money < 5}>5.- CHF</button>
                <button onClick={() => placeBet(10)} disabled={betPlaced || loading || money < 10}>10.- CHF</button>
                <button onClick={() => placeBet(50)} disabled={betPlaced || loading || money < 50}>50.- CHF</button>
                <button onClick={() => placeBet(100)} disabled={betPlaced || loading || money < 100}>100.- CHF</button>
            </div>
        </div>
    );
}
