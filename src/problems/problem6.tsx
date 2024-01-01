import _ from 'lodash';
import Problem from './problem';

// turn on 0,0 through 999,999
// toggle 0,0 through 999,0
// turn off 499,499 through 500,500

const COMMAND_REGEX = /(turn on|toggle|turn off) (\d+),(\d+) through (\d+),(\d+)/;

enum CommandType {
    TurnOn,
    TurnOff,
    Toggle,
}

interface Position {
    x: number,
    y: number,
}

interface Command {
    type: CommandType,
    start: Position,
    end: Position,
}

function exec_turn_on(_n: number) {
    return 1;
}

function exec_turn_off(_n: number) {
    return 0;
}

function exec_toggle(n: number) {
    return (n === 0) ? 1 : 0;
}

function get_command_type_exec(command_type: CommandType): (n: number) => number {
    switch (command_type) {
        case CommandType.Toggle: return exec_toggle;
        case CommandType.TurnOn: return exec_turn_on;
        case CommandType.TurnOff: return exec_turn_off;
        default: throw Error(`Unknown command type: ${command_type}`);
    }
}

function exec_increase(n: number) {
    return n + 1;
}

function exec_decrease(n: number) {
    return (n > 0) ? n - 1 : 0;
}

function exec_toggle2(n: number) {
    return n + 2;
}

function get_command_type_exec_part2(command_type: CommandType): (n: number) => number {
    switch (command_type) {
        case CommandType.TurnOn: return exec_increase;
        case CommandType.TurnOff: return exec_decrease;
        case CommandType.Toggle: return exec_toggle2;
        default: throw Error(`Unknown command type: ${command_type}`);
    }
}

class LightMap {
    lights: number[][];

    constructor(size: number) {
        // Initialize the 2-d grid of lights
        this.lights = [];
        for (let y = 0; y < size; y++) {
            const row = [];
            for (let x = 0; x < size; x++) {
                row.push(0);
            }
            this.lights.push(row);
        }
    }

    apply_command(command: Command, exec_factory: (command_type: CommandType) => (n: number) => number) {
        const exec_cmd = exec_factory(command.type);
        for (let y = command.start.y, y_end = command.end.y; y <= y_end; y++) {
            const row = this.lights[y];
            for (let x = command.start.x, x_end = command.end.x; x <= x_end; x++) {
                row[x] = exec_cmd(row[x]);
            }
        }
    }

    count_on(): number {
        let count_on = 0;
        for (let row of this.lights) {
            for (let n of row) {
                count_on += n;
            }
        }
        return count_on;
    }
}

function get_command_type(s: string): CommandType {
    switch (s) {
        case "turn on": return CommandType.TurnOn;
        case "turn off": return CommandType.TurnOff;
        case "toggle": return CommandType.Toggle;
        default: throw Error("Invalid command type: " + s);
    }
}

function parse_command(s: string): Command {
    const m = s.match(COMMAND_REGEX);
    if (!m) {
        throw Error("Invalid command string: " + s);
    }

    return {
        type: get_command_type(m[1]),
        start: { x: parseInt(m[2]), y: parseInt(m[3]) },
        end: { x: parseInt(m[4]), y: parseInt(m[5]) },
    };
}

function parse_commands(input: string): Command[] {
    return input
        .split("\n")
        .filter((s) => s.length > 0)
        .map(parse_command);
}

function run_part(input: string, exec_factory: (command_type: CommandType) => (n: number) => number): number {
    const light_map = new LightMap(1000);
    const commands = parse_commands(input);

    for (let cmd of commands) {
        light_map.apply_command(cmd, exec_factory);
    }
    
    return light_map.count_on();
}

async function part1(input: string): Promise<number> {
    return run_part(input, get_command_type_exec);
}

async function part2(input: string): Promise<number> {
    // There should be a way to do this where you operate on entire regions
    // instead of each cell, which should make execution time much faster.
    return run_part(input, get_command_type_exec_part2);
}

function Problem6() {
    return (
        <Problem
            day = { 6 }
            part1 = { part1 }
            part2 = { part2 }
            inputs = {[
                "input_06.txt",
                "input_06_test.txt",
            ]}
            problem_link = "https://adventofcode.com/2015/day/6"
        />
    )
}

export default Problem6;