import _ from 'lodash';
import { max_by } from '../serpent';
import Problem from './problem';

//Dancer can fly 27 km/s for 5 seconds, but then must rest for 132 seconds.

const REINDEER_REGEX = /^([\S]+) can fly (\d+) km\/s for (\d+) seconds, but then must rest for (\d+) seconds\.$/;

class Reindeer {
    constructor(
        public readonly name: string,
        public readonly speed: number,
        public readonly endurance: number,
        public readonly rest: number,
    ) {}

    get_distance(time: number): number {
        const cycle_count = Math.floor(time / (this.endurance + this.rest));
        const remaining_time = time % ((this.endurance + this.rest));
        const remaining_travel_time = Math.min(this.endurance, remaining_time);

        return (
            cycle_count * this.speed * this.endurance +
            this.speed * remaining_travel_time
        );
    }

    static parse(line: string): Reindeer {
        const m = line.match(REINDEER_REGEX);
        if (!m) {
            throw Error(`Invalid reindeer: ${line}`);
        }

        return new Reindeer(
            m[1],
            parseInt(m[2]),
            parseInt(m[3]),
            parseInt(m[4]),
        );
    }

    static parse_all(input: string): Reindeer[] {
        return input
            .split("\n")
            .filter((line) => line.length > 0)
            .map(Reindeer.parse);
    }
}

function run_reindeer_race(reindeers: Reindeer[], time: number) {
    let points: Map<string, number> = new Map();

    for (let time_pos = 1; time_pos <= time; time_pos++) {
        let max_d = -1;
        let winners: string[] = [];

        for (const reindeer of reindeers) {
            const d = reindeer.get_distance(time_pos);
            if (d > max_d) {
                max_d = d;
                winners = [reindeer.name];
            }
            else if (d == max_d) {
                winners.push(reindeer.name);
            }
        }

        for (const winner of winners) {
            points.set(winner, (points.get(winner) ?? 0) + 1);
        }
    }

    return points;
}

async function part1(input: string): Promise<number> {
    const reindeers = Reindeer.parse_all(input);
    const time = 2503;

    const reindeer_distances: [number, Reindeer][] = reindeers.map((r) => [r.get_distance(time), r]);
    console.log(reindeer_distances);

    let [distance, _winner] = max_by(reindeer_distances, (r1, r2) => r1[0] - r2[0])!;
    console.log(distance, _winner);
    return distance;
}

async function part2(input: string): Promise<number> {
    const reindeers = Reindeer.parse_all(input);
    const time = 2503;
    const points = run_reindeer_race(reindeers, time);
    console.log(points);

    let [_, winner_points] = max_by(points.entries(), (r1, r2) => r1[1] - r2[1])!;
    return winner_points;
}

function Problem14() {
    return (
        <Problem
            day = { 14 }
            part1 = { part1 }
            part2 = { part2 }
            inputs = {[
                "input_14.txt",
            ]}
            problem_link = "https://adventofcode.com/2015/day/14"
        />
    )
}

export default Problem14;