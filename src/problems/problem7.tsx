import _ from 'lodash';
import Problem from './problem';

interface SignalNode {
    get_signal(circuit: Circuit): number;
}

class LiteralNode implements SignalNode {
    constructor(public readonly value: number) {
    }

    get_signal(_circuit: Circuit): number {
        return this.value;
    }
}

class WireNode implements SignalNode {
    constructor(public readonly wire: string) {
    }

    get_signal(circuit: Circuit): number {
        return circuit.get_signal(this.wire);
    } 
}

class AndNode implements SignalNode {
    constructor(
        public readonly left: SignalNode,
        public readonly right: SignalNode)
    {}

    get_signal(circuit: Circuit): number {
        return make_16bit(this.left.get_signal(circuit) & this.right.get_signal(circuit));
    }
}

class OrNode implements SignalNode {
    constructor(
        public readonly left: SignalNode,
        public readonly right: SignalNode)
    {}

    get_signal(circuit: Circuit): number {
        return make_16bit(this.left.get_signal(circuit) | this.right.get_signal(circuit));
    }
}

class LShiftNode implements SignalNode {
    constructor(
        public readonly left: SignalNode,
        public readonly right: SignalNode)
    {}

    get_signal(circuit: Circuit): number {
        return make_16bit(this.left.get_signal(circuit) << this.right.get_signal(circuit));
    }
}

class RShiftNode implements SignalNode {
    constructor(
        public readonly left: SignalNode,
        public readonly right: SignalNode)
    {}

    get_signal(circuit: Circuit): number {
        return make_16bit(this.left.get_signal(circuit) >> this.right.get_signal(circuit));
    }
}

class NotNode implements SignalNode {
    constructor(
        public readonly operand: SignalNode)
    {}

    get_signal(circuit: Circuit): number {
        return make_16bit(~this.operand.get_signal(circuit));
    }
}

function make_16bit(n: number): number {
    return n & 0xffff;
}

const WIRE_BINARY_OP_REGEX = /^\s*([\da-z]+)\s+(AND|OR|LSHIFT|RSHIFT)\s+([\da-z]+)\s+->\s+([a-z]+)$/;
const WIRE_SINGLE_REGEX = /^\s*([\da-z]+)\s+->\s+([a-z]+)\s*$/;
const WIRE_NOT_REGEX = /^\s*NOT\s+([\da-z]+)\s*->\s*([a-z]+)\s*$/;

function literal_or_wire_node(content: string): SignalNode {
    if (content[0] >= 'a' && content[0] <= 'z') {
        return new WireNode(content);
    }
    else {
        return new LiteralNode(parseInt(content));
    }
}

function wire_parse_single(m: RegExpMatchArray): Wire {
    const name = m[2];
    const node = literal_or_wire_node(m[1]);

    return new Wire(name, node);
}

function wire_parse_binary_op(m: RegExpMatchArray): Wire {
    const name = m[4];
    const left = literal_or_wire_node(m[1]);
    const right = literal_or_wire_node(m[3]);
    const op = m[2];

    switch (op) {
        case "AND": return new Wire(name, new AndNode(left, right));
        case "OR": return new Wire(name, new OrNode(left, right));
        case "LSHIFT": return new Wire(name, new LShiftNode(left, right));
        case "RSHIFT": return new Wire(name, new RShiftNode(left, right));
        default: throw Error(`Invalid operator: ${op}`);
    }
}

function wire_parse_not(m: RegExpMatchArray): Wire {
    const name = m[2];
    const wire = literal_or_wire_node(m[1]);

    return new Wire(name, new NotNode(wire));
}

const WIRE_PARSERS: [RegExp, (m: RegExpMatchArray) => Wire][] = [
    [WIRE_SINGLE_REGEX, wire_parse_single],
    [WIRE_BINARY_OP_REGEX, wire_parse_binary_op],
    [WIRE_NOT_REGEX, wire_parse_not],
];

class Wire {
    constructor(
        public readonly name: string,
        public readonly signal_node: SignalNode)
    {}

    get_signal(circuit: Circuit): number {
        return this.signal_node.get_signal(circuit);
    }

    static parse(line: string): Wire {
        for (const [wire_regex, regex_handler] of WIRE_PARSERS) {
            const m = line.match(wire_regex);
            if (m) {
                return regex_handler(m);
            }
        }
        throw Error(`Could not detemine wire configuration for: ${line}`);
    }
}

class Circuit {
    private wires: Map<string, Wire>;
    private cached_signals: Map<string, number>;

    constructor() {
        this.wires = new Map();
        this.cached_signals = new Map();
    }

    clear_cached_signals() {
        this.cached_signals.clear();
    }

    add_wire(wire: Wire) {
        this.wires.set(wire.name, wire);
    }

    get_signal(wire_name: string): number {
        let signal = this.cached_signals.get(wire_name);
        if (signal !== undefined) {
            return signal;
        }

        const wire = this.wires.get(wire_name);
        if (!wire) {
            throw Error(`Wire (${wire_name}) does not exist.`);
        }

        signal = wire.get_signal(this);
        this.cached_signals.set(wire_name, signal);

        return signal;
    }

    static parse(input: string): Circuit {
        const circuit = new Circuit();
        for (let line of input.split("\n")) {
            line = line.trim();
            if (line.length > 0) {
                circuit.add_wire(Wire.parse(line));
            }
        }
        return circuit;
    }
}

async function part1(input: string): Promise<number> {
    const circuit = Circuit.parse(input);
    const signal = circuit.get_signal('a');
    return signal;
}

async function part2(input: string): Promise<number> {
    const circuit = Circuit.parse(input);
    const signal = circuit.get_signal('a');

    circuit.clear_cached_signals();

    // Re-configure wire b.
    circuit.add_wire(new Wire("b", new LiteralNode(signal)));

    const new_signal = circuit.get_signal('a');

    return new_signal;
}

function Problem7() {
    return (
        <Problem
            day = { 7 }
            part1 = { part1 }
            part2 = { part2 }
            inputs = {[
                "input_07.txt",
                "input_07_test.txt",
            ]}
            problem_link = "https://adventofcode.com/2015/day/7"
        />
    )
}

export default Problem7;