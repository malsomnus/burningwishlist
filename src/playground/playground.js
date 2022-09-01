import { useState, useEffect } from 'react';

window.cardsData = require('./lessmtg.json');
window.printCard = id => {
    const card = (typeof id === 'number') ? window.cardsList[id] : window.cardsByName[id];
    if (!card) return 'Not found';
    return `${card.name} (${card.type}) ${card.manaCost}`;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/*

Parsing notes:
    Card names:
        Separate tokens for commas etc.
        Can probably separate things by the number of words in the card name, and maybe use
        the ^start and end$ as tokens as well (makes sense)
        Apostrophes can be stuff like "Jace's" or they can appear as a part of a name
    Card text:
        Token to represent the name of this card
        Tokens for all symbols {whatever}

    How do I make it invent new words? How can I tell it when to do that? Build some correlation between card types and names?

*/

function tokenizeCardName(str) {
    // Splitting into words and commas
    // If a word ends with 's, make it a separate token
    // If a word ends with s', make the apostrophe a separate token
    let tokens = str.match(/[a-zA-Z0-9'+]+|,/g)
        .map(token => {
            const m = token.match(/^(.+)('s?)$/);
            if (m) {
                return [m[1], m[2]];
            }
            else {
                return token;
            }
        })
        .flat();
    
    // also pass card type as paramter, and have a token to represent a subtype appearing in the name?

    return ['^', ...tokens, '$'];
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function tokenizeCardText(str, cardName) {
    if (!cardName) {
        throw new Error('You forgot the card name')
    }
    if (!str) {
        return [];
    }

    // Replace instances of the card's name with {this}
    let modifiedStr = str?.replaceAll(new RegExp(escapeRegExp(cardName), 'ig'), '{this}');
    // Remove everything inside parentheses because I haven't figured out how to do anything smart about it
    //

   
    // if i wanna get fancy, i can have a token for card type, creature type, whatever

    // const tokenTypes = [
    //     '\{this\}',       // card name
    //     '\S+\/\S+',      // stats
    //     '\n',
    //     '\{.{1,3}\}',   // symbol (mana, tap, etc.)
    //     '[,.|:—]',     // punctuation - not using parentheses because problems
    //     '[a-zA-Z'\\]+',
    //     '[0-9]+,
    // ];

    let tokens = modifiedStr.match(/\{this\}|\S+\/\S+|\n|\{.{1,3}\}|[,.|:—]|[a-zA-Z']+|[0-9]+|\(.+\)/g);
    return ['^', ...tokens, '$'];
}

function randint(floor, ceiling) { 
    if (floor === ceiling) return floor;
    return floor + Math.floor(Math.random() * (ceiling - floor - 1));
}

function generateProbabilityMap(tokenArrays) {
    const t = {};
    tokenArrays.forEach(arr => {
        for (let i = 1 ; i < arr.length ; i++) {
            const prev = arr[i - 1];
            const curr = arr[i];
            if (!t[prev]) {
                t[prev] = {};
            }
            t[prev][curr] = (t[prev][curr] || 0) + 1;
        }
    });
    
    return t;
}

function generateRandomSentence(probabilityMap, wordCount, amplifyWeight = 1) {
    let justInCase = 0;
    const sentence = [];
    let nextWord = '^';

    while (sentence.length <= wordCount && justInCase < 100) {
        nextWord = weightedRandom(probabilityMap[nextWord], nextWord === '^' ? 1 : amplifyWeight);
        if (nextWord === '$') {
            break;
        }
        sentence.push(nextWord);
        justInCase++;
    }
    
    return sentence.join(' ').replace(/ ([,.':])/g, '$1');
}

function weightedRandom(map, amplifyWeight = 1) {
    // { key: weight }
    const total = Object.keys(map).reduce((acc, key) => acc + map[key]**amplifyWeight, 0);

    const arr = [];
    Object.keys(map).forEach(key => {
        arr.push({ key: key, weight: map[key]**amplifyWeight });
    });

    const rand = Math.floor(Math.random() * total);

    let sum = 0;
    for (let i = 0 ; i < arr.length ; i++) {
        sum += arr[i].weight;
        if (rand < sum) {
            return arr[i].key;
        }
    }
}

export default function Playground(props) {
    const  { onClose } = props;
    let cardsData = window.cardsData;

    const indexCards = () => {
        window.cardNames = [];
        window.cardsByName = {};
        Object.keys(window.cardsData).forEach(name => {
            const newName = name.toLowerCase();
            
            // Remove a bunch of... I have no idea what these actually are. MTGA-related stuff?
            if (newName.match(/^a-/) || !newName.match(/[a-z]/)) { return; }

            window.cardNames.push(newName);
            window.cardsByName[newName] = window.cardsData[name];
        })
        window.cardsList = Object.values(cardsData);

        const cardNameProbabilityMap = generateProbabilityMap(window.cardNames.map(tokenizeCardName));
        const cardTextProbabilityMap = generateProbabilityMap(window.cardsList.map(x => tokenizeCardText(x.text, x.name)));
        window.m = [cardNameProbabilityMap, cardTextProbabilityMap];

        window.tokenizeCardText = tokenizeCardText;
        window.generateRandomSentence = generateRandomSentence;
        console.log('Yay!');
    }
    

    return (
        <div>
            <h1>Playground</h1>
            <button onClick={indexCards}>Index</button>
            <button onClick={onClose}>X</button>
        </div>
    )
}