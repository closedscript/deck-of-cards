'use client';

import { useEffect, useState } from "react";

export default function MauMauGame() {
  const [deckId, setDeckId] = useState(null);
  const [newCards, setNewCards] = useState([]);

  useEffect(() => {
    fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
        .then((response) => response.json())
        .then((data) => {
          setDeckId(data.deck_id);
          console.log("Deck ID:", data.deck_id);
        })
        .catch((error) => {
          console.error("Fehler beim Laden des Decks:", error);
        });
  }, []);

  const getNewCard = () => {
    if (!deckId) return;

    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=3`)
        .then((response) => response.json())
        .then((data) => {
          setNewCards(data.cards);
        })
        .catch((error) => {
          console.error("Fehler beim Ziehen der Karten:", error);
        });
  };

  return (
      <>
        <button onClick={getNewCard}>
          Karte holenesvdvsdvsddsv
        </button>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          {newCards.map((card) => (
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
