import './index.css'

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import loginAction from './components/login/loginAction';
import ReactDOM from 'react-dom/client';
import Layout from "./components/layout/Layout";
import NotFound from "./components/NotFound";
import Login from './components/login/Login';
import React from 'react';
import routeAuthLoader from './utils/routeAuthLoader';
import Home from './components/home/Home';
import logoutAction from './components/login/logoutAction';
import CategoriasIndex from './components/Categorias/CategoriasIndex';
import TiposDocumentoIndex from './components/TiposDocumento/TiposDocumentoIndex';
import categoriaSubmitAction from './components/Categorias/categoriaSubmitAction';
import { tipoDocumentoSubmitAction } from './components/TiposDocumento/tipoDocumentoSubmitAction';

const router = createBrowserRouter([
	{ path: "/", element: <Layout />, errorElement: <NotFound />, id: "root", loader: routeAuthLoader, children: [
		{ index: true, element: <Home /> }, 
		{ path: "/logout", action: logoutAction },
		{ path: "/catalogos/categorias/:id?", action: categoriaSubmitAction, element: <CategoriasIndex /> },
		{ path: "/catalogos/tipos-de-documento/:id?", action: tipoDocumentoSubmitAction, element: <TiposDocumentoIndex />},
	]}, 
	{ path: "/login", element: <Layout />, children: [
		{ index: true, action: loginAction, element: <Login /> }
	]}
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
)