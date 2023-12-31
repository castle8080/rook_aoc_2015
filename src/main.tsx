import ReactDOM from 'react-dom/client'

import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom"

import './index.css'

import App from './App.tsx'
import Problem1 from './problems/problem1.tsx'
import Problem2 from './problems/problem2.tsx'
import Problem3 from './problems/problem3.tsx'

const router = createBrowserRouter([
    { path: "/", element: <App/>, },
    { path: "/problem1", element: <Problem1/>, },
    { path: "/problem2", element: <Problem2/>, },
    { path: "/problem3", element: <Problem3/>, },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router} />
);