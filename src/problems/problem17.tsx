import Problem from './problem';

function parse_number_list(input: string): number[] {
    return input
        .split("\n")
        .filter((s) => s.length > 0)
        .map((s) => parseInt(s));
}

function find_fill_combinations(containers: number[], fill_amount: number): number[][] {

    // Recursive portion.
    function search_combinations(
        containers: number[],
        used: boolean[],
        pos: number,
        total_left: number,
        on_total: (used: boolean[]) => void)
    {
        if (total_left == 0) {
            on_total(used);
            return;
        }
    
        if (pos >= containers.length || containers[pos] > total_left) {
            return;
        }
    
        // Use the current position
        used[pos] = true;
        search_combinations(containers, used, pos + 1, total_left - containers[pos], on_total);
    
        // Check without using it
        used[pos] = false;
        search_combinations(containers, used, pos + 1, total_left, on_total);
    }

    const containers_sorted = [...containers];
    containers_sorted.sort((a, b) => a - b);

    let combinations: number[][] = [];

    search_combinations(
        containers_sorted,
        containers_sorted.map((_) => false),
        0,
        fill_amount,
        (used: boolean[]) => {
            let combo = [];
            for (let i = 0; i < used.length; i++) {
                if (used[i]) {
                    combo.push(containers_sorted[i]);
                }
            }
            combinations.push(combo);
        }
    );

    return combinations;
}



async function part1(input: string): Promise<number> {
    const numbers = parse_number_list(input);
    const fill_combinations = find_fill_combinations(numbers, 150);
    return fill_combinations.length;
}

async function part2(input: string): Promise<number> {
    return -1;
}

function Problem17() {
    return (
        <Problem
            day = { 17}
            part1 = { part1 }
            part2 = { part2 }
            inputs = {[
                "input_17.txt",
                "input_17_test.txt",
            ]}
            problem_link = "https://adventofcode.com/2015/day/17"
        />
    )
}

export default Problem17;