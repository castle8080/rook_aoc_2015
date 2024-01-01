import _ from 'lodash'
import Problem from './problem'

function parse_input(input: string): Array<[number, number]> {
    const content = input.trim();
    return _.map(content, c => { switch (c) {
        case "<": return [-1, 0];
        case ">": return [1, 0];
        case "^": return [0, 1];
        case "v": return [0, -1];
        default: {
            throw new Error(`Invalid input: ${c}`);
        }
    }});
}

async function part1(input: string): Promise<number> {
    const movements = parse_input(input);
    const houses = new Map<string, number>();

    let cur: [number, number] = [0, 0];
    houses.set(cur.toString(), 1);
    for (const [dx, dy] of movements) {
        cur = [cur[0] + dx, cur[1] + dy];
        const k = cur.toString();
        houses.set(k, (houses.get(k) || 0) + 1);
    }

    return houses.size;
}

async function part2(input: string): Promise<number> {
    const movements = parse_input(input);
    const houses = new Map<string, number>();

    let santa: [number, number] = [0, 0];
    let robo_santa: [number, number] = [0, 0];
    let santas = [santa, robo_santa];

    houses.set(santa.toString(), 1);

    for (const [idx, [dx, dy]] of movements.entries()) {
        const santa_id = idx % santas.length;
        santas[santa_id][0] += dx;
        santas[santa_id][1] += dy;

        const k = santas[santa_id].toString();
        houses.set(k, (houses.get(k) || 0) + 1);
    }

    return houses.size;
}

function Problem3() {
    return (
        <Problem
            day = { 3 }
            part1 = { part1 }
            part2 = { part2 }
            inputs = {[ "input_03.txt", "input_03_test.txt" ]}
            problem_link = "https://adventofcode.com/2015/day/3"
        />
    )
}

export default Problem3