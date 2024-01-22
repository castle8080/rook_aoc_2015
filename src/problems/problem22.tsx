import _ from 'lodash';
import Problem from './problem';

interface Action {
    readonly name: string;
    readonly mana_cost: number;
    
    is_possible(game: Game, character: Character): boolean;

    apply(game: Game, character: Character): void;
}

abstract class BaseAction implements Action {
    public abstract readonly name: string;
    public abstract readonly mana_cost: number;

    is_possible(game: Game, character: Character): boolean {
        return (
            (character.mana >= this.mana_cost) &&
            !game.is_effect_active(this.name)
        );
    }

    abstract apply(game: Game, character: Character): void;
}

/**
 * Magic Missile costs 53 mana. It instantly does 4 damage.
 */
class MagicMissileAction extends BaseAction {
    public readonly name: string = "MagicMissile";
    public readonly mana_cost: number = 53;

    apply(game: Game, character: Character): void {
        character.mana -= this.mana_cost;

        const opponent = game.get_opponent_for(character.name);
        opponent.hit_points -= 4;
    }
}

/**
 * Drain costs 73 mana. It instantly does 2 damage and heals you for 2 hit points.
 */
class DrainAction extends BaseAction {
    public readonly name: string = "Drain";
    public readonly mana_cost: number = 73;

    apply(game: Game, character: Character): void {
        character.mana -= this.mana_cost;
        
        const opponent = game.get_opponent_for(character.name);
        opponent.hit_points -= 2;
        character.hit_points += 2;
    }
}

/**
 * Shield costs 113 mana. It starts an effect that lasts for 6 turns.
 * While it is active, your armor is increased by 7.
 */
class ShieldAction extends BaseAction {
    public readonly name: string = "Shield";
    public readonly mana_cost: number = 113;

    apply(game: Game, character: Character): void {
        character.mana -= this.mana_cost;
        game.add_effect(new ShieldEffect(character.name));
    }
}

/**
 * Poison costs 173 mana. It starts an effect that lasts for 6 turns. At the start
 * of each turn while it is active, it deals the boss 3 damage.
 */
class PoisonAction extends BaseAction {
    public readonly name: string = "Poison";
    public readonly mana_cost: number = 173;

    apply(game: Game, character: Character): void {
        character.mana -= this.mana_cost;

        const opponent = game.get_opponent_for(character.name);
        game.add_effect(new PoisonEffect(opponent.name));
    }
}

/**
 * Recharge costs 229 mana. It starts an effect that lasts for 5 turns. At the start
 * of each turn while it is active, it gives you 101 new mana.
 */
class RechargeAction extends BaseAction {
    public readonly name: string = "Recharge";
    public readonly mana_cost: number = 229;

    apply(game: Game, character: Character): void {
        character.mana -= this.mana_cost;
        game.add_effect(new RechargeEffect(character.name));
    }
}

/**
 * A basic physical attack.
 */
class AttackAction extends BaseAction {
    public readonly name: string = "Attack";
    public readonly mana_cost: number = 0;
    
    apply(game: Game, character: Character): void {
        if (character.damage < 1) {
            return;
        }
        const opponent = game.get_opponent_for(character.name);

        let damage_amt = character.damage - opponent.armor;
        if (damage_amt < 1) {
            damage_amt = 1;
        }

        opponent.hit_points -= damage_amt;
    }
} 

interface Effect {
    name: string;
    counter: number;

    clone(): Effect;

    on_start(game: Game): void;
    on_turn(game: Game): void;
    on_end(game: Game): void;
}

abstract class BaseEffect implements Effect {

    constructor(
        public name: string,
        public counter: number,
        public character_name: string) {}


    abstract clone(): Effect;

    on_start(game: Game): void {
    }

    on_turn(game: Game): void {
    }

    on_end(game: Game): void {
    }
}

/**
 * Shield costs 113 mana. It starts an effect that lasts for 6 turns.
 * While it is active, your armor is increased by 7.
 */
class ShieldEffect extends BaseEffect {

