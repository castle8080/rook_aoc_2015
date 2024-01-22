import ReactDOM from 'react-dom/client'

import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom"

import './index.css'

import Problems from './problems/problems.tsx';
import ProblemResultsView from './components/problem_results_view.tsx';

const router = createBrowserRouter([
    { path: "/", element: <Problems/>, },
    { path: "/problem/:id", element: <Problems/> },
    { path: "/results", element: <ProblemResultsView/> },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router} />
);