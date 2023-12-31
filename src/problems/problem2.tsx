import _ from 'lodash'
import Problem from '../problem'

interface Box {
    length: number,
    width: number,
    height: number,
}

function parse_box_dimensions(input: string): Array<Box> {
    let box_dimensions: Array<Box> = [];

    input.split("\n").forEach((line) => {
        line = line.trim();
        if (line != "") {
            const dimensions = line.split("x").map((p) => parseInt(p));
            if (dimensions.length != 3) {
                throw new Error("Invalid number of dimensions: " + line);
            }
            box_dimensions.push({
                length: dimensions[0],
                width: dimensions[1],
                height: dimensions[2],
            });
        }
    });

    return box_dimensions;
}

function calculate_required_square_feet(box: Box): number {
    const s1 = box.length * box.width;
    const s2 = box.length * box.height;
    const s3 = box.width * box.height;

    return Math.min(s1, s2, s3) + 2 * (s1 + s2 + s3);
}

function calculate_required_ribbon(box: Box): number {
    const values = [box.length, box.width, box.height];
    values.sort((a, b) => a - b);
    return 2 * (values[0] + values[1]) + box.length * box.width * box.height;
}

async function part1(input: string): Promise<number> {
    const box_dimensions = parse_box_dimensions(input);
    return _.sum(box_dimensions.map(calculate_required_square_feet));
}

async function part2(input: string): Promise<number> {
    const box_dimensions = parse_box_dimensions(input);
    return _.sum(box_dimensions.map(calculate_required_ribbon));
}

function Problem2() {
    return (
        <Problem
            day = { 2 }
            part1 = { part1 }
            part2 = { part2 }
            inputs = {[ "input/input_02.txt", "input/input_02_test.txt" ]}
            problem_link = "https://adventofcode.com/2015/day/2"
        />
    )
}

export default Problem2