    constructor(public readonly character_name: string) {
        super("Shield", 6, character_name);
    }

    clone(): Effect {
        let new_effect = new ShieldEffect(this.character_name);
        new_effect.counter = this.counter;
        return new_effect;
    }

    on_start(game: Game) {
        game.get_character(this.character_name).armor += 7;
    }

    on_end(game: Game) {
        game.get_character(this.character_name).armor -= 7;
    }
}

/**
 * Poison costs 173 mana. It starts an effect that lasts for 6 turns. At the start
 * of each turn while it is active, it deals the boss 3 damage.
 */
class PoisonEffect extends BaseEffect {

    constructor(public readonly character_name: string) {
        super("Poison", 6, character_name);
    }
    
    clone(): Effect {
        let new_effect = new PoisonEffect(this.character_name);
        new_effect.counter = this.counter;
        return new_effect;
    }

    on_turn(game: Game): void {
        const target = game.get_character(this.character_name)
        target.hit_points -= 3;
    }
}

/**
 * Recharge costs 229 mana. It starts an effect that lasts for 5 turns. At the start
 * of each turn while it is active, it gives you 101 new mana.
 */
class RechargeEffect extends BaseEffect {

    constructor(public readonly character_name: string) {
        super("Recharge", 5, character_name);
    }
    
    clone(): Effect {
        let new_effect = new RechargeEffect(this.character_name);
        new_effect.counter = this.counter;
        return new_effect;
    }

    on_turn(game: Game): void {
        const target = game.get_character(this.character_name)
        target.mana += 101;
    }
}

type CharacterClass = "Wizard" | "Boss";

interface Character {
    readonly name: string;
    readonly character_class: CharacterClass;
    hit_points: number;
    armor: number;
    damage: number;
    mana: number;

    get_actions(): Action[];

    clone(): Character;
}

class BaseCharacter implements Character {
    constructor(
        public readonly name: string,
        public readonly character_class: CharacterClass,
        public hit_points: number,
        public armor: number,
        public damage: number,
        public mana: number,
        public readonly actions: Action[])
    {
    }

    clone(): Character {
        return new BaseCharacter(
            this.name,
            this.character_class,
            this.hit_points,
            this.armor,
            this.damage,
            this.mana,
            this.actions,
        );
    }

    get_actions(): Action[] {
        return this.actions;
    }

    public static create_wizard(
        name: string,
        hit_points: number,
        mana: number)
    {
        return new BaseCharacter(
            name,
            "Wizard",
            hit_points,
            0,
            0,
            mana,
            [
                new MagicMissileAction(),
                new DrainAction(),
                new ShieldAction(),
                new PoisonAction(),
                new RechargeAction(),
            ]
        );
    }

    public static create_boss(
        name: string,
        hit_points: number,
        damage: number)
    {
        return new BaseCharacter(
            name,
            "Boss",
            hit_points,
            0,
            damage,
            0,
            [
                new AttackAction(),
            ]
        )
    }
}

class Game {
    effects: Effect[];
    turn: number;

    constructor(
        public character1: Character,
        public character2: Character,
    ) {
        this.effects = [];
        this.turn = 0;
    }

    clone(): Game {
        let new_game = new Game(this.character1.clone(), this.character2.clone());
        new_game.turn = this.turn;
        new_game.effects = this.effects.map(e => e.clone());
        return new_game;
    }

    get_game_summary(): string {
        const character = this.get_current_character();
        let summary = "";
        
        summary += `Turn: ${this.turn}\n`;
        summary += `Current Character: ${character.name}\n`;
        for (const c of [this.character1, this.character2]) {
            summary += `Character: name=${c.name} hp=${c.hit_points} armor=${c.armor} mana=${c.mana}\n`;
        }
        
        summary += "Effects:\n";

        for (const e of this.effects) {
            summary += `  [${e.name}] counter=${e.counter}\n`;
        }

        return summary;
    }

    start_turn() {
        this.turn++;
        this.apply_effects();
    }

