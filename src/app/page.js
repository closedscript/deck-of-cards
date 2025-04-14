'use client';

import {useEffect, useState} from "react";

export default function BlackJackGame() {
    const [deck, setDeck] = useState([]); // Stores all cards from 6 decks
    const [drawnCards, setDrawnCards] = useState([]); // Stores cards drawn during the game
    const [score, setScore] = useState(0); // Stores the total score

    // 6 decks ziehen und mischen
    useEffect(() => {
        fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6")
            .then((response) => response.json())
            .then((data) => {
                fetch(`https://deckofcardsapi.com/api/deck/${data.deck_id}/draw/?count=312`) // 6 decks = 312 cards
                    .then((response) => response.json())
                    .then((data) => {
                        setDeck(data.cards); // Store all cards locally
                    });
            })
            .catch((error) => {
                console.error("Error initializing the deck:", error);
            });
    }, []);

    // Wert der Karte berechnen
    const calculateCardValue = (card) => {
        if (["KING", "QUEEN", "JACK"].includes(card.value)) {
            return 10;
        } else if (card.value === "ACE") {
            return card.value === "ACE" && score + 11 > 21 ? 1 : 11; // Handle Ace as 1 if score exceeds 21
        } else {
            return parseInt(card.value, 10);
        }
    };

    // Random Karte von Decks ziehen
    const drawRandomCard = () => {
        if (deck.length === 0) {
            console.error("No cards left in the deck!");
            return;
        }

        const randomIndex = Math.floor(Math.random() * deck.length);
        const card = deck[randomIndex];

        setDeck((prevDeck) => prevDeck.filter((_, index) => index !== randomIndex));
        setDrawnCards((prevCards) => [...prevCards, card]);

        setScore((prevScore) => prevScore + calculateCardValue(card));
    };

    return (
        <>
            <button onClick={drawRandomCard}>
                Draw Card
            </button>

            <div style={{marginTop: "1rem"}}>
                <strong>Total Score: {score}</strong>
            </div>

            <div style={{display: "flex", gap: "1rem", marginTop: "1rem"}}>
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