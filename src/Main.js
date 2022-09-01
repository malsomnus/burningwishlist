import { useState, useEffect } from 'react';
import { useCardDataContext } from './CardDataContext';
import { ManaCost, ManaSymbol } from './manacost.js';
import CardNamePanel from './CardNamePanel';
import './Main.scss';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function createTextParagraphs(card) {
    // Find symbols in the text and split it all neatly
    const paragraphs = (card.text || '').split('\n');
    return paragraphs.map((paragraph, idx) => {
        const parts = paragraph.match(/([^{}]+)|(\{.+?\})/g);
        return (
            <p key={idx}>
                {parts.map((part, idx) => {
                    if (part[0] === '{') {
                        return <ManaCost s={part} key={idx} />;
                    }
                    else {
                        return part;
                    }
                })}
            </p>
        );
    });
}

function SingleCard({ card, actions }) {
    if (!card) return null;

    return (
        <section className='single-card'>
            <div className='row title'>
                {card.faceName || card.name}
                <div className='mana-cost'>
                    <ManaCost s={card.manaCost} />
                </div>
            </div>

            <div className='row type'>
                {card.type}
            </div>

            <div className='text'>
                {createTextParagraphs(card)}
            </div>

            {(card.power && card.toughness) && (
                <div className='row' style={{ justifyContent: 'flex-end' }}>
                    {`${card.power} / ${card.toughness}`}
                </div>
            )}

            {card.otherFaceName && (
                <button type='button' onClick={actions?.viewOtherFace}>
                    {`View other face: ${card.otherFaceName}`}
                </button>
            )}


        </section>
    );
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default function Main(props) {
    const { cardsList } = props;
    const [name, setName] = useState('');
    const [viewSingleCard, setViewSingleCard] = useState(null);

    const cardDataContext = useCardDataContext();

    const matches = cardDataContext.cardNameTrie.get(name).map(match => match.value);

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    const getCardName = card => cardDataContext.getCard(card.faceName || card.name);
    
    const onEnter = e => {
        e.preventDefault();
        if (matches.length === 1) {
            setViewSingleCard(getCardName(matches[0]));
        }
    }

    let content;

    if (name === '') {
        content = null;
    }
    else if (matches.length === 0) {
        content = (
            <div>
                No matches
            </div>
        );
    }
    else if (matches.length > 15) {
        content = (
            <div>
                Be more specific!
            </div>
        );
    }
    else {
        const cardsOnList = [];
        const cardsNotOnList = [];
        matches.forEach(match => {
            if (cardDataContext.cardsList[match.name] !== undefined) {
                cardsOnList.push({ ...match, amount: cardDataContext.cardsList[match.name] });
            }
            else {
                cardsNotOnList.push(match);
            }
        });

        content = (
            <>
                <ul className='matches-list'>
                    {cardsOnList.map(card => (
                        <li onClick={() => setViewSingleCard(getCardName(card))} key={card.name}>
                            <CardNamePanel key={card.name} card={card} />
                        </li>
                    ))}
                </ul>
                <div style={{ height: '8px' }}></div>
                <ul className='matches-list'>
                    {cardsNotOnList.map(card => (
                        <li onClick={() => setViewSingleCard(getCardName(card))} key={card.name}>
                            <CardNamePanel key={card.name} card={card} />
                        </li>
                    ))}
                </ul>
            </>
        );

        // so here i want to split to two lists:
        // cards that are on the list - show with or without a checkmark
        // cards that aren't on the list

/*

        listContent = (
            matches.length <= 15 && matches.map(card => (
                <li onClick={() => onClickCard(cardDataContext.getCard(card.faceName || card.name))} key={card.name}>
                    <CardNamePanel 
                        card={{ 
                            ...cardDataContext.getCard(card.faceName || card.name), 
                            amount: cardDataContext.cardsList.filter(x => x.name === card.name)[0]?.amount, 
                        }} 
                    />
                </li>
            ))
        );*/
    }

    //

    return (
        <section className='app-main'>
            {viewSingleCard ? (
                <>
                    <button type='button' onClick={() => setViewSingleCard(null)}>
                        {'<'}
                    </button>
                    <SingleCard 
                        card={viewSingleCard} 
                        actions={{
                            viewOtherFace: () => setViewSingleCard(cardDataContext.getCard(viewSingleCard.otherFaceName))
                        }}
                    />
                </>
            ) : (
                <form onSubmit={onEnter}>
                    <input className='card-name' autoFocus value={name} onChange={e => setName(e.target.value)} />
                    {content}
                </form>
            )}
        </section>
    );
}