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

