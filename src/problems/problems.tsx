import { useParams, Link } from 'react-router-dom';
import { JSX } from 'react';

import MainHeader from '../components/main_header';
import Problem1 from "./problem1";
import Problem2 from "./problem2";
import Problem3 from "./problem3";
import Problem4 from "./problem4";
import Problem5 from "./problem5";
import Problem6 from "./problem6";
import Problem7 from "./problem7";
import Problem8 from "./problem8";
import Problem9 from "./problem9";
import Problem10 from "./problem10";
import Problem11 from "./problem11";
import Problem12 from "./problem12";
import Problem13 from "./problem13";
import Problem14 from "./problem14";
import Problem15 from "./problem15";
import Problem16 from "./problem16";
import Problem17 from "./problem17";
import Problem18 from "./problem18";
import Problem19 from "./problem19";
import Problem20 from "./problem20";
import Problem21 from "./problem21";
import Problem22 from "./problem22";
import Problem23 from "./problem23";
import Problem24 from "./problem24";
import Problem25 from "./problem25";

const PROBLEMS = [
    Problem1,
    Problem2,
    Problem3,
    Problem4,
    Problem5,
    Problem6,
    Problem7,
    Problem8,
    Problem9,
    Problem10,
    Problem11,
    Problem12,
    Problem13,
    Problem14,
    Problem15,
    Problem16,
    Problem17,
    Problem18,
    Problem19,
    Problem20,
    Problem21,
    Problem22,
    Problem23,
    Problem24,
    Problem25,
];

interface ProblemInfo {
    name: string,
    id: string,
    component: () => JSX.Element,
}

function get_problem_id(name: string): string|null {
    const matches = name.match(/(\d+)/);
    if (matches && matches.length >= 1) {
        return matches[0];
    }
    return null;
}

function list_problems(): ProblemInfo[] {
    let problems: ProblemInfo[] = [];

    for (const p of PROBLEMS) {
        const name = p.name;
        const id = get_problem_id(name);
        if (id !== null) {
            problems.push({
                name: name,
                id: id,
                component: p,
            });
        }
    }

    return problems;
}

const PROBLEM_INFO = list_problems();

function get_problem_info(id: string|undefined|null): ProblemInfo|null {
    for (const p_info of PROBLEM_INFO) {
        if (p_info.id === id) {
            return p_info;
        }
    }
    return null;
}

function create_problem_content(p_info: ProblemInfo|null) {
    if (p_info === null) {
        return <div>No problem exists for this id.</div>;
    }

    const ProblemComponent = p_info.component;
    return <ProblemComponent/>;
}

function ProblemNavigation() {
    return (
        <div className="problems-navigation">
            <ul>
                { PROBLEM_INFO.map((p_info) => 
                    <li key={p_info.id}><Link to={ `/problem/${p_info.id}` }>{p_info.name}</Link></li>
                )}
            </ul>
        </div>
    );
}

function Problems() {
    let { id } = useParams();
    let p_info = get_problem_info(id);
    
    return (<>
        <MainHeader/>
        <div className="problems-main">
            <ProblemNavigation/>
            <div className="problems-content">
                { create_problem_content(p_info) }
            </div>
        </div>
    </>);
}

export default Problems;