    get_possible_actions(character: Character): Action[] {
        var potential_actions = character.get_actions();
        return potential_actions.filter(a => a.is_possible(this, character));
    }

    apply_action(character: Character, action: Action) {
        action.apply(this, character);
        if (character.mana < 0) {
            throw Error(`How!`);
        }
    }

    add_effect(effect: Effect) {
        this.effects.push(effect);
        effect.on_start(this);
    }

    is_effect_active(effect_name: string): boolean {
        for (const e of this.effects) {
            if (e.name == effect_name) {
                return true;
            }
        }
        return false;
    }

    apply_effects() {
        const new_effects: Effect[] = [];
        const old_effects: Effect[] = [];

        // Notify effects and split effects still valid and not.
        for (const e of this.effects) {
            e.on_turn(this);
            e.counter--;
            if (e.counter > 0) {
                new_effects.push(e);
            }
            else {
                old_effects.push(e);
            }
        }

        this.effects = new_effects;

        // Close out the effects which aged out.
        for (const e of old_effects) {
            e.on_end(this);
        }
    }

    get_current_character(): Character {
        const n = this.turn % 2;
        switch (n) {
            case 0: return this.character2;
            case 1: return this.character1;
            default:
                throw Error("Impossible.");
        }
    }

    get_opponent_for(name: string): Character {
        for (const c of [this.character1, this.character2]) {
            if (c.name != name) {
                return c;
            }
        }
        throw Error(`Unable to find character: ${name}`);
    }

    get_character(name: string): Character {
        for (const c of [this.character1, this.character2]) {
            if (c.name == name) {
                return c;
            }
        }
        throw Error(`Unable to find character: ${name}`);
    }
}

/**
 * Information about a game, including history, winner, and total mana spent by wizard.
 */
class GameInfo {

    constructor(
        public readonly game: Game,
        public total_wizard_mana_spent: number,
        public winner: string|null,
        public history: Action[],
    ) {}

    clone(): GameInfo {
        return new GameInfo(this.game.clone(), this.total_wizard_mana_spent, this.winner, [...this.history]);
    }
}

/**
 * Searches for a play strategy with minimal total mana cost spent.
 */
class WizardOptimizer {
    private game_info_stack: GameInfo[] = [];
    private optimal_game_info: GameInfo|null = null;

    constructor(public readonly game: Game) {
    }

    run(): GameInfo {
        this.game_info_stack = [new GameInfo(this.game.clone(), 0, null, [])];

        while (true) {
            if (this.optimal_game_info !== null) {
                return this.optimal_game_info;
            }
            var gi = this.game_info_stack.pop();
            if (gi === undefined) {
                throw Error("Unable to find a winner.");
            }
            else {
                this.run_turn(gi);
            }
        }

    }

    on_win(gi: GameInfo) {
        const winner = gi.game.get_character(gi.winner!);
        if (winner.character_class == "Wizard") {
            if (this.optimal_game_info === null ||
                gi.total_wizard_mana_spent < this.optimal_game_info.total_wizard_mana_spent)
            {
                this.optimal_game_info = gi.clone();
            }
        }
    }

    check_zero_hp(gi: GameInfo): boolean {
        if (gi.game.character1.hit_points <= 0) {
            gi.winner = gi.game.character2.name;
            return true;
        }
        else if (gi.game.character2.hit_points <= 0) {
            gi.winner = gi.game.character1.name;
            return true;
        }
        return false;
    }

    add_game_info(gi: GameInfo) {
        // TODO find or build a heap data structure
        this.game_info_stack.push(gi);
        this.game_info_stack.sort((gi1, gi2) => gi2.total_wizard_mana_spent - gi1.total_wizard_mana_spent);
    }

    prune_game(gi: GameInfo): boolean {
        
        // Juse assume the wizard dies
        if ((gi.game.character2.hit_points - gi.game.character1.hit_points) >= 35) {
            return true;
        }

        return false;
    }

