'use client';

import { useEffect, useState } from "react";

export default function BlackJackGame() {
    const [deck, setDeck] = useState([]); // Speichert alle Karten aus 6 Decks
    const [drawnCards, setDrawnCards] = useState([]); // Gezogene Karten
    const [score, setScore] = useState(0); // Punktzahl
    const [gameOver, setGameOver] = useState(false); // Spielstatus

    // 6 Decks ziehen und mischen
    useEffect(() => {
        fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6")
            .then((response) => response.json())
            .then((data) => {
                fetch(`https://deckofcardsapi.com/api/deck/${data.deck_id}/draw/?count=312`)
                    .then((response) => response.json())
                    .then((data) => {
                        setDeck(data.cards); // Karten lokal speichern
                    });
            })
            .catch((error) => {
                console.error("Fehler beim Initialisieren des Decks:", error);
            });
    }, []);

    // Kartenwert berechnen
    const calculateCardValue = (card) => {
        if (["KING", "QUEEN", "JACK"].includes(card.value)) {
            return 10;
        } else if (card.value === "ACE") {
            return score + 11 > 21 ? 1 : 11; // Ass als 1 oder 11
        } else {
            return parseInt(card.value, 10);
        }
    };

    // Zufällige Karte ziehen
    const drawRandomCard = () => {
        if (deck.length === 0 || gameOver) {
            console.error("Keine Karten mehr oder Spiel vorbei!");
            return;
        }

        const randomIndex = Math.floor(Math.random() * deck.length);
        const card = deck[randomIndex];

        setDeck((prevDeck) => prevDeck.filter((_, index) => index !== randomIndex));
        setDrawnCards((prevCards) => [...prevCards, card]);

        const cardValue = calculateCardValue(card);
        const newScore = score + cardValue;

        setScore(newScore);

        // Prüfen, ob Punktzahl > 21
        if (newScore > 21) {
            setGameOver(true);
        }
    };

    return (
        <>
            <button onClick={drawRandomCard} disabled={gameOver}>
                {gameOver ? "Spiel vorbei" : "Karte ziehen"}
            </button>

            <div style={{ marginTop: "1rem" }}>
                <strong>Deine Punktzahl: {score}</strong>
                {gameOver && <p style={{ color: "red" }}>Bust! Du hast über 21 Punkte.</p>}
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                {drawnCards.map((card) => (
                    <img
                        key={card.code}
                        src={card.image}
                        alt={`${card.value} of ${card.suit}`}
                        width={100}
                    />
                ))}
            </div>
        </>
    );
}