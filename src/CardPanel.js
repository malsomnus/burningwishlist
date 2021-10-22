import { parseManaCost, manaSymbolFromString } from './manacost.js';
import './CardPanel.scss';

export default function CardPanel(props) {
    const { card } = props;

    return (
        <div className='card-panel'>
            {card.amount > 0 && (
                <div className='checkmark'>🗸</div>
            )}
            <div className='card-name'>{card.name}</div>
            <div className='mana-cost'>{parseManaCost(card.manaCost).map(manaSymbolFromString)}</div>
        </div>
    );
}