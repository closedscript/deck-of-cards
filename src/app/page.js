'use client';
import './blackjack.css';
import { useEffect, useState } from 'react';
import PlayerHand from '../components/PlayerHand';
import DealerHand from '../components/DealerHand';
import Controls from '../components/Controls';

export default function BlackJackGame() {
    const [deck, setDeck] = useState([]);
    const [playerCards, setPlayerCards] = useState([]);
    const [dealerCards, setDealerCards] = useState([]);
    const [dealerHiddenCard, setDealerHiddenCard] = useState(null);
    const [playerScore, setPlayerScore] = useState(0);
    const [dealerScore, setDealerScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [playerStand, setPlayerStand] = useState(false);
    const [result, setResult] = useState('');
    const [money, setMoney] = useState(1000);
    const [bet, setBet] = useState(0);
    const [betPlaced, setBetPlaced] = useState(false);
    const [loading, setLoading] = useState(true);

    const drawCard = async () =>
        new Promise((resolve) => {
            setDeck((prevDeck) => {
                if (prevDeck.length === 0) {
                    resolve(null);
                    return prevDeck;
                }
                const card = prevDeck[0];
                resolve(card);
                return prevDeck.slice(1);
            });
        });

    useEffect(() => {
        if (deck.length <= 10) {
            console.warn('Deck is running low, fetching a new one...');
            (async () => {
                try {
                    const res1 = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
                    const data1 = await res1.json();
                    const res2 = await fetch(`https://deckofcardsapi.com/api/deck/${data1.deck_id}/draw/?count=312`);
                    const data2 = await res2.json();
                    setDeck(data2.cards);
                } catch (err) {
                    console.error('Fehler beim Nachladen des Decks:', err);
                }
            })();
        }
    }, [deck]);

    const calculateHandValue = (cards) => {
        let score = 0;
        let aces = 0;
        for (const card of cards) {
            if (!card) continue;
            if (['KING', 'QUEEN', 'JACK'].includes(card.value)) score += 10;
            else if (card.value === 'ACE') {
                aces += 1;
                score += 11;
            } else score += Number(card.value);
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
                const res1 = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
                const data1 = await res1.json();
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

    const startGame = async () => {
        if (!betPlaced || loading) return;

        const p1 = await drawCard();
        const p2 = await drawCard();
        const d1 = await drawCard();
        const d2 = await drawCard();

        setPlayerCards([p1, p2]);
        setDealerCards([d1]);
        setDealerHiddenCard(d2);

        const playerInitialScore = calculateHandValue([p1, p2]);
        const dealerInitialScore = calculateHandValue([d1, d2]);

        setPlayerScore(playerInitialScore);
        setDealerScore(calculateHandValue([d1]));

        setGameOver(false);
        setPlayerStand(false);
        setResult('');

        if (playerInitialScore === 21) {
            setDealerCards([d1, d2]);
            setDealerHiddenCard(null);
            setDealerScore(dealerInitialScore);
            setPlayerStand(true);
            setGameOver(true);
            if (dealerInitialScore === 21) {
                setResult('Beide haben Blackjack! Unentschieden.');
                setMoney((m) => m + bet);
            } else {
                setResult('Blackjack! Du hast gewonnen!');
                setMoney((m) => m + Math.floor(bet * 2.5));
            }
        }
    };

    const playerHit = async () => {
        if (gameOver || playerStand || !betPlaced) return;
        const card = await drawCard();
        if (!card) return;

        const newHand = [...playerCards, card];
        setPlayerCards(newHand);
        const score = calculateHandValue(newHand);
        setPlayerScore(score);

        if (score > 21) {
            setGameOver(true);
            setResult('Bust! Du hast verloren.');
        } else if (score === 21) {
            setPlayerStand(true);
            setGameOver(true);
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
            const card = await drawCard();
            if (!card) break;
            dealerHand = [...dealerHand, card];
            setDealerCards(dealerHand);
            score = calculateHandValue(dealerHand);
            setDealerScore(score);
        }

        setGameOver(true);

        if (score > 21) {
            setResult('Dealer Bust! Du hast gewonnen.');
            setMoney((m) => m + bet * 2);
        } else if (playerFinalScore > score) {
            setResult('Du hast gewonnen!');
            setMoney((m) => m + bet * 2);
        } else if (playerFinalScore < score) {
            setResult('Du hast verloren.');
        } else {
            setResult('Unentschieden!');
            setMoney((m) => m + bet);
        }
    };

    const placeBet = (amount) => {
        if (money >= amount && !betPlaced && !loading) {
            setMoney((m) => m - amount);
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
        setResult('');
        setBet(0);
        setBetPlaced(false);
    };

    useEffect(() => {
        if (betPlaced) startGame();
    }, [betPlaced]);

    return (
        <div className="game-area">
            <h1>Blackjack</h1>
            <p>Geld: {money}.- CHF</p>
            <p>Einsatz: {bet}.- CHF</p>

            <Controls
                onHit={playerHit}
                onStand={playerStandClick}
                onNewGame={newGame}
                onBet={placeBet}
                betPlaced={betPlaced}
                loading={loading}
                money={money}
                gameOver={gameOver}
                playerStand={playerStand}
            />

            <PlayerHand playerCards={playerCards} score={playerScore} result={result} gameOver={gameOver} />
            <DealerHand cards={dealerCards} hiddenCard={dealerHiddenCard} score={dealerScore} showHidden={playerStand || gameOver} />
        </div>
    );
}
