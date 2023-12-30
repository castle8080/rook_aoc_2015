import _ from 'lodash'
import Problem from '../problem'

function parse_input(input: string): Array<number> {
    const content = input.trim();
    return _.map(content, c => { switch (c) {
        case "(": return 1;
        case ")": return -1;
        default: {
            throw new Error(`Invalid input: ${c}`);
        }
    }});
}

async function part1(input: string): Promise<Number> {
    const instructions = parse_input(input);
    const result = _.sum(instructions);
    return result;
}

async function part2(input: string): Promise<Number|undefined> {
    const instructions = parse_input(input);

    // I wish js had something like scala's scan
    let floor = 0;
    for (let i = 0; i < instructions.length; i++) {
        floor += instructions[i];
        if (floor == -1) {
            return i + 1;
        }
    }

    throw Error("Never found the desired floor.");
}

function Problem1() {
    // I'd like to pass in both so that only 1 starts at a time.
    return (
        <Problem
            day = { 1 }
            part1 = { part1 }
            part2 = { part2 }
            inputs = {[ "input/input_01.txt", "input/input_01_test.txt" ]}
            problem_link = "https://adventofcode.com/2015/day/1"
        />
    )
}

export default Problem1
