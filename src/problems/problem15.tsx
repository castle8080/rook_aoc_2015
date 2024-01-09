import _ from 'lodash';
import Problem from './problem';

// Candy: capacity 0, durability -1, flavor 0, texture 5, calories 8

class Ingredient {

    constructor(
        public readonly name: string,
        public readonly capacity: number,
        public readonly durability: number,
        public readonly flavor: number,
        public readonly texture: number,
        public readonly calories: number,
    ) {}

    static parse_all(input: string): Ingredient[] {
        return input
            .split('\n')
            .filter((s) => s.length > 0)
            .map(Ingredient.parse);
    }

    static parse(line: string): Ingredient {
        const parts = line.split(':');
        if (parts.length != 2) {
            throw Error(`Invalid ingredient: ${line}`);
        }
        const name = parts[0].trim();
        const attr_map: Map<string, number> = new Map();

        for (const attr of parts[1].trim().split(",")) {
            const pair = attr.trim().split(' ');
            if (pair.length != 2) {
                throw Error(`Invalid attribute pair: ${attr}`);
            }
            attr_map.set(pair[0], parseInt(pair[1]))
        }

        function get_attr(attr_name: string): number {
            let v = attr_map.get(attr_name);
            if (v === undefined) {
                throw Error(`Missing attribute: ${attr_name}`);
            }
            return v;
        }

        return new Ingredient(
            name,
            get_attr('capacity'),
            get_attr('durability'),
            get_attr('flavor'),
            get_attr('texture'),
            get_attr('calories'),
        )
    }
}

class Ingredients {
    ingredient_amounts: number[];

    constructor(
        public readonly max_units: number,
        public readonly ingredients: Ingredient[]
    ) {
        this.ingredient_amounts = [];
        this.initialize_all_first_ingredient();
    }

    calories() {
        let total = 0;
        for (let i = 0; i < this.ingredients.length; i++) {
            total += this.ingredients[i].calories * this.ingredient_amounts[i];
        }
        return total;
    }

    score() {
        let capacity = 0;
        let durability = 0;
        let flavor = 0;
        let texture = 0;

        for (let i = 0; i < this.ingredients.length; i++) {
            capacity += this.ingredients[i].capacity * this.ingredient_amounts[i];
            durability += this.ingredients[i].durability * this.ingredient_amounts[i];
            flavor += this.ingredients[i].flavor * this.ingredient_amounts[i];
            texture += this.ingredients[i].texture * this.ingredient_amounts[i];
        }

        const normalize = (n: number) => n >= 0 ? n : 0;
        return normalize(capacity) * normalize(durability) * normalize(flavor) * normalize(texture);
    }

    optimize(constraints: (ingredients: Ingredients) => boolean): number {
        let best_score: null|number = null;
        let best_amounts: null|number[] = null;

        this.initialize_all_first_ingredient();
        this.try_combinations(0, () => {
            if (!constraints(this)) {
                return;
            }
            const score = this.score();
            if (best_score == null || score > best_score) {
                best_score = score;
                best_amounts = [...this.ingredient_amounts];
            }
        });

        if (best_score == null) {
            throw Error(`Not able to find optimal ingredient amounts.`);
        }

        // Set the amounts to the optimal
        this.ingredient_amounts = best_amounts!;

        return best_score;
    }

    initialize_all_first_ingredient() {
        // Initialize all up front
        this.ingredient_amounts = this.ingredients.map((_) => 0);
        this.ingredient_amounts[0] = this.max_units;
    }

    try_combinations(pos: number, on_combination: () => void) {
        if (pos == this.ingredient_amounts.length - 1) {
            on_combination();
            return;
        }

        const pos_max = this.ingredient_amounts[pos];

        for (let change = 0; change <= pos_max; change++) {
            this.ingredient_amounts[pos] = pos_max - change;
            this.ingredient_amounts[pos+1] = change;
            this.try_combinations(pos + 1, on_combination);
        }

        this.ingredient_amounts[pos] = pos_max;
        this.ingredient_amounts[pos+1] = 0;
    }
}

async function part1(input: string): Promise<number> {
    const ingredients = new Ingredients(100, Ingredient.parse_all(input));
    const score = ingredients.optimize((_) => true);
    return score;
}

async function part2(input: string): Promise<number> {
    const ingredients = new Ingredients(100, Ingredient.parse_all(input));
    const score = ingredients.optimize((ingredients) => ingredients.calories() == 500);
    return score;
}

function Problem15() {
    return (
        <Problem
            day = { 15 }
            part1 = { part1 }
            part2 = { part2 }
            inputs = {[
                "input_15.txt",
                "input_15_test.txt",
            ]}
            problem_link = "https://adventofcode.com/2015/day/15"
        />
    )
}

export default Problem15;