import { useState } from 'react'
import _ from 'lodash'

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

  return undefined;
}

function Problem1() {
  const [result_part_1, set_result_part_1] = useState("");
  const [result_part_2, set_result_part_2] = useState("");

  part1("input/input_01.txt").then(r => set_result_part_1(String(r)));
  part2("input/input_01.txt").then(r => set_result_part_2(String(r)));

  return (
    <>
      <div>
        <p>
          <b>Part 1 Result: </b><i>{result_part_1}</i>
        </p>
        <p>
          <b>Part 2 Result: </b><i>{result_part_2}</i>
        </p>
      </div>
    </>
  )
}

export default Problem1
