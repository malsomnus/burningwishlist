import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';
// import { useUiContext } from './UiContext';
import { useCardDataContext } from './CardDataContext';
import Login from './Login';
import Playground from './playground/playground';
import Main from './Main.js';
import './App.scss';

// Mana font taken from https://github.com/gbartholomeu/mtg-minimalist-proxies
import './manafont/mana.scss';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

window.logout = () => axios.get('/logout');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default function App(props) {
    const [cardsTrie, setCardsTrie] = useState({});
    const [showLogin, setShowLogin] = useState(false);

    const [playground, setPlayground] = useState(false);

    // const uiContext = useUiContext();
    const cardDataContext = useCardDataContext();

    //

    async function getCards() {
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

            console.log('Failed to get cards from server; using fake db instead');
            const db = require('./fake_db.json');
            cardDataContext.setCardsList(db.users[0].cards);
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