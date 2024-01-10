import _ from 'lodash';
import Problem from './problem';

const SUBSTITUTION_REGEX = /^\s*(\S+)\s+=>\s*(\S+)\s*$/;
const MEDICINE_REGEX = /^(\S+)$/;

interface MoleculePart {
    readonly text: string;
    readonly replaceable: boolean;
}

class MoleculeReplacements {
    replacements: Map<string, string[]>;
    replacements_reversed: Map<string, string>;
    medicine: string;

    constructor() {
        this.replacements = new Map();
        this.replacements_reversed = new Map();
        this.medicine = "";
    }

    set_medicine(medicine: string) {
        this.medicine = medicine;
    }

    add(key: string, replacement: string) {
        let replacements = this.replacements.get(key);
        if (replacements === undefined) {
            replacements = [];
            this.replacements.set(key, replacements);
        }
        replacements.push(replacement);

        // Add the reverse operation
        this.replacements_reversed.set(replacement, key);
    }

    get_all_single_replacements(): Set<string> {
        const parts = this.get_medicine_parts();

        const generate_molecule = (part_idx: number, replacement: string): string => {
            return parts.map((p, idx) => idx == part_idx ? replacement : p.text).join('');
        };

        const molecules: Set<string> = new Set();

        for (const [part_idx, part] of parts.entries()) {
            if (part.replaceable) {
                for (const replacement of this.replacements.get(part.text)!) {
                    molecules.add(generate_molecule(part_idx, replacement));
                }
            }
        }

        return molecules;
    }

    condense(): [string, number] {
        const key_regex = new RegExp([...this.replacements_reversed.keys()].join("|"), "g");

        let medicine = this.medicine;
        let total_changes = 0;

        while (true) {
            let parts = this.get_medicine_parts_generic(key_regex, medicine);
            let changes = 0;
            const buffer = [];
            for (const part of parts) {
                if (part.replaceable) {
                    buffer.push(this.replacements_reversed.get(part.text)!);
                    changes++;
                }
                else {
                    buffer.push(part.text);
                }
            }
            if (changes == 0) {
                return [medicine, total_changes];
            }
            else {
                total_changes += changes;
                medicine = buffer.join('');
            }
        }
    }

    get_medicine_parts(): MoleculePart[] {
        let key_regex = new RegExp([...this.replacements.keys()].join("|"), "g");
        return this.get_medicine_parts_generic(key_regex, this.medicine);
    }

    get_medicine_parts_generic(key_regex: RegExp, medicine: string): MoleculePart[] {
        let parts: MoleculePart[] = [];

        let pos = 0;
        while (true) {
            let m = key_regex.exec(medicine);
            if (m) {
                const match_str = m[0];
                const match_start = key_regex.lastIndex - match_str.length;
                if (match_start > pos) {
                    parts.push({ text: medicine.substring(pos, match_start), replaceable: false });
                }
                parts.push({ text: m[0], replaceable: true });
                pos = key_regex.lastIndex;
            }
            else {
                if (pos < medicine.length) {
                    parts.push({ text: medicine.substring(pos), replaceable: false });
                }
                break;
            }
        }

        return parts;
    }

    static parse(input: string): MoleculeReplacements {
        let molecule_replacements = new MoleculeReplacements();

        for (const line of input.split('\n')) {
            if (line.length == 0) {
                continue;
            }

            let m = line.match(SUBSTITUTION_REGEX);
            if (m) {
                molecule_replacements.add(m[1], m[2]);
                continue;
            }

            m = line.match(MEDICINE_REGEX);
            if (m) {
                molecule_replacements.set_medicine(m[1]);
                continue;
            }

            throw Error(`Invalid line: ${line}`);
        }

        if (molecule_replacements.medicine == "") {
            throw Error(`Missing medicine line.`);
        }

        return molecule_replacements;
    }
}

async function part1(input: string): Promise<number> {
    const medicine_replacements = MoleculeReplacements.parse(input);
    const new_molecules = medicine_replacements.get_all_single_replacements();
    return new_molecules.size;
}

async function part2(input: string): Promise<number> {
    const medicine_replacements = MoleculeReplacements.parse(input);
    const [condensed_medicine, changes] = medicine_replacements.condense();
    console.log("condensed_medicine: " + condensed_medicine + " in " + changes);

    if (condensed_medicine != "e") {
        throw Error(`Not able to achieve target molecule condensed state.`);
    }

    return changes;
}

function Problem19() {
    return (
        <Problem
            day = { 19 }
            part1 = { part1 }
            part2 = { part2 }
            inputs = {[
                "input_19.txt",
                "input_19_test.txt",
            ]}
            problem_link = "https://adventofcode.com/2015/day/19"
        />
    )
}

export default Problem19;