import _ from 'lodash';
import Problem from './problem';

function count_numbers(data: any, filter: (data: any) => boolean): number {
    if (filter(data)) {
        return 0;
    }
    else if (_.isNumber(data)) {
        return data as number;
    }
    else if (_.isString(data)) {
        return 0;
    }
    else if (_.isArray(data)) {
        return _.reduce(data as any[], (a, b) => a + count_numbers(b, filter), 0);
    }
    else if (_.isObject(data)) {
        return _.reduce(Object.values(data), (a, b) => a + count_numbers(b, filter), 0);
    }
    else {
        return 0;
    }
}

function red_filter(data: any): boolean {
    if (_.isArray(data) || !_.isObject(data)) {
        return false;
    }
    return _.find(Object.values(data), (v) => v == "red");
}

async function part1(input: string): Promise<number> {
    const accounting_data = JSON.parse(input);
    const result = count_numbers(accounting_data, (_) => false);

    return result;
}

async function part2(input: string): Promise<number> {
    const accounting_data = JSON.parse(input);
    const result = count_numbers(accounting_data, red_filter);

    return result;
}

function Problem12() {
    return (
        <Problem
            day = { 12 }
            part1 = { part1 }
            part2 = { part2 }
            inputs = {[
                "input_12.txt",
            ]}
            problem_link = "https://adventofcode.com/2015/day/12"
        />
    )
}

export default Problem12;