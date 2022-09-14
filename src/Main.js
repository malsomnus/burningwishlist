import { useState, useEffect, useRef } from 'react';
import { useCardDataContext } from './CardDataContext';
import CardNamePanel from './CardNamePanel';
import { useUiContext } from './UiContext';
import SingleCardView from './SingleCardView';
import './Main.scss';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default function Main(props) {
    const { onAddCardToList, onAddCardToInventory } = props;
    const [name, setName] = useState('');
    const [viewSingleCard, setViewSingleCard] = useState(null);

    const cardDataContext = useCardDataContext();
    const uiContext = useUiContext();
    const inputRef = useRef(null);

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    const matches = cardDataContext.cardNameTrie.get(name).map(match => match.value);

    useEffect(() => {
        uiContext.addShortcut({ code: 'Backspace', ctrl: true, alt: true, cb: () => {
            setViewSingleCard(null);
        }});
        uiContext.addShortcut({ code: 'KeyF', ctrl: true, alt: true, cb: () => {
            inputRef.current.focus();
        }});
    }, []);

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    const getCardName = card => cardDataContext.getCard(card.faceName || card.name);

    const onEnter = e => {
        e.preventDefault();
        if (matches.length === 1) {
            setViewSingleCard(getCardName(matches[0]));
        }
    }

    let content;

    if (Object.keys(cardDataContext.cardData || {}).length === 0) {
        content = (
            <div>Loading...</div>
        );
    }
    else if (name === '') {
        // For this case I can add color filters maybe

        const missingCards = [];
        const acquiredCards = [];

        Object.keys(cardDataContext.cardsList).forEach(name => {
            const amount = cardDataContext.cardsList[name];
            const card = cardDataContext.cardData[name];
            if (amount > 0) {
                acquiredCards.push(card);
            }
            else {
                missingCards.push(card);
            }
        })

        content = (
            <>
                <ul className='matches-list'>
                    {missingCards.map(card => (
                        <li onClick={() => setViewSingleCard(card)} key={card.name}>
                            <CardNamePanel key={card.name} card={card} />
                        </li>
                    ))}
                </ul>
                {/*<div style={{ height: '8px' }}></div>
                <ul className='matches-list'>
                    {acquiredCards.map(card => (
                        <li onClick={() => setViewSingleCard(getCardName(card))} key={card.name}>
                            <CardNamePanel key={card.name} card={{ ...card, amount: 1 }} />
                        </li>
                    ))}
                </ul>*/}
             </>
        );
    }
    else if (matches.length === 0) {
        content = (
            <div>
                No matches
            </div>
        );
    }
    else if (matches.length > 30) {
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
    }

    //

    return (
        <section className='app-main'>
            {viewSingleCard ? (
                <>
                    
                    <SingleCardView 
                        card={viewSingleCard} 
                        actions={{
                            goBack: () => setViewSingleCard(null),
                            viewOtherFace: () => setViewSingleCard(cardDataContext.getCard(viewSingleCard.otherFaceName)),
                            addCardToList: () => onAddCardToList(viewSingleCard.name),
                            addCardToInventory: () => onAddCardToInventory(viewSingleCard.name),
                        }}
                    />
                </>
            ) : (
                <form onSubmit={onEnter}>
                    <input className='card-name' autoFocus ref={inputRef} value={name} onChange={e => setName(e.target.value)} />
                    {content}
                </form>
            )}
        </section>
    );
}