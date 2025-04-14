'use client';

import { useEffect, useState } from "react";

export default function MauMauGame() {
  const [deckId, setDeckId] = useState(null);
  const [newCards, setNewCards] = useState([]);

  const [playerHand, setPlayerHand] = useState([])
  const [dealerHand, setDealerHand] = useState([])

    useEffect(() => {
    fetch("https://deckofcardsapi.com/api/deck/new/")
        .then((response) => response.json())
        .then((data) => {
          setDeckId(data.deck_id);
          console.log("Deck ID:", data.deck_id);
        })
        .catch((error) => {
          console.error("Fehler beim Laden des Decks:", error);
        });

    fetch("https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=3")
        .then((response) => response.json())
        .then((data) => {
            setDealerHand(data.cards);
          console.log("Deck ID:", data.cards);
        })
        .catch((error) => {
          console.error("Fehler beim Laden des Decks:", error);
        });

  }, []);

  const getNewCard = () => {
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
          <div className={'dealer'}>
              <p className={'name'}>Dealer</p>
              <button onClick={getNewCard}>
                  Karte holenesvdvsdvsddsv
              </button>
              {dealerHand.length > 0 && (
                  <div style={{display: "flex", gap: "1rem", marginTop: "1rem"}}>
                      {dealerHand.map((card) => (
                          <img
                              key={card.code}
                              src={card.image}
                              alt={`${card.value} of ${card.suit}`}
                              width={100}
                          />
                      ))}
                  </div>
              )}


          </div>

          <div className={'player'}>
              <p className={'name'}>Player</p>

              <div style={{display: "flex", gap: "1rem", marginTop: "1rem"}}>
                  {deckId.map((card) => (
                      <img
                          key={card.code}
                          src={card.image}
                          alt={`${card.value} of ${card.suit}`}
                          width={100}
                      />
                  ))}
              </div>
          </div>
      </>
  );
}
