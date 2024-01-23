import _ from 'lodash';
import Problem from './problem';

type RegisterType = "a" | "b";

const INSTRUCTION_REGEX_REGISTER = /^\s*(hlf|tpl|inc)\s+([ab])\s*$/;
const INSTRUCTION_REGEX_JMP = /^\s*jmp\s+([\+\-])(\d+)\s*$/;
const INSTRUCTION_REGEX_REGISTER_OFFSET = /^\s*(jie|jio)\s+([ab]),\s+([\+\-])(\d+)\s*$/;

function regex_list_process<T>(input: string, list: Array<[RegExp, (m: RegExpMatchArray) => T]>): T {
    for (const [regex, handler] of list) {
        const m = input.match(regex);
        if (m) {
            return handler(m);
        }
    }
    throw Error(`No matching expression for input: ${input}`);
}

class Instructions {

    public static parse_all(input: string): Instruction[] {
        return _.chain(input.split("\n"))
            .map(l => l.trim())
            .filter(l => l.length > 0)
            .map(Instructions.parse)
            .value();
    }

    public static parse(line: string): Instruction {
        return regex_list_process<Instruction>(line, [
            [INSTRUCTION_REGEX_REGISTER, Instructions.parse_register],
            [INSTRUCTION_REGEX_JMP, Instructions.parse_jmp],
            [INSTRUCTION_REGEX_REGISTER_OFFSET, Instructions.parse_register_offset],
        ]);
    }

    private static parse_register(m: RegExpMatchArray): Instruction {
        const register: RegisterType = m[2] as RegisterType;
        switch (m[1]) {
            case "hlf": return new HLF(register);
            case "tpl": return new TPL(register);
            case "inc": return new INC(register);
            default:
                throw Error(`Invalid instruction: ${m[1]}`);
        }
    }

    private static parse_jmp(m: RegExpMatchArray): Instruction {
        return new JMP(Instructions.parse_number(m[1], m[2]));
    }

    private static parse_register_offset(m: RegExpMatchArray): Instruction {
        const register: RegisterType = m[2] as RegisterType;
        const offset = Instructions.parse_number(m[3], m[4]);
        switch (m[1]) {
            case "jie": return new JIE(register, offset);
            case "jio": return new JIO(register, offset);
            default:
                throw Error(`Invalid instruction: ${m[1]}`);
        }
    }

    private static parse_number(sign_part: string, n_part: string): number {
        const sign = (sign_part == '-') ? -1 : 1;
        return parseInt(n_part) * sign;
    }
}

interface Instruction {
    execute(p: Process): void;
}

/**
 * hlf r sets register r to half its current value, then continues with the next instruction.
 */
class HLF implements Instruction {
    constructor(public readonly register: RegisterType) {}

    execute(p: Process): void {
        p.registers[this.register] = Math.floor(p.registers[this.register] / 2);
        p.counter++;
    }
}

/**
 * tpl r sets register r to triple its current value, then continues with the next instruction.
 */
class TPL implements Instruction {
    constructor(public readonly register: RegisterType) {}

    execute(p: Process): void {
        p.registers[this.register] *= 3;
        p.counter++;
    }
}

/**
 * inc r increments register r, adding 1 to it, then continues with the next instruction.
 */
class INC implements Instruction {
    constructor(public readonly register: RegisterType) {}

    execute(p: Process): void {
        p.registers[this.register]++;
        p.counter++;
    }
}

/**
 * jmp offset is a jump; it continues with the instruction offset away relative to itself.
 */
class JMP implements Instruction {
    constructor(public readonly offset: number) {}

    execute(p: Process): void {
        p.counter += this.offset;
    }
}

/**
 * jie r, offset is like jmp, but only jumps if register r is even ("jump if even").
 */
class JIE implements Instruction {
    constructor(public readonly register: RegisterType, public readonly offset: number) {}

    execute(p: Process): void {
        if ((p.registers[this.register] % 2) == 0) {
            p.counter += this.offset;
        }
        else {
            p.counter++;
        }
    }
}

/**
 * jio r, offset is like jmp, but only jumps if register r is 1 ("jump if one", not odd).
 */
class JIO implements Instruction {
    constructor(public readonly register: RegisterType, public readonly offset: number) {}

    execute(p: Process): void {
        if (p.registers[this.register] == 1) {
            p.counter += this.offset;
        }
        else {
            p.counter++;
        }
    }
}

interface Registers {
    a: number;
    b: number;
}

class Process {
    public counter: number;
    public registers: Registers;

    constructor(public readonly instructions: Instruction[]) {
        this.counter = 0;
        this.registers = { a: 0, b: 0 };
    }

    run() {
        while (this.counter >= 0 && this.counter < this.instructions.length) {
            this.instructions[this.counter].execute(this);
        }
    }
}

async function part1(input: string): Promise<number> {
    const instructions = Instructions.parse_all(input);
    console.log(instructions);

    const process = new Process(instructions);
    process.run();
    console.log(process);

    return process.registers['b'];
}

async function part2(input: string): Promise<number> {
    const instructions = Instructions.parse_all(input);
    console.log(instructions);

    const process = new Process(instructions);
    process.registers.a = 1;
    process.run();
    console.log(process);

    return process.registers['b'];
}

function Problem23() {
    return (
        <Problem
            day = { 23 }
            part1 = { part1 }
            part2 = { part2 }
            inputs = {[
                "input_23.txt",
            ]}
            problem_link = "https://adventofcode.com/2015/day/23"
        />
    )
}

export default Problem23;