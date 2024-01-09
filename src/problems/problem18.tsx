import _ from 'lodash';
import Problem from './problem';

const NEIGHBOR_DELTAS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1],
];

class LightGrid {
    private grid: number[][];
    private grid_buffer: number[][];
    private light_override: (grid: LightGrid, y: number, x: number) => number|null;

    constructor(grid: number[][]) {
        this.grid = grid;

        // The buffer is intialized to a copy of the grid.
        this.grid_buffer = this.grid.map((row) => row.map((v) => v));

        // Default has no override
        this.light_override = (_grid, _y, _x) => null;
    }

    set_light_override(light_override: (grid: LightGrid, y: number, x: number) => number|null) {
        this.light_override = light_override;
    }

    set_status(y: number, x: number, status: number) {
        this.grid[y][x] = status;
    }

    height() {
        return this.grid.length;
    }

    width() {
        return this.grid[0].length;
    }

    on_count(): number {
        return _.sum(this.grid.map((row) => _.sum(row)));
    }

    advance(steps: number) {
        for (let i = 0; i < steps; i++) {
            this.next_frame();
        }
    }

    next_frame() {
        const width = this.width();
        const height = this.height();

        // Set the new values in the buffer.
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                this.grid_buffer[y][x] = this.next_status(y, x);
            }
        }

        // Swap the grid and buffer.
        const tmp = this.grid;
        this.grid = this.grid_buffer;
        this.grid_buffer = tmp;
    }

    next_status(y: number, x: number): number {
        // A light which is on stays on when 2 or 3 neighbors are on, and turns off otherwise.
        // A light which is off turns on if exactly 3 neighbors are on, and stays off otherwise.

        const override_value = this.light_override(this, y, x);
        if (override_value !== null) {
            return override_value;
        }

        const width = this.width();
        const height = this.height();
        const previous = this.grid[y][x];

        let neighbor_count = 0;
        for (const [dy, dx] of NEIGHBOR_DELTAS) {
            let ny = y + dy;
            let nx = x + dx;
            if (ny >= 0 && ny < height && nx >= 0 && nx < width && this.grid[ny][nx] == 1) {
                neighbor_count++;
            }
        }

        return (neighbor_count == 3 || (previous == 1 && neighbor_count == 2)) ? 1 : 0;
    }

    static parse(input: string): LightGrid {
        const grid: number[][] = [];

        for (let line of input.split('\n')) {
            if (line.length == 0) {
                continue;
            }

            const row: number[] = [];
            for (let i = 0; i < line.length; i++) {
                switch (line[i]) {
                    case "#":
                        row.push(1);
                        break;
                    case ".":
                        row.push(0);
                        break;
                    default:
                        throw Error(`Invalid line: ${line}`);
                }
            }

            grid.push(row);
        }

        return new LightGrid(grid);
    }
}

function turn_on_corners(grid: LightGrid) {
    grid.set_status(0, 0, 1);
    grid.set_status(0, grid.width() - 1, 1);
    grid.set_status(grid.height() - 1, 0, 1);
    grid.set_status(grid.height() - 1, grid.width() - 1, 1);
}

function corners_on_override(grid: LightGrid, y: number, x: number): number|null {
    const last_x = grid.width() - 1;
    const last_y = grid.height() - 1;

    if ((y == 0 && (x == 0 || x == last_x)) ||
        (y == last_y && (x == 0 || x == last_x)))
    {
        return 1;
    }

    return null;
}

async function part1(input: string): Promise<number> {
    const grid = LightGrid.parse(input);
    grid.advance(100);
    console.log(grid);
    return grid.on_count();
}

async function part2(input: string): Promise<number> {
    const grid = LightGrid.parse(input);
    
    turn_on_corners(grid);
    grid.set_light_override(corners_on_override);
    
    grid.advance(100);
    console.log(grid);
    return grid.on_count();
}

function Problem18() {
    return (
        <Problem
            day = { 18 }
            part1 = { part1 }
            part2 = { part2 }
            inputs = {[
                "input_18.txt",
            ]}
            problem_link = "https://adventofcode.com/2015/day/18"
        />
    )
}

export default Problem18;