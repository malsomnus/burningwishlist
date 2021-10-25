import React, { createContext, useEffect, useReducer, useContext, useRef } from 'react';
import './UiContext.scss';

const useIsMounted = () => {
    const ref = useRef(true);

    useEffect(() => {
        return () => {
            ref.current = false;
        };
    }, []);

    return () => ref.current;
}

function throwUnsetContextError(f) {
    return () => {
        throw new Error(`Somebody is trying to use ${f} without a properly set context`); 
    }
}
const contextDefault = { 
    showModal: throwUnsetContextError('showModal'),
    hideModal: throwUnsetContextError('hideModal'),
    modalIsShown: null, // Can be used for e.g. blur effect on the screen that called the modal

    startSpinner: throwUnsetContextError('startSpinner'),
    stopSpinner: throwUnsetContextError('stopSpinner'),
    showToast: throwUnsetContextError('showToast'),
    hideToast: throwUnsetContextError('hideToast'),
};

export const Context = createContext(contextDefault);

let modalPromiseResolvers = [];

//
const initialState = {
    spinners: {},
    modals: [],
    toasts: [],
    toastTimers: {},
};

function reducer(state, action) {
    switch (action.type) {
        case 'showModal': {
            const { content, closeOnClickOutside, shouldBlurBackground } = action;

            return {
                ...state,
                modals: state.modals.concat({
                    content: content,
                    closeOnClickOutside: closeOnClickOutside,
                    shouldBlurBackground: shouldBlurBackground,
                }),
            };
        }

        case 'hideModal': {
            return {
                ...state,
                modals: state.modals.slice(0, -1),
            };
        }

        case 'startSpinner': {
            const { name } = action;

            return {
                ...state,
                spinners: {
                    ...state.spinners,
                    [name]: (state?.spinners[name] || 0) + 1,
                }
            };
        }

        case 'stopSpinner': {
            const { name } = action;

            return {
                ...state,
                spinners: {
                    ...state.spinners,
                    [name]: Math.max(0, (state?.spinners[name] || 0) - 1),
                },
            }
        }

        case 'showToast': {
            const { content, id, duration, timer } = action;

            if (id && state.toasts.find(toast => toast.id === id)) {
                console.log(`There is already a toast with the id ${id}`);
                return state;
            }
            else {
                return {
                    ...state,
                    toasts: state.toasts.concat({ 
                        content: content, 
                        id: id, 
                        duration: duration,
                        timer: timer, 
                    }),
                }
            }
        }

        case 'hideToast': {
            const { id } = action;
            return {
                ...state,
                toasts: state.toasts.filter(toast => toast.id !== id),
            };
        }

        case 'setToastTimer': {
            return state;
        }
        default: {
            throw new Error();
        }
    }
}

export default function UiContext(props) {
    const { children } = props;

    const isMounted = useIsMounted();
    const [state, dispatch] = useReducer(reducer, initialState);
    const safeDispatch = params => {
        if (isMounted()) {
            dispatch(params);
        }
    }
    
    const somethingIsLoading = Object.values(state.spinners).some(count => count > 0);

    let backdropClassNames = ['uicontext-modal-backdrop'];
    if (state.modals.length > 0 || somethingIsLoading) {
        backdropClassNames.push('visible');
    }
    else {
        backdropClassNames.push('hidden');
    }
    if (somethingIsLoading) {
        backdropClassNames.push('dark');
    }

    // const loadingBackdropClassName = `uicontext-loading-backdrop`;

    const getTimers = () => state.toasts.map(toast => toast.timer);
    useEffect(() => {
        return () => {
            getTimers().forEach(timer => {
                clearTimeout(timer);
            });
        };
    }, []);

    //

    const showModal = async (params) => {
        safeDispatch({ ...params, type: 'showModal'});
        const newPromise = new Promise((resolve, reject) => { modalPromiseResolvers.push(resolve) });
        return newPromise;
    };

    const hideModal = async (value) => {
        safeDispatch({ type: 'hideModal' });
        (modalPromiseResolvers.pop())(value);
        // modalPromiseResolver = () => console.error('There really should not be a modal open right now');
    };

    const showToast = params => {
        // params are assumed to be either just the content, or { content, id }
        const defaultDuration = 5;

        const content = params.content || params;
        const id = params.id || `toast${(new Date()).getTime()}`;
        const duration = `${(params.duration || defaultDuration) * 0.95}s`;
        
        const timer = setTimeout(() => {
            safeDispatch({ type: 'hideToast', id: id });
        }, (params.duration || defaultDuration) * 1000);

        safeDispatch({ 
            type: 'showToast', 
            content: content,
            id: id,
            duration: duration,
            timer: timer, 
        });
    };

    const onClickBackdrop = () => {
        if (state.modals.length > 0 && state.modals[state.modals.length - 1].closeOnClickOutside) {
            safeDispatch({ type: 'hideModal' });
        }
    };

    const contextValue = { 
        showModal: showModal,
        hideModal: hideModal,
        modalIsShown: state.modals.length > 0,
        shouldBlurBackground: state.modals.filter(modal => modal.shouldBlurBackground).length > 0,
        
        startSpinner: name => safeDispatch({ type: 'startSpinner', name: name }),
        stopSpinner: name => safeDispatch({ type: 'stopSpinner', name: name }),

        showToast: showToast,
        hideToast: id => safeDispatch({ type: 'hideToast', id: id}),
    };

    //

    return (
        <Context.Provider value={contextValue}>
            {children}
            <div className={backdropClassNames.join(' ')}>
                <div className='actual-backdrop' onClick={onClickBackdrop}>
                    {somethingIsLoading && (
                        <div>Don't forget to actually implement a spinner here</div>
                    )}
                </div>
                {state.modals.map((modal, idx) => (
                    <div className='modal-container' key={idx}>
                        {modal.content && React.cloneElement(modal.content, { className: `uicontext-modal` })}
                    </div>
                ))}
            </div>

            <div className='uicontext-toasts-container'>
                {state.toasts.map((toast, idx) => (
                    <div key={toast.id || `idx${idx}`} className='toast' style={{ '--toastDuration': toast.duration }}>
                        {toast.content}
                    </div>
                ))}
            </div>
        </Context.Provider>
    );
}

export function useUiContext() {
    const uiContext = useContext(Context);
    return uiContext;
}