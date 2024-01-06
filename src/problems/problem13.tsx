import _ from 'lodash';
import Problem from './problem';
import { optimizeDeps } from 'vite';

// David would gain 41 happiness units by sitting next to Carol.
//                                 Alice would lose 2 happiness units by sitting next to Bob.
const CONNECTION_LINE_REGEX = /^([a-zA-Z]+) would (lose|gain) (\d+) happiness units by sitting next to ([a-zA-Z]+)\.$/;

interface Connection {
    person1: string;
    person2: string;
    happiness: number;
}

function parse_connection(line: string): Connection {
    const m = line.match(CONNECTION_LINE_REGEX);
    if (!m) {
        throw Error(`Invalid line: ${line}.`);
    }

    let sign = 1;
    switch (m[2]) {
        case "lose":
            sign = -1;
            break;
        case "gain":
            sign = 1;
            break;
        default:
            throw Error(`Invalid operation ${m[2]}`);
    }

    const happiness = parseInt(m[3]) * sign;

    return {
        person1: m[1],
        person2: m[4],
        happiness: happiness,
    }
}

function parse_connections(input: string): Connection[] {
    return input
        .split("\n")
        .filter((l) => l.length > 0)
        .map(parse_connection);
}

function array_swap<T>(arr: T[], a: number, b: number) {
    const tmp = arr[a];
    arr[a] = arr[b];
    arr[b] = tmp;
}

interface HappinessArrangement {
    arrangement: string[];
    happiness: number;
}

class HappinessGraph {
    connections: Map<string, Map<string, number>>;

    constructor() {
        this.connections = new Map();
    }

    add_all(connections: Connection[]) {
        for (const c of connections) {
            this.add_connection(c);
        }
    }

    add_connection(connection: Connection) {
        this.add_connection_direction(connection.person1, connection.person2, connection.happiness);
        this.add_connection_direction(connection.person2, connection.person1, connection.happiness);
    }

    add_connection_direction(person1: string, person2: string, happiness: number) {
        let edges = this.connections.get(person1);
        if (edges == undefined) {
            edges = new Map();
            this.connections.set(person1, edges);
        }

        let prev_happiness = edges.get(person2);
        if (prev_happiness === undefined) {
            prev_happiness = 0;
        }
        prev_happiness += happiness;
        edges.set(person2, prev_happiness);
    }

    calculate_happiness(arrangement: string[]): number {
        let total_happiness = 0;
        for (let i = 0; i < arrangement.length; i++) {
            let next_i = (i + 1) % arrangement.length;
            let h = this.connections.get(arrangement[i])!.get(arrangement[next_i])!;
            total_happiness += h;
        }
        return total_happiness;
    }

    find_max_arrangement(): HappinessArrangement {

        // Recursively generate arrangments.
        function visit_arrangements(arrangement: string[], pos: number, on_arrangement: (arrangment: string[]) => void) {
            if (pos >= arrangement.length) {
                on_arrangement(arrangement);
            }
            else {
                for (let i = pos, len = arrangement.length; i < len; i++) {
                    array_swap(arrangement, i, pos);
                    visit_arrangements(arrangement, pos+1, on_arrangement);
                    array_swap(arrangement, i, pos);
                }
            }
        }

        let people = [...this.connections.keys()];
        let optimal: HappinessArrangement|null = null;

        visit_arrangements(people, 1, (arrangement) => {
            const h = this.calculate_happiness(arrangement);
            if (optimal == null || optimal.happiness < h) {
                optimal = {
                    happiness: h,
                    arrangement: [...arrangement],
                };
            }
        });

        return optimal!;
    }
}

async function part1(input: string): Promise<number> {
    const connections = parse_connections(input);
    const graph = new HappinessGraph();

    graph.add_all(connections);
    const arrangement = graph.find_max_arrangement();

    console.log(arrangement);

    return arrangement.happiness;
}

async function part2(input: string): Promise<number> {
    return -1;
}

function Problem13() {
    return (
        <Problem
            day = { 13 }
            part1 = { part1 }
            part2 = { part2 }
            inputs = {[
                "input_13.txt",
                "input_13_test.txt",
            ]}
            problem_link = "https://adventofcode.com/2015/day/13"
        />
    )
}

export default Problem13;