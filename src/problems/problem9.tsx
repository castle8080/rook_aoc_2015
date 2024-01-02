import _ from 'lodash';
import Problem from './problem';

interface Trip {
    start: string,
    end: string,
    distance: number,
}

const TRIP_REGEX = /^\s*(\S+)\s+to\s+(\S+)\s+=\s+(\d+)\s*$/;

function parse_trip(line: string): Trip {
    const m = line.match(TRIP_REGEX);
    if (!m) {
        throw Error(`Invalid trip: ${line}`);
    }

    return {
        start: m[1],
        end: m[2],
        distance: parseInt(m[3]),
    };
}

function parse_trips(input: string) {
    return input
        .split("\n")
        .filter((s) => s.length > 0)
        .map(parse_trip);
}

class TripFinder {
    nodes: Map<string, Map<string, number>>;

    constructor() {
        this.nodes = new Map();
    }

    add_all(trips: Trip[]) {
        for (let trip of trips) {
            this.add_connection(trip.start, trip.end, trip.distance);
        }
    }

    add_connection(start: string, end: string, distance: number) {
        this.add_connection_one_direction(start, end, distance);
        this.add_connection_one_direction(end, start, distance);
    }

    add_connection_one_direction(start: string, end: string, distance: number) {
        let node = this.nodes.get(start);
        if (node === undefined) {
            node = new Map();
            this.nodes.set(start, node);
        }
        node.set(end, distance);
    }

    find_min() {
        return this.find((new_cost, old_cost) => new_cost < old_cost);
    }

    find_max() {
        return this.find((new_cost, old_cost) => new_cost > old_cost);
    }

    find(take_new_cost: (new_cost: number, old_cost: number) => boolean): [number, string[]] {
        let prev_cost: number|undefined = undefined;
        let prev_path: string[]|undefined = undefined;

        this.find_recurse([], new Set(), 0, (path, cost) => {
            if (prev_cost === undefined || take_new_cost(cost, prev_cost)) {
                prev_cost = cost;
                prev_path = [... path];
            }
        });

        if (prev_cost === undefined) {
            throw Error(`Unable to find a path.`);
        }

        return [prev_cost!, prev_path!];
    }

    find_recurse(
        path: string[],
        visited: Set<string>,
        cost: number,
        on_path: (path: string[], cost: number) => void)
    {
        if (path.length == this.nodes.size) {
            on_path(path, cost);
        }

        let next_nodes: IterableIterator<[string, number]>;

        if (path.length == 0) {
            next_nodes = [...this.nodes.keys()].map((n) => [n, 0] as [string, number]).values();
        }
        else {
            const current = path[path.length - 1];
            next_nodes = this.nodes.get(current)!.entries();
        }

        for (const [next_node, next_cost] of next_nodes) {
            if (!visited.has(next_node)) {
                path.push(next_node);
                visited.add(next_node);

                this.find_recurse(path, visited, cost + next_cost, on_path);

                visited.delete(next_node);
                path.pop();
            }
        }
    }
}

async function part1(input: string): Promise<number> {
    const trip_finder = new TripFinder();
    const trips = parse_trips(input);
    trip_finder.add_all(trips);
    const [cost, _path] = trip_finder.find_min();
    return cost;
}

async function part2(input: string): Promise<number> {
    const trip_finder = new TripFinder();
    const trips = parse_trips(input);
    trip_finder.add_all(trips);
    const [cost, _path] = trip_finder.find_max();
    return cost;
}

function Problem9() {
    return (
        <Problem
            day = { 9 }
            part1 = { part1 }
            part2 = { part2 }
            inputs = {[
                "input_09.txt",
                "input_09_test.txt",
            ]}
            problem_link = "https://adventofcode.com/2015/day/9"
        />
    )
}

export default Problem9;