import ReactDOM from 'react-dom/client'

import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom"

import './index.css'

import Problems from './problems/problems.tsx';

const router = createBrowserRouter([
    { path: "/", element: <Problems/>, },
    { path: "/problem/:id", element: <Problems/> },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router} />
);