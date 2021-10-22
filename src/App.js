import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import TrieSearch from 'trie-search';
import axios from 'axios';
import Login from './Login';
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

    //

    async function getCards() {
        try {
            const res = await axios.get('/getcards');
            setCardsList(res.data);
        }
        catch (e) {
            if (e.response.status === 403) {
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
            setCardData(cardData);
            window.cards = cardData;
            const trie = new TrieSearch()
            trie.addFromObject(cardData);
            setCardsTrie(trie);
        })();
    }, []);

    useEffect(getCards, []);

    //

    function getCard(name) {
        // Just to make sure it fails gracefully before card data is fetched
        return cardData[name] || {};
    }

    function onSuccessfulLogin() {
        getCards();
        setShowLogin(false);
    }

    async function onAddCard(name) {
        const res = await axios.post('/addcard', { name: 'Dark Ritual' });
        setCardsList(res.data);
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
                    <button onClick={onAddCard}>Add</button>
                    {/*<button onClick={() => axios.get('/createuser', { username: 'malsomnus', password: 'test' })}>Create User</button>*/}
                    {/*<button onClick={() => setShowLogin(true)}>Log in</button>*/}
                    {/*<button onClick={() => axios.get('/logout')}>Log out</button>*/}

                    <ul className='cards-list'>
                        {cardsList.map((card, idx) => (
                            <li key={card.name + idx} className={card.amount > 0 ? 'checked' : ''}>
                                <CardPanel card={{ ...getCard(card.name), amount: card.amount }} />
                            </li>
                        ))}
                    </ul>
                </>
            )}

            
        </div>
    );
}

export default App;