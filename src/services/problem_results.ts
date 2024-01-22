import CSVBuilder from "../csv_builder";

const LOCAL_STORAGE_KEY = "AOC_2015_results";

export interface ProblemResultInfo {
    day: number;
    part: number;
    result: string;
    execution_time: number;
    execution_date: string;
}

export class ProblemResults {

    public static add(results: ProblemResultInfo[]) {
        var current_info = ProblemResults.get();
        for (const r of results) {
            ProblemResults.add_result(current_info, r);
        }
        current_info.sort(ProblemResults.compare_problem_result_info);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current_info));
    }

    public static get(): ProblemResultInfo[] {
        let result_str = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (result_str == null) {
            return [];
        }
        else {
            return JSON.parse(result_str);
        }
    }

    public static get_csv(): string {
        const results = ProblemResults.get();
        return ProblemResults.generate_csv(results);
    }

    public static generate_csv(results: ProblemResultInfo[]): string {
        var csv_builder = new CSVBuilder();

        csv_builder.add_row([
            'Day',
            'Part',
            'Result',
            'ExecutionTime',
            'Date',
        ]);

        for (const result of results) {
            csv_builder.add_row([
                result.day,
                result.part,
                result.result,
                result.execution_time,
                result.execution_date,
            ]);
        }

        return csv_builder.get_content();
    }

    private static compare_problem_result_info(pi1: ProblemResultInfo, pi2: ProblemResultInfo) {
        if (pi1.day < pi2.day) {
            return -1;
        }
        else if (pi2.day < pi1.day) {
            return 1;
        }
        else if (pi1.part < pi2.part) {
            return -1;
        }
        else if (pi1.part > pi2.part) {
            return 1;
        }
        else {
            return 0;
        }
    }

    private static add_result(current_info: ProblemResultInfo[], new_result: ProblemResultInfo) {
        for (let i = 0; i < current_info.length; i++) {
            if (ProblemResults.compare_problem_result_info(current_info[i], new_result) == 0) {
                current_info[i] = new_result;
                return;
            }
        }
        current_info.push(new_result);
    }
}

