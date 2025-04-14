'use client';

        import { useEffect, useState } from "react";

        export default function BlackJackGame() {
          const [deck, setDeck] = useState([]); // Stores all cards from 6 decks
          const [drawnCards, setDrawnCards] = useState([]); // Stores cards drawn during the game

          // Fetch and shuffle 6 decks at the start
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

          // Draw a random card from the local deck
          const drawRandomCard = () => {
            if (deck.length === 0) {
              console.error("No cards left in the deck!");
              return;
            }

            const randomIndex = Math.floor(Math.random() * deck.length);
            const card = deck[randomIndex];

            // Remove the drawn card from the deck
            setDeck((prevDeck) => prevDeck.filter((_, index) => index !== randomIndex));
            setDrawnCards((prevCards) => [...prevCards, card]);
          };

          return (
            <>
              <button onClick={drawRandomCard}>
                Karte ziehen
              </button>

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