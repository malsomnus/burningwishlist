import _ from 'lodash';
import fs from 'fs';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function extractCardData(card) {
    return {
        cmc: card.convertedManaCost,
        manaCost: card.manaCost,
        name: card.name,
        faceName: card.faceName,
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
        // names: card.names,
        // power: card.power,
        // toughness: card.toughness,
        // loyalty: card.loyalty,
        // layout: card.layout,
        // rarity: card.rarity,
    };
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const src = './data/mtg.json';
const dst = './data/lessmtg.json';
const data = JSON.parse(fs.readFileSync(src, 'utf8')).data;
console.log('Data read successfully');

let output = {};

Object.keys(data).forEach((name, idx) => {
    // Some cards are, in fact, two cards! (Split, flip, etc.)
    // Split card example: Appeal // Authority
    // Flip card example: Clearwater Pathway // Murkwater Pathway

    // if (idx % 1000 === 0) {
    //     console.log(`Processing: ${idx}/${Object.keys(data).length}`);
    // }

    data[name].forEach(card => {
        output[card.faceName || card.name] = extractCardData(card);
    })
});

fs.writeFileSync(dst, JSON.stringify(output));
console.log(dst, 'written successfully!');
