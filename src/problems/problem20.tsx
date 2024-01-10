import _ from 'lodash';
import Problem from './problem';

class ElfSieve {
    sieve: number[];

    constructor(
        max: number,
        public readonly max_deliveries: number,
        public readonly factor: number)
    {
        this.sieve = [];
        for (let i = 0; i <= max; i++) {
            this.sieve.push(0);
        }
        this.build();
    }

    private build() {
        const len = this.sieve.length;
        const sieve = this.sieve;
        const factor = this.factor;

        for (let n = 1; n < len; n++) {
            const amt = n * factor;
            const last_delivery_idx = (this.max_deliveries == -1) ? len : Math.min(len, n * (this.max_deliveries + 1));
            let d = 0;
            for (let i = n; i < last_delivery_idx; i += n) {
                sieve[i] += amt;
                d++;
            }
        }
    }

    find_house_number(min_presents: number): number {
        for (let i = 0, len = this.sieve.length; i < len; i++) {
            if (this.sieve[i] >= min_presents) {
                return i;
            }
        }
        throw Error(`Unable to find house with ${min_presents} presents or more.`);
    }
}

async function part1(input: string): Promise<number> {
    const tgt_number = parseInt(input.trim());

    const sieve = new ElfSieve(tgt_number / 20, -1, 10);
    let house_number = sieve.find_house_number(tgt_number);
    return house_number;
}

async function part2(input: string): Promise<number> {
    const tgt_number = parseInt(input.trim());

    const sieve = new ElfSieve(tgt_number / 20, 50, 11);
    let house_number = sieve.find_house_number(tgt_number);
    return house_number;
}

function Problem20() {
    return (
        <Problem
            day = { 20 }
            part1 = { part1 }
            part2 = { part2 }
            inputs = {[
                "input_20.txt",
            ]}
            problem_link = "https://adventofcode.com/2015/day/20"
        />
    )
}

export default Problem20;