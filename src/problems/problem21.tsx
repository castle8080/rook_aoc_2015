import _ from 'lodash';
import Problem from './problem';

const ITEM_SHOP_TEXT = `
    Weapons:    Cost  Damage  Armor
    Dagger        8     4       0
    Shortsword   10     5       0
    Warhammer    25     6       0
    Longsword    40     7       0
    Greataxe     74     8       0

    Armor:      Cost  Damage  Armor
    Leather      13     0       1
    Chainmail    31     0       2
    Splintmail   53     0       3
    Bandedmail   75     0       4
    Platemail   102     0       5

    Rings:      Cost  Damage  Armor
    Damage +1    25     1       0
    Damage +2    50     2       0
    Damage +3   100     3       0
    Defense +1   20     0       1
    Defense +2   40     0       2
    Defense +3   80     0       3
`;

type EquipmentType = 'weapon' | 'armor' | 'ring';

interface Equipment {
    type: EquipmentType;
    name: string;
    cost: number;
    damage: number;
    armor: number;
}

class ItemShop {
    weapons: Equipment[];
    armor: Equipment[];
    rings: Equipment[];

    constructor() {
        this.weapons = [];
        this.armor = [];
        this.rings = [];
    }

    static default(): ItemShop {
        const shop = new ItemShop();
        shop.load(ITEM_SHOP_TEXT);
        return shop;
    }

    add(equipment: Equipment) {
        switch (equipment.type) {
            case 'weapon':
                this.weapons.push(equipment);
                break;
            case 'armor':
                this.armor.push(equipment);
                break;
            case 'ring':
                this.rings.push(equipment);
                break;
        }
    }

    load(menu: string) {
        let equipment_type: EquipmentType = 'weapon';

        for (let line of menu.split('\n')) {
            line = line.trim();
            if (line.length == 0) {
                continue;
            }

            const parts = line.split(/\s+/);
            if (parts.length < 4 || parts.length > 5) {
                throw Error(`Invalid line: ${line}`);
            }

            if (parts[0] == 'Weapons:') {
                equipment_type = 'weapon';
            }
            else if (parts[0] == 'Armor:') {
                equipment_type = 'armor';
            }
            else if (parts[0] == 'Rings:') {
                equipment_type = 'ring';
            }
            else {
                let name: string;
                let pos = 0;

                if (parts.length == 5) {
                    name = parts[0] + ' ' + parts[1];
                    pos = 2;
                }
                else {
                    name = parts[0];
                    pos = 1;
                }

                const equipment: Equipment = {
                    type: equipment_type,
                    name: name,
                    cost: parseInt(parts[pos++]),
                    damage: parseInt(parts[pos++]),
                    armor: parseInt(parts[pos++]),
                };

                this.add(equipment);
            }
        }
    }

    equipment_options(proces_equipment_options: (equipment: Equipment[]) => void) {
        const iterate_ring_options = (equipment: Equipment[]) => {
            // No rings
            proces_equipment_options(equipment);

            // Process with a given ring
            for (let i = 0; i < this.rings.length; i++) {
                const ring = this.rings[i];
                equipment.push(ring);
                proces_equipment_options(equipment);

                // Process with 2 rings
                for (let j = i + 1; j < this.rings.length; j++) {
                    const ring2 = this.rings[j];
                    equipment.push(ring2);
                    proces_equipment_options(equipment);
                    equipment.pop();
                }

                equipment.pop();
            }
        };

        const iterate_options_armor = (equipment: Equipment[]) => {
            // no armor is an option
            iterate_ring_options(equipment);

            for (const armor of this.armor) {
                equipment.push(armor);
                iterate_ring_options(equipment);
                equipment.pop();
            }
        };

        const iterate_options_weapon = () => {
            let equipment: Equipment[] = [];
            for (let weapon of this.weapons) {
                equipment.push(weapon);
                iterate_options_armor(equipment);
                equipment.pop();
            }
        };

        iterate_options_weapon();
    }
}

class Character {

