import { _ } from 'lodash';
import Problem from './problem';

const AUNT_LINE_REGEX = /^\s*(\S+) (\d+): (.*)/;
const ATTR_PAIR_REGEX = /^\s*(\S+): (\d+)\s*$/;

interface AuntAttributes {
    [key: string]: number
}

interface AuntAttributeConstraints {
    [key: string]: (n: number) => boolean
}

function basic_aunt_constraints(attrs: AuntAttributes): AuntAttributeConstraints {
    let constraints: AuntAttributeConstraints = {};
    for (const k of Object.keys(attrs)) {
        constraints[k] = (n: number) => n == attrs[k];
    }
    return constraints;
}

class Aunt {
    attributes: AuntAttributes;

    constructor(
        public readonly name: string,
        public readonly id: number)
    {
        this.attributes = {};
    }

    satisfies(attrs: AuntAttributeConstraints): boolean  {
        for (const k of Object.keys(attrs)) {
            const value = this.attributes[k];
            if (value !== undefined) {
                if (!attrs[k](value)) {
                    return false;
                }
            }

        }
        return true;
    }

    add(attr: string, value: number) {
        this.attributes[attr] = value;
    }

    static parse(line: string): Aunt {
        const main_match = line.match(AUNT_LINE_REGEX);
        if (main_match == null) {
            throw Error(`Invalid line: ${line}`);
        }

        const name = main_match[1];
        const id = parseInt(main_match[2]);
        const attr_text = main_match[3];

        const aunt = new Aunt(name, id);

        for (let pair_text of attr_text.split(',')) {
            const m = pair_text.match(ATTR_PAIR_REGEX);
            if (!m) {
                throw Error(`Invalid pair: ${pair_text}`);
            }
            aunt.add(m[1], parseInt(m[2]));
        }

        return aunt;
    }

    static parse_all(input: string): Aunt[] {
        return input
            .split('\n')
            .filter((s) => s.length > 0)
            .map(Aunt.parse);
    }

}

async function run_part(input: string, requirements: AuntAttributeConstraints): Promise<number> {
    const aunties = Aunt.parse_all(input);
    const matches = aunties.filter((aunt) => aunt.satisfies(requirements));
    if (matches.length != 1) {
        throw Error(`Unexpected match count: ${matches.length}.`);
    }

    console.log("Matched: ", matches[0]);

    return matches[0].id;
}

async function part1(input: string): Promise<number> {
    return run_part(input, basic_aunt_constraints({
        children: 3,
        cats: 7,
        samoyeds: 2,
        pomeranians: 3,
        akitas: 0,
        vizslas: 0,
        goldfish: 5,
        trees: 3,
        cars: 2,
        perfumes: 1,
    }));
}

async function part2(input: string): Promise<number> {
    return run_part(input, {
        // There are greater than
        trees: (n) => n > 3,
        cats: (n) => n > 7,
        
        // There are less than
        pomeranians: (n) => n < 3,
        goldfish: (n) => n < 5,

        // Same
        children: (n) => n == 3,
        samoyeds: (n) => n == 2,
        akitas: (n) => n == 0,
        vizslas: (n) => n == 0,
        cars: (n) => n == 2,
        perfumes: (n) => n == 1,
    });
}

function Problem16() {
    return (
        <Problem
            day = { 16 }
            part1 = { part1 }
            part2 = { part2 }
            inputs = {[
                "input_16.txt",
                "input_16_test.txt",
            ]}
            problem_link = "https://adventofcode.com/2015/day/16"
        />
    )
}

export default Problem16;