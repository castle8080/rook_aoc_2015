import { useState, useEffect } from 'react'

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
  fn: (input_name: string) => Promise<T>,
  input_name: string,
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
    const r = await fn(input_name);
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

interface ProblemProps {
  name: string,
  input_name: string,
  fn: (input_name: string) => Promise<any>,
}

function Problem(props: ProblemProps) {
  const [result, set_result] = useState<Result|null>(null);

  useEffect(() => {
    run_problem(props.name, props.fn, props.input_name, set_result);
  }, []);

  return (
    <>
      <div>
        <p>
          <b>Problem:</b> {result?.name}
          <br/>
          <b>Result: </b><i>{result?.result}</i>
          <br/>
          <b>Error: </b><i>{result?.error}</i>
          <br/>
          <b>Execution Time: </b><i>{result?.execution_time} ms.</i>
          <br/>
        </p>
      </div>
    </>
  )
}

export default Problem
