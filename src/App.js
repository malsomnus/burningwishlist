import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import TrieSearch from 'trie-search';
import axios from 'axios';
import Login from './Login';
import './App.scss';

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

function parseManaCost(manaCost) {
    // I have no idea how this regex works, so best not to question it. What it actually does is
    // look for groups of symbols in curly braces and separate them into a nice array, 
    // e.g. taking the string '{W}{W/B}{B}' and turning it into ['W', 'W/B', 'B'].
    // The second part there removes the slashes and makes the whole thing lowercase.

    if (!manaCost) return [];
    return manaCost.match(/(?<=\{).+?(?=\})/g).map(str => str.replace(/\//g, '').toLowerCase());
}

function manaSymbolFromString(str) {
    return (
        <i className={`ms ms-cost ms-${str}`}></i>
    );
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const list = [
    { name: 'Whip of Erebos' },
    { name: 'Replenish' },
    { name: 'Reversal of Fortune' },
    { name: 'Summoning Station' },
    { name: 'Semblance Anvil' },
    { name: 'Cloud Key' },
    { name: 'Clearwater Pathway' },
    { name: 'Savai Triome' },
    { name: 'Song of the Worldsoul' },
    { name: 'Coastal Piracy' },
    { name: 'Mistblade Shinobi' },
    { name: 'Thalakos Seer' },
    { name: 'Cauldron Haze' },
    { name: 'Alela, Artful Provocateur' },
    { name: 'Athreos, Shroud-Veiled' },
    { name: 'Gyruda, Doom of Depths' },
    { name: 'Unbound Flourishing' },
    { name: 'Mana Reflection' },
    { name: 'Living Lands' },
    { name: 'Nature\'s Revolt' },
    { name: 'Master Warcraft' },
    { name: 'Kozilek, Butcher of Truth' },
    { name: 'Akroma\'s Memorial' },
    { name: 'Kodama of the East Tree' },
    { name: 'Gitaxian Probe' },
];

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function App(props) {
    const [cardData, setCardData] = useState({});
    const [cardsTrie, setCardsTrie] = useState({});
    const [showLogin, setShowLogin] = useState(false);

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

    //

    function getCard(name) {
        // Just to make sure it fails gracefully before card data is fetched
        return cardData[name] || {};
    }

    async function onAddCard(name) {
        const rawResponse = await axios.post('/addcard', { name: 'Gitaxian Probe' });
        const content = await rawResponse.json();
        console.log(content)
    }

    //

    return (
        <div className='app'>
            <Helmet>
                <title>Burning Wishlist</title>
                <link href="//cdn.jsdelivr.net/npm/mana-font@latest/css/mana.min.css" rel="stylesheet" type="text/css" />
            </Helmet>
            
            <header className="App-header">
                Cards!
            </header>

            {showLogin ? (
                <Login onSuccess={() => setShowLogin(false)} />         
            ) : (
                <>
                    <button onClick={onAddCard}>Add</button>
                    <button onClick={() => axios.get('/createuser', { username: 'malsomnus', password: 'test' })}>Create User</button>
                    <button onClick={() => setShowLogin(true)}>Log in</button>
                    <button onClick={() => axios.get('/logout')}>Log out</button>

                    <ul className='cards-list'>
                        {list.map((card, idx) => (
                            <li key={card.name + idx}>
                                🗸
                                {card.name}
                                <div className='mana-cost'>
                                    {parseManaCost(getCard(card.name).manaCost).map(manaSymbolFromString)}
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            
        </div>
    );
}

export default App;