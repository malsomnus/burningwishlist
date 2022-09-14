import React, { createContext, useState, useContext } from 'react';
import TrieSearch from 'trie-search';

function throwUnsetContextError(f) {
    return () => {
        throw new Error(`Somebody is trying to use ${f} without a properly set context`); 
    }
}
const contextDefault = { 
    cardData: throwUnsetContextError('cardData'),
    cardsList: throwUnsetContextError('cardsList'),
    cardNameTrie: throwUnsetContextError('cardNameTrie'),
    setCardData: throwUnsetContextError('setCardData'),
};

export const Context = createContext(contextDefault);

export default function UiContext(props) {
    const { children } = props;
    const [cardData, setCardData] = useState({});
    const [cardsList, setCardsList] = useState([]);
    const [cardNameTrie, setCardNameTrie] = useState({ get: () => [] });

    //

    const contextValue = { 
        cardData: cardData,
        cardsList: cardsList,
        cardNameTrie: cardNameTrie,
        setCardData: cardData => {
            setCardData(cardData);
            const trie = new TrieSearch();
            trie.addFromObject(cardData);
            setCardNameTrie(trie);
            window.trie=trie
        },
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