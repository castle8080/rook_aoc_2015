import _ from 'lodash';
import Problem from './problem';

function is_normal_char(c: string): boolean {
    return c != '\\' && c != '"';
}

function get_hex_num(c: string): number {
    switch (c) {
        case '0': return 0;
        case '1': return 1;
        case '2': return 2;
        case '3': return 3;
        case '4': return 4;
        case '5': return 5;
        case '6': return 6;
        case '7': return 7;
        case '8': return 8;
        case '9': return 9;
        case 'a': return 10;
        case 'b': return 11;
        case 'c': return 12;
        case 'd': return 13;
        case 'e': return 14;
        case 'f': return 15;
        default:
            throw Error(`Invalid hex char: ${c}`);
    }
}

function parse_encoded_string(s: string): string {
    const max_len = s.length;
    let idx = 0;
    let parsed_string = "";

    const consume_double_quote = () => {
        if (s[idx] != '"') {
            throw Error(`Expected double quote at: ${idx}`);
        }
        idx++;
    };

    const consume_normal_chars = () => {
        let next_idx = idx;
        while (next_idx < max_len && is_normal_char(s[next_idx])) {
            next_idx++;
        }
        if (next_idx > idx) {
            parsed_string += s.substring(idx, next_idx);
            idx = next_idx;
        }
    };

    const consume_hex_char = () => {
        // Need 2 characters
        if (idx >= max_len - 1) {
            throw Error(`Invalid hex escape sequence at: ${idx}`);
        }

        const char_code = (get_hex_num(s[idx]) << 4) | get_hex_num(s[idx + 1]);
        parsed_string += String.fromCharCode(char_code);
        idx += 2;
        return
    };

    const consume_escape_sequence = () => {
        if (s[idx] != '\\') {
            throw Error(`Expected escape sequence at: ${idx}`);
        }

        idx++;
        if (idx >= max_len) {
            throw Error(`Expected characters after escape.`);
        }

        switch (s[idx]) {
            case '\\':
                parsed_string += '\\';
                idx++;
                return;
            case '"':
                parsed_string += '"';
                idx++;
                return;
            case 'x':
                idx++;
                consume_hex_char();
                return;
            default:
                throw Error(`Invalid escape sequence at: ${idx}`);
        }
    };

    const consume_all = () => {
        consume_double_quote();

        while (idx < max_len) {
            switch (s[idx]) {
                case '"':
                    consume_double_quote();
                    if (idx < max_len) {
                        throw Error(`Extra characters still remaining after ${idx}`);
                    }
                    return;
                case '\\':
                    consume_escape_sequence();
                    break;
                default:
                    consume_normal_chars();
                    break;
            }
        }

        throw Error(`Unexpected end of input.`);
    };

    consume_all();

    return parsed_string;
}

function encode_string(input: string): string {
    const inner = input.replace(/[\\"]/g, (s) => {
        switch (s) {
            case '\\': return '\\\\';
            case '"': return '\\"';
            default: throw Error(`Invalid special character sequence: ${s}`);
        }
    });
    return `"${inner}"`;
}

function get_raw_lines(input: string): string[] {
    return input.split("\n").filter((s) => s.length > 0);
}

async function part1(input: string): Promise<number> {
    const raw_lines = get_raw_lines(input);
    const parsed_lines = raw_lines.map(parse_encoded_string);

    const raw_count = _.chain(raw_lines).map((s) => s.length).sum().value();
    const parsed_count = _.chain(parsed_lines).map((s) => s.length).sum().value();

    return raw_count - parsed_count;
}

async function part2(input: string): Promise<number> {
    const raw_lines = get_raw_lines(input);
    const encoded_lines = raw_lines.map(encode_string);

    const raw_count = _.chain(raw_lines).map((s) => s.length).sum().value();
    const encoded_count = _.chain(encoded_lines).map((s) => s.length).sum().value();

    return encoded_count - raw_count;
}

function Problem8() {
    return (
        <Problem
            day = { 8 }
            part1 = { part1 }
            part2 = { part2 }
            inputs = {[
                "input_08.txt",
                "input_08_test.txt",
            ]}
            problem_link = "https://adventofcode.com/2015/day/8"
        />
    )
}

export default Problem8;