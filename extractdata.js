import _ from 'lodash';
import fs from 'fs';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function extractCardData(card) {
    return {
        cmc: card.convertedManaCost,
        manaCost: card.manaCost,
        name: card.name,
        faceName: card.faceName,
        otherFaceName: card.otherFaceName,
        // sets: card.printings,
        // multiverseId: card.multiverseId,
        color: (colors => {
            if (colors.length === 0) return 'Colorless';
            else if (colors.length > 1) return 'Multicolored';
            else return {W: 'White', U: 'Blue', B: 'Black', R: 'Red', G: 'Green'}[colors[0]];
        })(card.colors),
        colorIdentity: card.colorIdentity,
        type: card.type,
        text: card.text,
        names: card.names,
        power: card.power,
        toughness: card.toughness,
        // loyalty: card.loyalty,
        // layout: card.layout,
        // rarity: card.rarity,
    };
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const src = './data/mtg.json';
const dst = './data/lessmtg.json';
const dst4dev = './src/lessmtg.json';
const data = JSON.parse(fs.readFileSync(src, 'utf8')).data;
console.log('Data read successfully');

let output = {};

Object.keys(data).forEach((name, idx) => {
    // Some cards are, in fact, two cards! (Split, flip, etc.)
    // Split card example: Appeal // Authority
    // Flip card example: Clearwater Pathway // Murkwater Pathway
    // (I'm optimistically assuming that we aren't going to see cards with more than 2 faces any time soon)

    // if (idx % 1000 === 0) {
    //     console.log(`Processing: ${idx}/${Object.keys(data).length}`);
    // }

    if (name.match(/^A-/)) {
        return; // Fuck MTGA
    }

    if (data[name].length === 1) {
        // Regular card
        output[name] = extractCardData(data[name][0]);
    }
    else {
        // Two faced card
        output[data[name][0].faceName] = extractCardData({ ...data[name][0], otherFaceName: data[name][1].faceName });
        output[data[name][1].faceName] = extractCardData({ ...data[name][1], otherFaceName: data[name][0].faceName });
    }
});

fs.writeFileSync(dst, JSON.stringify(output));
fs.writeFileSync(dst4dev, JSON.stringify(output));
console.log(dst, 'written successfully!');
