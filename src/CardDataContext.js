import React, { createContext, useState, useContext, useEffect } from 'react';
import TrieSearch from 'trie-search';
import cardData from './lessmtg.json';

function throwUnsetContextError(f) {
    return () => {
        throw new Error(`Somebody is trying to use ${f} without a properly set context`); 
    }
}
const contextDefault = { 
    cardData: throwUnsetContextError('cardData'),
    cardsList: throwUnsetContextError('cardsList'),
    cardNameTrie: throwUnsetContextError('cardNameTrie'),
};

export const Context = createContext(contextDefault);

export default function UiContext(props) {
    const { children } = props;
    const [cardsList, setCardsList] = useState([]);
    const [cardNameTrie, setCardNameTrie] = useState({ get: () => [] });

    useEffect(() => {
        const trie = new TrieSearch();
        trie.addFromObject(cardData);
        setCardNameTrie(trie);
        window.trie=trie
    }, []);

    //

    const contextValue = { 
        cardData: cardData,
        cardsList: cardsList,
        cardNameTrie: cardNameTrie,
        setCardsList: cardsList => {
            const map = {};
            cardsList.forEach(card => {
                map[card.name] = card.amount;
            });
            setCardsList(map);
        },
        getCard: name => cardData[name] || {},
        cardIsInList: name => cardsList[name] !== undefined,
        cardIsInInventory: name => cardsList[name] > 0,
    };

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    );
}

export function useCardDataContext() {
    const cardDataContext = useContext(Context);
    return cardDataContext;
}