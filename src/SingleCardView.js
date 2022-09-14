import { useCardDataContext } from './CardDataContext';
import { ManaCost, ManaSymbol } from './manacost.js';
import './SingleCardView.scss';

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
        <section className='card-info'>
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

export default function SingleCardView(props) {
    const { card, actions } = props;
    const cardDataContext = useCardDataContext();

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    return (
        <div className='single-card'>
            <div className='single-card-top'>
                <button type='button' onClick={actions.goBack}>
                    {'< Back'}
                </button>

                <button type='button' onClick={actions.addCardToList} disabled={cardDataContext.cardIsInList(card.name)}>
                    {'+ Add to list'}
                </button>

                {!cardDataContext.cardIsInInventory(card.name) ? (
                    <button type='button' onClick={actions.addCardToInventory} disabled={!cardDataContext.cardIsInList(card.name)}>
                        {'+ Add to inventory'}
                    </button>
                ) : (
                    <div className='got-it'>
                        <span className='v'>✔</span> Got it!
                    </div>
                )}
            </div>
            <SingleCard 
                card={card} 
                actions={actions}
            />
        </div>
    );
}