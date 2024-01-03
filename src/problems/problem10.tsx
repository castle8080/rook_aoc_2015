import _ from 'lodash';
import Problem from './problem';

interface SequenceHandler {
    on_item(n: number): void;
    on_end(): void;
}

class SequenceCollector implements SequenceHandler {
    output: number[];

    constructor() {
        this.output = [];
    }

    on_item(n: number) {
        this.output.push(n);
    }

    on_end() {
    }

    content(): string {
        let result = "";
        for (const n of this.output) {
            result += n;
        }
        return result;
    }
}

class SequenceCounter implements SequenceHandler {
    public count: number;

    constructor() {
        this.count = 0;
    }

    on_item(n: number) {
        this.count++;
    }

    on_end() {
        // nothing to do.
    }
}

class SequenceEncoder implements SequenceHandler {
    last_n: number|null;
    last_n_count: number;
    next: SequenceHandler;

    constructor(next: SequenceHandler) {
        this.last_n = null;
        this.last_n_count = 0;
        this.next = next;
    }

    static wrap_iterations(handler: SequenceHandler, iterations: number): SequenceHandler {
        let current = handler;
        for (let i = 0; i < iterations; i++) {
            current = new SequenceEncoder(current);
        }
        return current;
    }

    on_item(n: number) {
        if (this.last_n == null) {
            this.last_n = n;
            this.last_n_count = 1;
        }
        else if (n != this.last_n) {
            this.next.on_item(this.last_n_count);
            this.next.on_item(this.last_n);
            this.last_n = n;
            this.last_n_count = 1;
        }
        else {
            this.last_n_count++;
        }
    }

    on_end() {
        if (this.last_n != null) {
            this.next.on_item(this.last_n_count);
            this.next.on_item(this.last_n);
            this.next.on_end();
        }
    }
}

function feed_input_sequence(handler: SequenceHandler, input: string) {
    for (let i = 0; i < input.length; i++) {
        handler.on_item(parseInt(input[i]));
    }
    handler.on_end();
}

function encode_sequences(input: string, iterations: number): string {
    const collector = new SequenceCollector();
    const processor = SequenceEncoder.wrap_iterations(collector, iterations);

    feed_input_sequence(processor, input);

    return collector.content();
}

function count_sequence_after_iterations(input: string, iterations: number): number {
    const counter = new SequenceCounter();
    const processor = SequenceEncoder.wrap_iterations(counter, iterations);

    feed_input_sequence(processor, input);

    return counter.count;
}

async function part1(input: string): Promise<number> {
    const content = input.trim();
    const s = encode_sequences(content, 40);
    const result = s.length;
    return result;
}

async function part2(input: string): Promise<number> {
    // I did look into the video about finding elements which can be
    // computed independently. The implementations I tried with that
    // were slower than this code though. The code for that was 
    // splitting recursively quite often and leading to lots of checks
    // if the next sequence was also composed of elements.
    const content = input.trim();
    const result = count_sequence_after_iterations(content, 50);
    return result;
}

function Problem10() {
    return (
        <Problem
            day = { 10 }
            part1 = { part1 }
            part2 = { part2 }
            inputs = {[
                "input_10.txt",
                "input_10_test.txt",
            ]}
            problem_link = "https://adventofcode.com/2015/day/10"
        />
    )
}

export default Problem10;