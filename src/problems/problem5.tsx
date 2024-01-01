import _ from 'lodash';
import Problem from './problem';

function parse_strings(input: string): string[] {
    return input.split("\n").filter((s) => s.length > 0);
}

function is_nice(s: string): boolean {
    /*
      A nice string is one with all of the following properties:
        It contains at least three vowels (aeiou only), like aei, xazegov, or aeiouaeiouaeiou.
        It contains at least one letter that appears twice in a row, like xx, abcdde (dd), or aabbccdd (aa, bb, cc, or dd).
        It does not contain the strings ab, cd, pq, or xy, even if they are part of one of the other requirements.
    */

    function is_vowel(c: string) {
        return c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u';
    }

    let v_count = 0;
    let has_twice = false;
    
    if (s.length == 0) {
        return false;
    }

    let prev_c = s[0];

    if (is_vowel(s[0])) {
        v_count++;
    }

    for (let i=1, len=s.length; i<len; i++) {
        const c = s[i];
        if ((c == "b" && prev_c == "a") ||
            (c == "d" && prev_c == "c") ||
            (c == "q" && prev_c == "p") ||
            (c == "y" && prev_c == "x"))
        {
            return false;
        }
        if (is_vowel(c)) {
            v_count++;
        }
        if (c == prev_c) {
            has_twice = true;
        }
        prev_c = c;
    }
    
    return v_count >= 3 && has_twice;
}

function has_repeat_one_after(s: string): boolean {
    for (let i=0, len=s.length-2; i<len; i++) {
        if (s[i] == s[i+2]) {
            return true;
        }
    }
    return false;
}

function has_pair_repeat(s: string): boolean {
    let double_map: Map<string, number> = new Map();

    for (let i=0, len=s.length-1; i<len; i++) {
        const ss = s.substring(i, i+2);
        const prev_start = double_map.get(ss);

        if (prev_start !== undefined) {
            if (i > prev_start + 1) {
                // not right after
                return true;
            }
        }
        else {
            double_map.set(ss, i);
        }
    }

    return false;
}

function is_nice2(s: string): boolean {
    return has_repeat_one_after(s) && has_pair_repeat(s);
}

async function part1(input: string): Promise<number> {
    const strings = parse_strings(input);
    const nice_strings = strings.filter(is_nice);
    return nice_strings.length;
}

async function part2(input: string): Promise<number> {
    const strings = parse_strings(input);
    const nice_strings = strings.filter(is_nice2);
    return nice_strings.length;
}

function Problem5() {
    return (
        <Problem
            day = { 5 }
            part1 = { part1 }
            part2 = { part2 }
            inputs = {[
                "input_05.txt",
                "input_05_test.txt",
            ]}
            problem_link = "https://adventofcode.com/2015/day/5"
        />
    )
}

export default Problem5;