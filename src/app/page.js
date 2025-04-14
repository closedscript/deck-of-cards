'use client';

                   import { useEffect, useState } from "react";

                   export default function BlackJackGame() {
                       const [deck, setDeck] = useState([]); // Speichert alle Karten aus 6 Decks
                       const [playerCards, setPlayerCards] = useState([]); // Spieler-Karten
                       const [dealerCards, setDealerCards] = useState([]); // Dealer-Karten
                       const [playerScore, setPlayerScore] = useState(0); // Spieler-Punktzahl
                       const [dealerScore, setDealerScore] = useState(0); // Dealer-Punktzahl
                       const [gameOver, setGameOver] = useState(false); // Spielstatus
                       const [playerStand, setPlayerStand] = useState(false); // Spieler hat gestanden
                       const [result, setResult] = useState(""); // Ergebnis des Spiels

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
                       const calculateCardValue = (card, currentScore) => {
                           if (["KING", "QUEEN", "JACK"].includes(card.value)) {
                               return 10;
                           } else if (card.value === "ACE") {
                               return currentScore + 11 > 21 ? 1 : 11; // Ass als 1 oder 11
                           } else {
                               return parseInt(card.value, 10);
                           }
                       };

                       // Zufällige Karte ziehen
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

                       // Spieler-Karte ziehen
                       const drawPlayerCard = () => {
                           if (!gameOver && !playerStand) {
                               const newScore = drawRandomCard(setPlayerCards, setPlayerScore, playerScore);
                               if (newScore > 21) {
                                   setGameOver(true);
                                   setResult("Bust! Du hast verloren.");
                               }
                           }
                       };

                       // Spieler steht
                       const handleStand = () => {
                           setPlayerStand(true);
                           // Dealer zieht Karten mit Verzögerung
                           let dealerCurrentScore = dealerScore;

                           const drawDealerCards = () => {
                               if (dealerCurrentScore < 17) {
                                   dealerCurrentScore = drawRandomCard(setDealerCards, setDealerScore, dealerCurrentScore);
                                   setTimeout(drawDealerCards, 1000); // 1 Sekunde Verzögerung
                               } else {
                                   setGameOver(true); // Spielende nach Dealer-Zug
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

                       return (
                           <>
                               <div>
                                   <button onClick={drawPlayerCard} disabled={gameOver || playerStand}>
                                       Karte ziehen
                                   </button>
                                   <button onClick={handleStand} disabled={gameOver || playerStand}>
                                       Stand
                                   </button>
                               </div>

                               <div style={{ marginTop: "1rem" }}>
                                   <strong>Deine Punktzahl: {playerScore}</strong>
                                   {gameOver && <p style={{ color: "red" }}>{result}</p>}
                               </div>

                               <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
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
                                       <div style={{ marginTop: "2rem" }}>
                                           <strong>Dealer Punktzahl: {dealerScore}</strong>
                                       </div>

                                       <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
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
                           </>
                       );
                   }