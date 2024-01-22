import { ProblemResults, ProblemResultInfo } from "../services/problem_results";
import MainHeader from "./main_header";

function render_result_info(result_info: ProblemResultInfo) {
    return <tr key={`problem_${result_info.day}_${result_info.part}`}>
        <td style={{ textAlign: 'center' }}>{ result_info.day }</td>
        <td style={{ textAlign: 'center' }}>{ result_info.part }</td>
        <td style={{ textAlign: 'right' }}>{ result_info.result }</td>
        <td style={{ textAlign: 'right' }}>{ result_info.execution_time }</td>
        <td style={{ textAlign: 'center' }}>{ result_info.execution_date }</td>
    </tr>
}

function ProblemResultsView() {
    var results = ProblemResults.get();

    function download_results() {
        const blob = new Blob([ProblemResults.generate_csv(results)], {type: "text/csv"});
        const url = URL.createObjectURL(blob);

        const a = document.getElementById('problem-results-download-trigger');
        if (a == null) {
            throw Error("Unable to find trigger element.");
        }
        a.setAttribute('href', url);
        a.setAttribute('download', 'problem-results.csv');
        a.click();
    }

    return (<>
        <MainHeader/>
        <div className="problem-results-div">
            <div className="problem-result-download-div">
                <a href='#' onClick={download_results}>Download</a>
                <a href='#' id="problem-results-download-trigger" style={{display: "none"}}>(hidden)</a>
            </div>
            <table>
                <tbody>
                    <tr>
                        <th style={{ textAlign: 'center' }}>Day</th>
                        <th style={{ textAlign: 'center' }}>Part</th>
                        <th style={{ textAlign: 'right' }}>Result</th>
                        <th style={{ textAlign: 'right' }}>Execution Time</th>
                        <th style={{ textAlign: 'center' }}>Date</th>
                    </tr>
                    { results.map(render_result_info) }
                </tbody>
            </table>
        </div>
    </>);
}

export default ProblemResultsView;