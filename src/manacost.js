
export function ManaSymbol({ s, ...otherProps }) {
    const symbol = {
        't': 'tap',
        'q': 'untap',
    }[s.toLowerCase()] || s.toLowerCase();

    return (
        <i className={`ms ms-cost ms-${symbol}`} {...otherProps}></i>
    );
}


export function ManaCost({ s, ...otherProps}) {
    if (!s) {
        return null;
    }

    const symbols = s.match(/(?<=\{).+?(?=\})/g).map(str => str.replace(/\//g, '').toLowerCase());

    return symbols.map((symbol, idx) => (
        <ManaSymbol s={symbol} key={idx} />
    ));
}