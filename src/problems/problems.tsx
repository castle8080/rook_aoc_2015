import { useParams, Link } from 'react-router-dom';
import { JSX } from 'react';

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

function Problems() {
    let { id } = useParams();
    let p_info = get_problem_info(id);
    
    return (
        <div className="problems-main">
            <div className="problems-navigation">
                <b>Problems</b>
                <ul>
                    { PROBLEM_INFO.map((p_info) => 
                        <li key={p_info.id}><Link to={ `/problem/${p_info.id}` }>{p_info.name}</Link></li>
                    )}
                </ul>
            </div>
            <div className="problems-content">
                <h2><a href="https://adventofcode.com/2015" target="_blank">Advent of Code 2015</a></h2>
                { create_problem_content(p_info) }
            </div>
        </div>
    );
}

export default Problems;