    constructor(
        public readonly name: string,
        public readonly hit_points: number,
        public readonly damage: number,
        public readonly armor: number,
        public readonly equipment: Equipment[],
    ) {
    }

    equipment_cost() {
        return _.sum(this.equipment.map((e) => e.cost));
    }

    with_equipment(equipment: Equipment[]): Character {
        const e_damage = _.sum(equipment.map((e) => e.damage));
        const e_armor = _.sum(equipment.map((e) => e.armor));

        const new_equipment = [...this.equipment];
        for (const e of equipment) {
            new_equipment.push(e);
        }

        return new Character(
            this.name,
            this.hit_points,
            this.damage + e_damage,
            this.armor + e_armor,
            new_equipment,
        );
    }

    static parse(name: string, stats: string): Character {
        let hit_points: number|null = null;
        let damage: number|null = null;
        let armor: number|null = null;

        for (let line of stats.split('\n')) {
            line = line.trim();
            if (line.length == 0) {
                continue;
            }

            let parts = line.split(':');
            if (parts.length != 2) {
                throw Error(`Invalid stats: ${line}`);
            }

            if (parts[0] == 'Hit Points') {
                hit_points = parseInt(parts[1].trim());
            }
            else if (parts[0] == 'Damage') {
                damage = parseInt(parts[1].trim());
            }
            else if (parts[0] == 'Armor') {
                armor = parseInt(parts[1].trim());
            }
            else {
                throw Error(`Invalid stats: ${line}`);
            }
        }

        if (hit_points === null) {
            throw Error(`Missing hit points.`);
        }
        if (damage === null) {
            throw Error(`Missing damage.`);
        }
        if (armor === null) {
            throw Error(`Missing armor.`);
        }

        return new Character(name, hit_points, damage, armor, []);
    }
}

function rounds_to_zero(hp: number, damage: number): number {
    let rounds = Math.floor(hp / damage);
    if (hp % damage > 0) {
        rounds++;
    }
    return rounds;
}

// Have 2 characters fight and return the winner.
// c1 inflicts damage on c2 first.
function simulate_fight(c1: Character, c2: Character): Character {
    const c2_turn_damage = Math.max(c1.damage - c2.armor, 1);
    const c1_turn_damage = Math.max(c2.damage - c1.armor, 1);

    let c2_rounds = rounds_to_zero(c2.hit_points, c2_turn_damage);
    let c1_rounds = rounds_to_zero(c1.hit_points, c1_turn_damage);

    return (c1_rounds >= c2_rounds) ? c1 : c2;
}

async function part1(input: string): Promise<number> {
    const shop = ItemShop.default();
    const boss = Character.parse('boss', input);
    const hero = new Character("player", 100, 0, 0, []);

    let winning_cost = -1;

    shop.equipment_options((equipment) => {
        const hero_equipped = hero.with_equipment(equipment);
        const winner = simulate_fight(hero_equipped, boss);
        if (winner.name == hero_equipped.name) {
            const cost = hero_equipped.equipment_cost();
            if (winning_cost < 0 || cost < winning_cost) {
                winning_cost = cost;
            }
        }
    });

    return winning_cost;
}

async function part2(input: string): Promise<number> {
    const shop = ItemShop.default();
    const boss = Character.parse('boss', input);
    const hero = new Character("player", 100, 0, 0, []);

    let winning_cost = -1;

    shop.equipment_options((equipment) => {
        const hero_equipped = hero.with_equipment(equipment);
        const winner = simulate_fight(hero_equipped, boss);
        if (winner.name != hero_equipped.name) {
            const cost = hero_equipped.equipment_cost();
            if (winning_cost < 0 || cost > winning_cost) {
                winning_cost = cost;
            }
        }
    });

    return winning_cost;
}

function Problem21() {
    return (
        <Problem
            day = { 21 }
            part1 = { part1 }
            part2 = { part2 }
            inputs = {[
                "input_21.txt",
            ]}
            problem_link = "https://adventofcode.com/2015/day/21"
        />
    )
}

export default Problem21;