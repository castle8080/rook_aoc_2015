import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom"
import App from './App.tsx'
import './index.css'

import Problem1 from './problems/problem1.tsx'

const router = createBrowserRouter([
  { path: "/", element: <App/>, },
  { path: "/problem1", element: <Problem1/>, },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
