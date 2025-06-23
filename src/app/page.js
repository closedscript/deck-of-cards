'use client';
import "./blackjack.css";
import { useEffect, useState } from "react";

// TODO RHo: Karten besser gemischt

export default function BlackJackGame() {
    const [deckId, setDeckId] = useState("");
    const [deck, setDeck] = useState([]);
    const [playerCards, setPlayerCards] = useState([]);
    const [dealerCards, setDealerCards] = useState([]);
    const [dealerHiddenCard, setDealerHiddenCard] = useState(null);
    const [playerScore, setPlayerScore] = useState(0);
    const [dealerScore, setDealerScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [playerStand, setPlayerStand] = useState(false);
    const [result, setResult] = useState("");
    const [money, setMoney] = useState(1000);
    const [bet, setBet] = useState(0);
    const [betPlaced, setBetPlaced] = useState(false);
    const [loading, setLoading] = useState(true);

    const drawCard = () => {
        if (deck.length === 0) return null;
        const card = deck[0];
        setDeck(deck.slice(1));
        return card;
    };

    const calculateHandValue = (cards) => {
        let score = 0;
        let aces = 0;
        for (const card of cards) {
            if (!card) continue;
            if (["KING", "QUEEN", "JACK"].includes(card.value)) score += 10;
            else if (card.value === "ACE") {
                aces += 1;
                score += 11;
            } else {
                score += Number(card.value);
            }
        }
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        return score;
    };

    useEffect(() => {
        async function initDeck() {
            setLoading(true);
            try {
                const res1 = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
                const data1 = await res1.json();
                setDeckId(data1.deck_id);

                const res2 = await fetch(`https://deckofcardsapi.com/api/deck/${data1.deck_id}/draw/?count=312`);
                const data2 = await res2.json();
                setDeck(data2.cards);
            } catch (e) {
                console.error(e);
            }
            setLoading(false);
        }
        initDeck();
    }, []);

    const startGame = () => {
        if (!betPlaced || loading) return;

        const p1 = drawCard();
        const p2 = drawCard();
        const d1 = drawCard();
        const d2 = drawCard();

        setPlayerCards([p1, p2]);
        setDealerCards([d1]);
        setDealerHiddenCard(d2);

        const playerInitialScore = calculateHandValue([p1, p2]);
        const dealerInitialScore = calculateHandValue([d1, d2]);

        setPlayerScore(playerInitialScore);
        setDealerScore(calculateHandValue([d1]));

        setGameOver(false);
        setPlayerStand(false);
        setResult("");

        if (playerInitialScore === 21) {
            if (dealerInitialScore === 21) {
                setGameOver(true);
                setPlayerStand(true);
                setDealerCards([d1, d2]);
                setDealerHiddenCard(null);
                setDealerScore(21);
                setResult("Beide haben Blackjack! Unentschieden.");
                setMoney(m => m + bet);
            } else {
                setGameOver(true);
                setPlayerStand(true);
                setDealerCards([d1, d2]);
                setDealerHiddenCard(null);
                setDealerScore(dealerInitialScore);
                setResult("Blackjack! Du hast gewonnen!");
                setMoney(m => m + Math.floor(bet * 2.5));
            }
        }
    };

    const playerHit = () => {
        if (gameOver || playerStand || !betPlaced) return;

        const card = drawCard();
        if (!card) return;
        const newPlayerCards = [...playerCards, card];
        setPlayerCards(newPlayerCards);

        const score = calculateHandValue(newPlayerCards);
        setPlayerScore(score);

        if (score > 21) {
            setGameOver(true);
            setResult("Bust! Du hast verloren.");
        } else if (score === 21) {
            setGameOver(true);
            setPlayerStand(true);
            dealerPlay([...dealerCards, dealerHiddenCard], score);
        }
    };

    const playerStandClick = () => {
        if (gameOver || playerStand || !betPlaced) return;

        setPlayerStand(true);
        dealerPlay([...dealerCards, dealerHiddenCard], playerScore);
    };

    const dealerPlay = async (dealerHand, playerFinalScore) => {
        setDealerCards(dealerHand);
        setDealerHiddenCard(null);

        let score = calculateHandValue(dealerHand);
        setDealerScore(score);

        while (score < 17) {
            await new Promise((res) => setTimeout(res, 800));
            const card = drawCard();
            if (!card) break;
            dealerHand = [...dealerHand, card];
            setDealerCards(dealerHand);
            score = calculateHandValue(dealerHand);
            setDealerScore(score);
        }

        setGameOver(true);

        if (score > 21) {
            setResult("Dealer Bust! Du hast gewonnen.");
            setMoney(m => m + bet * 2);
        } else if (playerFinalScore > score) {
            setResult("Du hast gewonnen!");
            setMoney(m => m + bet * 2);
        } else if (playerFinalScore < score) {
            setResult("Du hast verloren.");
        } else {
            setResult("Unentschieden!");
            setMoney(m => m + bet);
        }
    };

    const placeBet = (amount) => {
        if (money >= amount && !betPlaced && !loading) {
            setMoney(m => m - amount);
            setBet(amount);
            setBetPlaced(true);
        }
    };

    const newGame = () => {
        setPlayerCards([]);
        setDealerCards([]);
        setDealerHiddenCard(null);
        setPlayerScore(0);
        setDealerScore(0);
        setGameOver(false);
        setPlayerStand(false);
        setResult("");
        setBet(0);
        setBetPlaced(false);
    };

    useEffect(() => {
        if (betPlaced) {
            startGame();
        }
    }, [betPlaced]);

    return (
        <div className="game-area">
            <h1>Blackjack</h1>

            <p>Geld: {money}.- CHF</p>
            <p>Einsatz: {bet}.- CHF</p>

            <div>
                <button onClick={playerHit} disabled={gameOver || playerStand || loading || !betPlaced}>
                    Karte ziehen
                </button>
                <button onClick={playerStandClick} disabled={gameOver || playerStand || loading || !betPlaced}>
                    Stand
                </button>
                <button onClick={newGame} disabled={!gameOver || loading}>
                    Neues Spiel starten
                </button>
            </div>

            <div className="scoreboard">
                <strong>Deine Punktzahl: {playerScore}</strong>
                {gameOver && <div className="result">{result}</div>}
            </div>

            <div className="card-row">
                {playerCards.map((card, idx) => (
                    <img key={card.code + idx} src={card.image} alt={`${card.value} of ${card.suit}`} width={100} />
                ))}
            </div>

            <div className="scoreboard" style={{ marginTop: "2rem" }}>
                <strong>Dealer Punktzahl: {dealerScore}</strong>
            </div>

            <div className="card-row">
                {dealerCards.map((card, idx) => (
                    <img key={card.code + idx} src={card.image} alt={`${card.value} of ${card.suit}`} width={100} />
                ))}

                {!playerStand && !gameOver && dealerHiddenCard && (
                    <img src="https://deckofcardsapi.com/static/img/back.png" alt="Verdeckte Karte" width={100} />
                )}
            </div>

            <br />

            <div>
                <button onClick={() => placeBet(5)} disabled={betPlaced || loading || money < 5}>
                    5.- CHF
                </button>
                <button onClick={() => placeBet(10)} disabled={betPlaced || loading || money < 10}>
                    10.- CHF
                </button>
                <button onClick={() => placeBet(50)} disabled={betPlaced || loading || money < 50}>
                    50.- CHF
                </button>
                <button onClick={() => placeBet(100)} disabled={betPlaced || loading || money < 100}>
                    100.- CHF
                </button>
            </div>
        </div>
    );
}