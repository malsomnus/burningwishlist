import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import TrieSearch from 'trie-search';
import axios from 'axios';
import { useUiContext } from './UiContext';
import { useCardDataContext } from './CardDataContext';
import Login from './Login';
import AddCardModal from './AddCardModal';
import CardPanel from './CardPanel';
import './App.scss';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

window.logout = () => axios.get('/logout');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

async function fetchCardData(cb) {
    // if (process.env.NODE_ENV === 'development') {
    //     return require('./data/lessmtg.json');
    // }
    // else {
        try {
            const res = await axios.get('/carddata');
            return res.data;
        }
        catch (e) {
            return 'Error fetching card data';
        };
    // }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function App(props) {
    const [cardData, setCardData] = useState({});
    const [cardsTrie, setCardsTrie] = useState({});
    const [showLogin, setShowLogin] = useState(false);
    const [cardsList, setCardsList] = useState([]);

    const uiContext = useUiContext();
    const cardDataContext = useCardDataContext();

    //

    async function getCards() {
        try {
            const res = await axios.get('/getcards');
            setCardsList(res.data);
        }
        catch (e) {
            console.log(e)
            if (e?.response?.status === 403) {
                console.error('Error: not logged in');
                setShowLogin(true);
            }
            else {
                console.error('Unexpected error');
            }
        };
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
        const cardName = await uiContext.showModal({ content: <AddCardModal cardsList={cardsList} /> });
        const res = await axios.post('/addcard', { name: cardName });
        setCardsList(res.data);
    }

    function onPrintList() {
        console.log('print list')
    }

    //

    return (
        <div className='app'>
            <Helmet>
                <title>Burning Wishlist</title>
                <link href="//cdn.jsdelivr.net/npm/mana-font@latest/css/mana.min.css" rel="stylesheet" type="text/css" />
            </Helmet>
            
            {showLogin ? (
                <Login onSuccess={onSuccessfulLogin} />         
            ) : (
                <>
                    <button className='add-card' onClick={onAddCard}>Add</button>
                    {/*<button onClick={() => axios.get('/logout')}>Log out</button>*/}

                    <ul className='cards-list'>
                        {cardsList.map((card, idx) => (
                            <li key={card.name + idx} className={card.amount > 0 ? 'checked' : ''}>
                                <CardPanel card={{ ...cardDataContext.getCard(card.name), amount: card.amount }} />
                            </li>
                        ))}
                    </ul>
                    <button className='print-list' onClick={onPrintList}>Print list</button>
                </>
            )}
        </div>
    );
}

export default App;