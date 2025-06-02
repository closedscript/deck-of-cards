'use client';
import "./blackjack.css"

import {useEffect, useState} from "react";

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

    useEffect(() => {
        fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6")
            .then((response) => response.json())
            .then((data) => {
                setDeckId(data.deck_id); // Speichere die Deck-ID
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
        console.log("gameOver", gameOver);
        console.log("loading", loading);
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
            return;
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
        if (!gameOver && !playerStand) {
            const newScore = drawRandomCard(setPlayerCards, setPlayerScore, playerScore);
            if (newScore > 21) {
                setGameOver(true);
                setResult("Bust! Du hast verloren.");
            }
        }
    };

    const handleStand = () => {
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
                } else if (playerScore > dealerCurrentScore) {
                    setResult("Du hast gewonnen!");
                } else if (playerScore < dealerCurrentScore) {
                    setResult("Du hast verloren.");
                } else {
                    setResult("Unentschieden!");
                }
            }
        };

        drawDealerCards();
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

            <div>
                <button onClick={drawPlayerCard} disabled={gameOver || playerStand || loading}>
                    Karte ziehen
                </button>
                <button onClick={handleStand} disabled={gameOver || playerStand || loading}>
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
                    <div className="scoreboard" style={{marginTop: "2rem"}}>
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
        </div>
    );
}