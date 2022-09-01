import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import TrieSearch from 'trie-search';
import axios from 'axios';
import { useUiContext } from './UiContext';
import { useCardDataContext } from './CardDataContext';
import Login from './Login';
import AddCardModal from './AddCardModal';
import ObtainCardModal from './ObtainCardModal';
import CardNamePanel from './CardNamePanel';
import Playground from './playground/playground';
import Main from './Main.js';
import './App.scss';

// Mana font taken from https://github.com/gbartholomeu/mtg-minimalist-proxies
import './manafont/mana.scss';

/*

To do:
- Add card text to ObtainCardModal
- Sort list by obtained > color > alphabetically
- Make obtained cards collapsible
- Print list
- Show in AddCardModal if a given card is already obtained
- Server side code to prevent adding a card that doesn't exist
- Cache
- Host this somewhere



*/

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

window.logout = () => axios.get('/logout');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

async function fetchCardData() {
    if (process.env.NODE_ENV === 'development') {
        return require('./lessmtg.json');
    }
    else {
        try {
            const res = await axios.get('/carddata');
            return res.data;
        }
        catch (e) {
            return 'Error fetching card data';
        };
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default function App(props) {
    const [cardData, setCardData] = useState({});
    const [cardsTrie, setCardsTrie] = useState({});
    const [showLogin, setShowLogin] = useState(false);

    const [playground, setPlayground] = useState(false);

    const uiContext = useUiContext();
    const cardDataContext = useCardDataContext();

    //

    async function getCards() {
        if (process.env.NODE_ENV === 'development') {
            const db = require('./server/db.json');
            cardDataContext.setCardsList(db.users[0].cards);
        }
        else {
            try {
                const res = await axios.get('/getcards');
                cardDataContext.setCardsList(res.data);
            }
            catch (e) {
                console.log(e)
                if (e?.response?.status === 403) {
                    console.error('Error: not logged in');
                    setShowLogin(true);
                }
                else {
                    console.error('Unexpected error', e);
                }
            }
        }
    }

    //

    useEffect(() => {
        (async () => {
            const cardData = await fetchCardData();
            window.cards = cardData;
            cardDataContext.setCardData(cardData);
        })();
    }, []);

    useEffect(getCards, []);

    //

    function onSuccessfulLogin() {
        getCards();
        setShowLogin(false);
    }

    async function onAddCard(name) {
        const cardName = await uiContext.showModal({ content: <AddCardModal cardsList={cardDataContext.cardsList} /> });
        if (cardName) {
            const res = await axios.post('/addcard', { name: cardName });
            cardDataContext.setCardsList(res.data);
        }
    }

    function onPrintList() {
        console.log('print list')
    }

    async function onClickCardNamePanel(card) {
        if (card.amount > 0) {
            return;
        }

        const confirm = await uiContext.showModal({ content: <ObtainCardModal cardName={card.name} /> });
        if (confirm) {
            const res = await axios.post('/addcardtoinventory', { name: card.name });
            cardDataContext.setCardsList(res.data);
        }
    }

    async function addCardsManually(cards, addToInventory = false) {
        const list = cards.split('\n').map(str => str.trim());

        for (let i = 0 ; i < list.length ; i++) {
            const card = cardDataContext.cardNameTrie.get(list[i])[0].value;
            const properName = card.faceName || card.name;
            
            let res = await axios.post('/addcard', { name: properName });

            if (addToInventory) {
                res = await axios.post('/addcardtoinventory', { name: properName });
            }

            cardDataContext.setCardsList(res.data);
        }
    }
    window.addCardsManually = addCardsManually;

    //

    if (playground) {
        return <Playground cardData={cardData} onClose={() => setPlayground(false)} />
    }

    if (false) {
        return <>
                    <button className='add-card' onClick={onAddCard}>Add</button>
                    {/*<button onClick={() => axios.get('/logout')}>Log out</button>*/}

                    <ul className='cards-list'>
                        {cardDataContext.cardsList.map((card, idx) => (
                            <li 
                                key={card.name + idx} 
                                className={card.amount > 0 ? 'checked' : ''} 
                                onClick={() => onClickCardNamePanel(card)}
                            >
                                <CardNamePanel card={{ ...cardDataContext.getCard(card.name), amount: card.amount }} />
                            </li>
                        ))}
                    </ul>
                    
                    <button className='print-list' onClick={onPrintList}>
                        Print list
                    </button>
                    <button className='add-card' onClick={() => setPlayground(true)}>Playground</button>
                </>
    }

    return (
        <div className='app'>
            <Helmet>
                <title>Burning Wishlist</title>
            </Helmet>
            
            {showLogin ? (
                <Login onSuccess={onSuccessfulLogin} />         
            ) : (
                <Main />
                
            )}
        </div>
    );
}