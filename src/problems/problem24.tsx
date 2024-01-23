import _ from 'lodash';
import Problem from './problem';

/**
 * Get the numbers which are not in items.
 */
function items_not_in(numbers: number[], items: number[]) {
    const item_set = new Set(items);
    return numbers.filter(n => !item_set.has(n));
}

function product(numbers: number[]): number {
    return numbers.reduce((a, b) => a * b, 1);
}

/**
 * Holds a grouping of numbers while tracking it's total.
 */
class Bag {
    public total: number;
    public quantum_entanglement: number;
    public items: number[];

    private constructor(items: number[], total: number, quantum_entanglement: number) {
        this.items = items;
        this.total = total;
        this.quantum_entanglement = quantum_entanglement;
    }

    clone(): Bag {
        return new Bag([...this.items], this.total, this.quantum_entanglement);
    }

    add(n: number) {
        this.items.push(n);
        this.total += n;
        this.quantum_entanglement *= n;
    }

    pop() {
        if (this.items.length > 0) {
            var v = this.items.pop()!;
            this.total -= v;
            this.quantum_entanglement /= v;
        }
    }

    static create_n_empty(n: number): Bag[] {
        const bags: Bag[] = [];
        for (let i = 0; i < n; i++) {
            bags.push(Bag.create([]));
        }
        return bags;
    }

    static create(items: number[]): Bag {
        return new Bag(items, _.sum(items), product(items));
    }

    static compare(b1: Bag, b2: Bag): number {
        let v = b1.items.length - b2.items.length;
        if (v == 0) {
            v = b1.quantum_entanglement - b2.quantum_entanglement;
        }
        return v;
    }
}

class BagSplitter {

    /**
     * Try to split into groups where 1 has the low QE.
     */
    static split(numbers: number[], starting_max_depth: number, bag_count: number): Bag[] {
        const total = _.sum(numbers);
        const target = total / bag_count;

        if (total % bag_count != 0) {
            throw Error(`Invalid set of numbers to find groups for.`);
        }

        const bags = BagSplitter.search_initial_bag(numbers, starting_max_depth, target, null).map(Bag.create);
        bags.sort(Bag.compare);

        if (bags.length == 0) {
            throw Error(`Unable to find potential first bags.`);
        }

        for (const bag of bags) {
            const remaining_items = items_not_in(numbers, bag.items);
            const remaining_bags = BagSplitter.search_remaining_split(remaining_items, target, bag_count - 1);

            if (remaining_bags != null) {
                const results: Bag[] = [];
                results.push(bag);
                for (const b of remaining_bags) {
                    results.push(b);
                }
                return results;
            }
        }

        throw Error("Unable to find equal groups.");
    }

    /**
     * Recursively searches for a set of numbers which add to trget from items.
     * max_bagged is used to prune the search.
     * max_collection can be used to prune the search as well. 
     */
    static search_initial_bag(items: number[], max_bagged: number, target: number, max_collection: number|null) {

        const bags: number[][] = [];

        function search_recur(
            bagged: number[],
            total: number,
            i: number)
        {
            // We have collected enough info.
            if (max_collection != null && bags.length >= max_collection) {
                return;
            }

            if (total == target) {
                bags.push([...bagged]);
                return;
            }
            else if (total > target || i >= items.length || bagged.length >= max_bagged) {
                return;
            }

            // Assume sorted. If sorted and the next item is bigger than target
            // there is no way to reach it now.
            if (total + items[i] > target) {
                return;
            }

            bagged.push(items[i]);
            search_recur(bagged, total + items[i], i + 1);
            bagged.pop();

            search_recur(bagged, total, i + 1);
        }

        search_recur([], 0, 0);

        return bags;
    }

    /**
     * Searches for a grouping of items into bag_count groups that all equal target.
     */
    static search_remaining_split(items: number[], target: number, bag_count: number): Bag[]|null {

        function search_split_recur(bags: Bag[], i: number): Bag[]|null {
            if (i >= items.length) {
                return bags.map(g => g.clone());
            }

            for (const b of bags) {
                if (b.total > target) {
                    return null;
                }
                else if (b.total == target) {
                    // Should process next bag.
                    continue;
                }
                else if (b.total + items[i] > target) {
                    // Impossible to get equal bags.
                    return null;
                }
                else {
                    b.add(items[i]);
                    var result = search_split_recur(bags, i + 1);
                    if (result != null) {
                        return result;
                    }
                    else {
                        b.pop();
                    }
                }
            }

            return null;
        }

        return search_split_recur(Bag.create_n_empty(bag_count), 0);
    }
}

/**
 * Parse the inputs.
 */
function parse_numbers(input: string): number[] {
    const numbers =  _.chain(input.split("\n"))
        .map(l => l.trim())
        .filter(l => l.length > 0)
        .map(l => parseInt(l))
        .value();

    numbers.sort((a, b) => a - b);

    return numbers;
}

async function part1(input: string): Promise<number> {
    const numbers = parse_numbers(input);
    const bags = BagSplitter.split(numbers, 6, 3);
    console.log(bags);

    return bags[0].quantum_entanglement;
}

async function part2(input: string): Promise<number> {
    const numbers = parse_numbers(input);
    const bags = BagSplitter.split(numbers, 6, 4);
    console.log(bags);

    return bags[0].quantum_entanglement;
}

function Problem24() {
    return (
        <Problem
            day = { 24 }
            part1 = { part1 }
            part2 = { part2 }
            inputs = {[
                "input_24.txt",
            ]}
            problem_link = "https://adventofcode.com/2015/day/24"
        />
    )
}

export default Problem24;