import React, { createContext, useState, useContext } from 'react';
import TrieSearch from 'trie-search';

function throwUnsetContextError(f) {
    return () => {
        throw new Error(`Somebody is trying to use ${f} without a properly set context`); 
    }
}
const contextDefault = { 
    cardData: throwUnsetContextError('cardData'),
    cardNameTrie: throwUnsetContextError('cardNameTrie'),
    setCardData: throwUnsetContextError('setCardData'),
};

export const Context = createContext(contextDefault);

export default function UiContext(props) {
    const { children } = props;
    const [cardData, setCardData] = useState({});
    const [cardNameTrie, setCardNameTrie] = useState({});

    //

    const contextValue = { 
        cardData: cardData,
        cardNameTrie: cardNameTrie,
        setCardData: cardData => {
            setCardData(cardData);
            const trie = new TrieSearch();
            trie.addFromObject(cardData);
            setCardNameTrie(trie);
        },
        getCard: name => cardData[name] || {},
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