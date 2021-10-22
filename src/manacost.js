export function parseManaCost(manaCost) {
    // I have no idea how this regex works, so best not to question it. What it actually does is
    // look for groups of symbols in curly braces and separate them into a nice array, 
    // e.g. taking the string '{W}{W/B}{B}' and turning it into ['W', 'W/B', 'B'].
    // The second part there removes the slashes and makes the whole thing lowercase.

    if (!manaCost) return [];
    return manaCost.match(/(?<=\{).+?(?=\})/g).map(str => str.replace(/\//g, '').toLowerCase());
}

export function manaSymbolFromString(str) {
    return (
        <i className={`ms ms-cost ms-${str}`}></i>
    );
}
export default {
    parseManaCost,
    manaSymbolFromString,
};