import _ from 'lodash'
import Problem from '../problem'

async function parse_input(input_name: string): Promise<Array<number>> {
  const content = (await (await fetch(input_name)).text()).trim();
  return _.map(content, c => { switch (c) {
    case "(": return 1;
    case ")": return -1;
    default: {
      throw new Error(`Invalid input: ${c}`);
    }
  }});
}

async function part1(input_name: string): Promise<Number> {
  const instructions = await parse_input(input_name);
  const result = _.sum(instructions);
  return result;
}

async function part2(input_name: string): Promise<Number|undefined> {
  const instructions = await parse_input(input_name);

  // I wish js had something like scala's scan
  let floor = 0;
  for (let i = 0; i < instructions.length; i++) {
    floor += instructions[i];
    if (floor == -1) {
      return i + 1;
    }
  }

  throw Error("Never found the desired floor.");
}

function Problem1() {
  // I'd like to pass in both so that only 1 starts at a time.
  return (
    <>
      <Problem
        name = { "Day 1 - Part 1" }
        fn = { part1 }
        input_name = { "input/input_01.txt" }
      />
      <Problem
        name = { "Day 1 - Part 2" }
        fn = { part2 }
        input_name = { "input/input_01.txt" }
      />
    </>
  )
}

export default Problem1
