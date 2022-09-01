import { ManaCost, ManaSymbol } from './manacost.js';
import './CardNamePanel.scss';

export default function CardNamePanel(props) {
    const { card } = props;

    return (
        <div className={`card-panel ${card.amount > 0 ? 'checked' : ''}`}>
            {card.amount > 0 && (
                <div className='checkmark'>🗸</div>
            )}
            <div className='card-name'>{card.name}</div>
            <div className='mana-cost'>
                <ManaCost s={card.manaCost} />
            </div>
        </div>
    );
}