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

console.log('process.env', process.env)

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default function App(props) {
    const [cardsTrie, setCardsTrie] = useState({});
    const [showLogin, setShowLogin] = useState(false);

    const [playground, setPlayground] = useState(false);

    const uiContext = useUiContext();
    const cardDataContext = useCardDataContext();

    //

    async function getCards() {
        if (process.env.NODE_ENV === 'development') {
            const db = require('./fake_db.json');
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

    useEffect(getCards, []);

    //

    function onSuccessfulLogin() {
        getCards();
        setShowLogin(false);
    }

    async function onAddCardToList(name) {
        const res = await axios.post('/addcard', { name: name });
        cardDataContext.setCardsList(res.data);
    }

    async function onAddCardToInventory(name) {
        const res = await axios.post('/addcardtoinventory', { name: name });
        cardDataContext.setCardsList(res.data);
    }

    function onPrintList() {
        console.log('print list')
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
        return <Playground cardData={cardDataContext.cardData} onClose={() => setPlayground(false)} />
    }

    return (
        <div className='app'>
            <Helmet>
                <title>Burning Wishlist</title>
            </Helmet>
            
            {showLogin ? (
                <Login onSuccess={onSuccessfulLogin} />         
            ) : (
                <Main 
                    onAddCardToList={onAddCardToList}
                    onAddCardToInventory={onAddCardToInventory}
                />
                
            )}
        </div>
    );
}