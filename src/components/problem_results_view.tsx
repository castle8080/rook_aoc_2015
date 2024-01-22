import { ProblemResults, ProblemResultInfo } from "../services/problem_results";
import MainHeader from "./main_header";

function render_result_info(result_info: ProblemResultInfo) {
    return <tr>
        <td style={{ textAlign: 'center' }}>{ result_info.day }</td>
        <td style={{ textAlign: 'center' }}>{ result_info.part }</td>
        <td style={{ textAlign: 'right' }}>{ result_info.result }</td>
        <td style={{ textAlign: 'right' }}>{ result_info.execution_time }</td>
        <td style={{ textAlign: 'center' }}>{ result_info.execution_date }</td>
    </tr>
}

function ProblemResultsView() {
    var results = ProblemResults.get();

    return (<>
        <MainHeader/>
        <div className="problem-results-div">
            <table>
                <tr>
                    <th style={{ textAlign: 'center' }}>Day</th>
                    <th style={{ textAlign: 'center' }}>Part</th>
                    <th style={{ textAlign: 'right' }}>Result</th>
                    <th style={{ textAlign: 'right' }}>Execution Time</th>
                    <th style={{ textAlign: 'center' }}>Date</th>
                </tr>
                { results.map(render_result_info) }
            </table>
        </div>
    </>);
}

export default ProblemResultsView;