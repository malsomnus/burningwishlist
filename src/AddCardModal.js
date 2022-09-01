import { useState } from 'react';
import { useUiContext } from './UiContext';
import { useCardDataContext } from './CardDataContext';
import CardNamePanel from './CardNamePanel';
import './AddCardModal.scss';

export default function AddCardModal(props) {
    const { cardsList } = props;
    const [name, setName] = useState('');

    const uiContext = useUiContext();
    const cardDataContext = useCardDataContext();

    const matches = cardDataContext.cardNameTrie.get(name).map(match => match.value);
    // const cardNameIsIllegal = cardDataContext.getCard(name).name === undefined;

    function onClickCard(card) {
        setName(card.faceName || card.name);
    }

    let listContent;
    if (matches.length === 0) {
        listContent = (
            <div>
                No matches
            </div>
        );
    }
    else if (matches.length > 15) {
        listContent = (
            <div>
                Too many matches
            </div>
        );
    }
    else {
        listContent = (
            matches.length <= 15 && matches.map(card => (
                <li onClick={() => onClickCard(cardDataContext.getCard(card.faceName || card.name))}>
                    <CardNamePanel card={{ ...cardDataContext.getCard(card.faceName || card.name), amount: card.amount }} />
                </li>
            ))
        );
    }

    //

    function onSubmit(e) {
        e.preventDefault();
        if (matches.length === 1) {
            uiContext.hideModal(matches[0].name);
        }
    }

    function onCancel() {
        uiContext.hideModal(null);
    }

    //

    return (
        <section className='add-card-modal uicontext-modal'>
            <form onSubmit={onSubmit}>
                <input autoFocus value={name} onChange={e => setName(e.target.value)} />
                <ul className='matches-list'>
                    {listContent}
                </ul>
                <button type='submit' disabled={matches.length !== 1}>Add card</button>
                <button type='button' onClick={onCancel}>Cancel</button>
            </form>
        </section>
    );
}