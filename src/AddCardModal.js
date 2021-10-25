import { useState, useEffect } from 'react';
import { useUiContext } from './UiContext';
import { useCardDataContext } from './CardDataContext';
import CardPanel from './CardPanel';
import './AddCardModal.scss';

export default function AddCardModal(props) {
    const { cardsList } = props;
    const [name, setName] = useState('');

    const uiContext = useUiContext();
    const cardDataContext = useCardDataContext();

    const matches = cardDataContext.cardNameTrie.get(name).map(match => match.value);
    const cardNameIsIllegal = cardDataContext.getCard(name).name === undefined;

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
                    <CardPanel card={{ ...cardDataContext.getCard(card.faceName || card.name), amount: card.amount }} />
                </li>
            ))
        );
    }

    //

    function onSubmit(e) {
        e.preventDefault();
        uiContext.hideModal(name);
    }

    function onCancel() {
        uiContext.hideModal();
    }

    //

    return (
        <section className='add-card-modal uicontext-modal'>
            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column'}}>
                <input autoFocus value={name} onChange={e => setName(e.target.value)} />
                <ul className='matches-list'>
                    {listContent}
                </ul>
                <button type='submit' disabled={cardNameIsIllegal}>Add card</button>
                <button type='button' onClick={onCancel}>Cancel</button>
            </form>
        </section>
    );
}