    run_turn(gi: GameInfo) {
        if (gi.winner != null) {
            this.on_win(gi);
            return;
        }

        if (this.prune_game(gi)) {
            return;
        }

        const game = gi.game;
        game.start_turn();

        // Check for death after effects
        if (this.check_zero_hp(gi)) {
            this.add_game_info(gi);
            return;
        }

        const character = game.get_current_character();
        const actions = game.get_possible_actions(character);

        if (actions.length == 0) {
            var opponent = game.get_opponent_for(character.name);
            gi.winner = opponent.name;
            this.add_game_info(gi);
            return;
        }
        else if (actions.length == 1) {
            // For actions of length 1 no need to clone.
            if (character.character_class == 'Wizard') {
                gi.total_wizard_mana_spent += actions[0].mana_cost;
            }
            
            game.apply_action(character, actions[0]);
            gi.history.push(actions[0]);
            this.check_zero_hp(gi);
            this.add_game_info(gi);
        }
        else {
            for (const action of this.prune_wizard_actions(gi.game, actions)) {
                let new_gi = gi.clone();
                let new_character = new_gi.game.get_character(character.name);
                if (new_character.character_class == 'Wizard') {
                    new_gi.total_wizard_mana_spent += action.mana_cost;
                }

                new_gi.game.apply_action(new_character, action);
                new_gi.history.push(action);
                this.check_zero_hp(new_gi);
                this.add_game_info(new_gi);
            }
        }
    }

    prune_wizard_actions(game: Game, actions: Action[]): Action[] {
        const wizard = game.character1;
        const boss = game.character2;

        // On 1 action ust return.
        if (actions.length == 1) {
            return actions;
        }

        // Yeah best option is to fire magic missile
        if (boss.hit_points <= 4 && wizard.mana >= 53) {
            return [new MagicMissileAction()];
        }

        // You know you need to recharge
        const recharge_action = actions.find(a => a.name == 'Recharge');
        if (recharge_action && boss.hit_points > 20 && wizard.mana < 400) {
            return [recharge_action];
        }

        // Drain is useless
        actions = actions.filter(a => a.name != "Drain");

        // No need to use magic missile since poison is great
        const can_poison = actions.find(a => a.name == 'Poison') !== undefined;
        if (can_poison && boss.hit_points > 8) {
            actions = actions.filter(a => a.name != "MagicMissile");
        }

        return actions;
    }
}

const INPUT_LINE_REGEX = /^(Hit Points|Damage): (\d+)/;

function parse_boss_input(input: string): [number, number] {
    
    let hit_points: number|null = null;
    let damage: number|null = null;

    for (let line of input.split("\n")) {
        line = line.trim();
        if (line.length > 0) {
            const m = line.match(INPUT_LINE_REGEX);
            if (!m) {
                throw Error(`Invalid line: ${line}`);
            }
            switch (m[1]) {
                case "Hit Points":
                    hit_points = parseInt(m[2]);
                    break;
                case "Damage":
                    damage = parseInt(m[2]);
                    break;
                default:
                    throw Error(`Invalid line: ${line}`);
            }
        }
    }

    if (hit_points === null) {
        throw Error("Missing hit points.");
    }

    if (damage === null) {
        throw Error("Missing damage.");
    }

    return [hit_points, damage];
}

async function part1(input: string): Promise<number> {
    const [boss_hp, boss_damage] = parse_boss_input(input);

    const wizard = BaseCharacter.create_wizard("Dumbeldore", 50, 500);
    const boss = BaseCharacter.create_boss("Cyclops", boss_hp, boss_damage);

    const game = new Game(wizard, boss);
    const wizard_opt = new WizardOptimizer(game);
    const game_info = wizard_opt.run();

    return game_info.total_wizard_mana_spent;
}

async function part2(input: string): Promise<number> {
    return -1;
}

function Problem22() {
    return (
        <Problem
            day = { 22 }
            part1 = { part1 }
            part2 = { part2 }
            inputs = {[
                "input_22.txt",
            ]}
            problem_link = "https://adventofcode.com/2015/day/22"
        />
    )
}

export default Problem22;