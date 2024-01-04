import _ from 'lodash';
import Problem from './problem';

const A_CODE = 'a'.charCodeAt(0);
const Z_CODE = 'z'.charCodeAt(0);

function password_to_array(password: string): number[] {
    let arr = [];
    for (let i = password.length-1; i >= 0; i--) {
        arr.push(password.charCodeAt(i));
    }
    return arr;
}

function password_from_array(password_arr: number[]): string {
    let s = "";
    for (let i = password_arr.length - 1; i >= 0; i--) {
        s += String.fromCharCode(password_arr[i]);
    }
    return s;
}

function password_basic_char_filter(chars: string[]): (n: number) => boolean {
    const nums = chars.map((c) => c.charCodeAt(0));
    return (n: number) => nums.indexOf(n) >= 0;
}

function has_2_non_overlapping_repeats(password_arr: number[]): boolean {
    let double_count = 0;
    for (let i = 0; i < password_arr.length - 1; i++) {
        if (password_arr[i] == password_arr[i + 1]) {
            double_count++;
            if (double_count == 2) {
                return true;
            }
            // Advance 1 more
            i++;
        }
    }

    return false;
}

function password_3char_increasing_sequence(password_arr: number[]): boolean {
    for (let i = 0; i < password_arr.length - 2; i++) {
        if ((password_arr[i] - 1) == password_arr[i + 1] &&
            (password_arr[i + 1] - 1) == password_arr[i + 2])
        {
            return true;
        }
    }

    return false;
}

function password_next_char(c: number, basic_filter: (n: number) => boolean): [number, boolean] {
    let roll = false;
    while (true) {
        c++;
        if (c > Z_CODE) {
            if (roll) {
                throw Error(`It appears all possible characters are filtered out.`);
            }
            c = A_CODE;
            roll = true;
        }
        if (!basic_filter(c)) {
            return [c, roll];
        }
    }
}

function password_increment(password_arr: number[], basic_filter: (n: number) => boolean) {
    let pos = 0;
    while (true) {
        if (pos == password_arr.length) {
            password_arr.push(A_CODE - 1);
        }
        const [n, roll] = password_next_char(password_arr[pos], basic_filter);
        password_arr[pos] = n;
        pos++;
        if (!roll) {
            return;
        }
    }
}

function next_password(
    password: string,
    basic_filter: (n: number) => boolean,
    validation_rule: (password_arr: number[]) => boolean)
{
    let password_arr = password_to_array(password);

    while (true) {
        password_increment(password_arr, basic_filter);
        if (validation_rule(password_arr)) {
            return password_from_array(password_arr);
        }
    }
}

function next_password_default_rules(password: string): string {
    return next_password(
        password,
        password_basic_char_filter(["i", "o", "l"]),
        (password_arr) =>
            has_2_non_overlapping_repeats(password_arr) &&
            password_3char_increasing_sequence(password_arr)
    );
}

async function part1(input: string): Promise<string> {
    const password = input.trim();
    const next_password = next_password_default_rules(password);

    return next_password;
}

async function part2(input: string): Promise<string> {
    const password = input.trim();
    const next_password = next_password_default_rules(password);
    const next_next_password = next_password_default_rules(next_password);

    return next_next_password;
}

function Problem11() {
    return (
        <Problem
            day = { 11 }
            part1 = { part1 }
            part2 = { part2 }
            inputs = {[
                "input_11.txt",
            ]}
            problem_link = "https://adventofcode.com/2015/day/11"
        />
    )
}

export default Problem11;