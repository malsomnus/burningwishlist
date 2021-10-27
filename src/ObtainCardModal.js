import { useUiContext } from './UiContext';
import './ObtainCardModal.scss';

export default function ObtainCardModal(props) {
    const { cardName } = props;

    const uiContext = useUiContext();

    //

    return (
        <section className='obtain-card-modal uicontext-modal'>
            <h6>{`Did you obtain a ${cardName}?`}</h6>
            <button type='button' className='yes' onClick={() => uiContext.hideModal(true)}>Yes</button>
            <button type='button' className='no' onClick={() => uiContext.hideModal(false)}>No</button>
        </section>
    );
}