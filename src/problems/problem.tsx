import { useState, useEffect, FormEvent } from 'react'
import { ProblemResultInfo, ProblemResults } from '../services/problem_results';

interface Result {
    name: string,
    result: string|null,
    error: string|null,
    start_time: Date|null,
    end_time: Date|null,
    execution_time: number|null,
}

async function run_problem<T>(
    name: string,
    fn: (input: string) => Promise<T>,
    input: string,
    progress_callback: (result: Result) => void): Promise<Result>
{
    let result: Result = {
        name: name,
        result: null,
        error: null,
        start_time: new Date(),
        end_time: null,
        execution_time: null,
    };
    progress_callback({...result});

    try {
        const r = await fn(input);
        result.end_time = new Date();
        result.execution_time = result.end_time.getTime() - result.start_time!.getTime();
        result.result = String(r);
        progress_callback({...result});
        return result;
    }
    catch (e) {
        result.end_time = new Date();
        result.execution_time = result.end_time.getTime() - result.start_time!.getTime();
        result.error = String(e);
        progress_callback({...result});
        return result;
    }
}

async function run_problems(
    props: ProblemProps,
    input_name: string,
    part1_cb: (result: Result) => void,
    part2_cb: (result: Result) => void,
    processing_error_cb: (error: string|null) => void)
    : Promise<void>
{
    try {
        const input_path = `/input/${input_name}`;
        console.debug(`Fetching: ${input_path}`);
        const xhr_result = await fetch(input_path);
        if (!xhr_result.ok) {
            throw Error(`Unable to retrieve input: ${xhr_result.statusText}.`);
        }
        if (xhr_result.headers.get('content-type') == 'text/html') {
            // Vite dev server returns my some default html instead of 404!
            throw Error(`Unable to retrieve input: not found.`);
        }
        const input = await xhr_result.text();
        if (props.part1 !== null) {
            console.debug(`Running: day-${props.day} - part 1`);
            await run_problem(`Part 1`, props.part1!, input, part1_cb);
        }
        if (props.part2 !== null) {
            console.debug(`Running: day-${props.day} - part 2`);
            await run_problem(`Part 2`, props.part2!, input, part2_cb);
        }
    }
    catch (e) {
        processing_error_cb(String(e));
    }
}

interface ResultDisplayProps {
    result: Result|null
}

function ResultDisplay(props: ResultDisplayProps) {
    return ( <>
        <div className="result-display">
            <h3>{props.result?.name}</h3>
            { props.result?.start_time !== null && <>
                { props.result?.end_time !== null && <>
                    { props.result?.result !== null && <>
                        <b>Result: </b>{props.result?.result}
                        <br/>
                    </> }
                    { props.result?.error !== null && <>
                        <b>Error: </b>{props.result?.error}
                        <br/>
                    </> }
                    <b>Execution Time: </b>{props.result?.execution_time} ms.
                </> }
            </> }
            <br/>
        </div>
    </> )
}

interface ProblemProps {
    day: number,
    problem_link: string,
    inputs: Array<string>,
    part1: ((input: string) => Promise<any>)|null,
    part2: ((input: string) => Promise<any>)|null,
}

function Problem(props: ProblemProps) {
    const [result1, set_result1] = useState<Result|null>(null);
    const [result2, set_result2] = useState<Result|null>(null);
    const [processing_error, set_processing_error] = useState<string|null>(null);
    const [input_name, set_input] = useState<string>(props.inputs[0]);

    useEffect(() => {
        run_problems(
            props,
            input_name,
            set_result1,
            set_result2,
            set_processing_error,
        );
    }, [input_name]);

    function on_select_input(e: FormEvent<HTMLSelectElement>) {
        set_input(e.currentTarget.value);
    }

    function to_problem_result_info(result: Result|null, part: number): ProblemResultInfo {
        if (result == null) {
            throw Error("A null result cannot be saved.");
        }
        if (result.result == null) {
            throw Error("Can not save result without a valid result.");
        }
        
        return {
            day: props.day,
            part: part,
            result: result.result,
            execution_date: result.start_time!.toISOString(),
            execution_time: result.execution_time!,
        };
    }

    function on_accept_answers(e: React.MouseEvent<HTMLButtonElement>) {
        ProblemResults.add([
            to_problem_result_info(result1, 1),
            to_problem_result_info(result2, 2),
        ])
    }

    return (
        <div className="problem-display">
            <h2>Advent of Code <a href={props.problem_link} target="description_view_tab"> Day {props.day}</a></h2>
            { processing_error !== null && <>
                <div>
                    <p>
                        <b>Error Processing:</b> {processing_error}
                    </p>
                </div>
            </> }
            <div>
                <p>
                    <b>Input: </b>
                    <select defaultValue={ input_name } onChange={ on_select_input }>
                        { props.inputs.map((input) => 
                            <option key={ input }>{ input } </option>
                        )}
                    </select>
                    &nbsp;<a href={ "/input/" + input_name } target='input_view_tab'>View</a>
                </p>
            </div>
            { result1 != null && result1.result != null && result2 != null && result2.result != null &&
                <button onClick={on_accept_answers}>Accept Answers</button>
            }
            <ResultDisplay result = { result1 }/>
            <ResultDisplay result = { result2 }/>
        </div>
    );
}

export default Problem
