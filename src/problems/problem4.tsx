import _ from 'lodash';
import Problem from '../problem';
import SparkMD5 from 'spark-md5';

function count_leading_zeros(s: string): number {
    for (let i = 0, len = s.length; i < len; i++) {
        if (s[i] != '0') {
            return i;
        }
    }
    return 0;
}

function find_md5_leading_zeros(input: string, needed_lz: number, starting_num: number) {
    let n = starting_num;
    let last_leading = 0;
    let first_leading = [];

    while (true) {
        const md5_str = SparkMD5.hash(input + n);
        const lz = count_leading_zeros(md5_str);
        if (lz > last_leading) {
            first_leading.push({ leading_zeros: lz, n: n });
            last_leading = lz;
            if (lz == needed_lz) {
                return first_leading;
            }
        }
        n += 1;
    }
}

async function part1(input: string): Promise<number> {
    input = input.trim();
    const result = find_md5_leading_zeros(input, 5, 0);
    console.log(result);
    return result[result.length - 1].n;
}

async function part2(input: string): Promise<number> {
    // Is there a way around brute forcing this?
    input = input.trim();
    const result = find_md5_leading_zeros(input, 6, 0);
    console.log(result);
    return result[result.length - 1].n;
}

function Problem4() {
    return (
        <Problem
            day = { 4 }
            part1 = { part1 }
            part2 = { part2 }
            inputs = {[ "input_04.txt", "input_04_test.txt" ]}
            problem_link = "https://adventofcode.com/2015/day/4"
        />
    )
}

export default Problem4;