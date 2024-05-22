import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.scss'
import {KindeProvider} from "@kinde-oss/kinde-auth-react";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import ProfilePage from "./pages/ProfilePage/ProfilePage.tsx";
import CompsPage from "./pages/CompsPages/CompsPage.tsx";
import CompDetails from "./pages/CompsPages/CompDetails.tsx";
import TreatmentsPage from "./pages/TreatmentsPages/TreatmentsPage.tsx";
import TreatmentDetails from "./pages/TreatmentsPages/TreatmentDetails.tsx";
import EmployeesPage from "./pages/EmployeesPages/EmployeesPage.tsx";
import EmployeeDetails from "./pages/EmployeesPages/EmployeeDetails.tsx";
import {KINDE_CLIENT_ID, KINDE_DOMAIN, KINDE_LOGOUT_URI, KINDE_REDIRECT_URI} from "./Utils/env.ts";
import ChooseCompTreatmentTime from "./pages/CompsPages/ChooseCompTreatmentTime.tsx";
import ReportsPage from "./pages/CompsPages/ReportsPage.tsx";
import ChooseCompReports from "./pages/CompsPages/ChooseCompReports.tsx";
import EditReport from "./pages/CompsPages/EditReport.tsx";
import GalleryPage from "./pages/Gallery/GalleryPage.tsx";
import HomePage from "./pages/HomePage/HomePage.tsx";
import {register} from "swiper/element";
register();

const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage/>
    },
    {
        path: '/profile',
        element: <ProfilePage/>
    },
    {
        path: '/comps',
        children: [
            {
                path: '',
                element: <CompsPage/>
            },
            {
                path: ':id',
                element: <CompDetails/>
            },
            {
                path: ':compId/choose-time/:treatmentId',
                element: <ChooseCompTreatmentTime/>
            },
            {
                path: 'reports',
                element: <ChooseCompReports/>
            },
            {
                path: ':compId/reports',
                element: <ReportsPage/>
            },
            {
                path: ':compId/reports/:reportId',
                element: <EditReport/>
            }
        ]
    },
    {
      path: '/treatments',
      children: [
          {
              path: '',
              element: <TreatmentsPage/>
          },
          {
              path: ':id',
              element: <TreatmentDetails/>
          },
      ]
    },
    {
        path: '/employees',
        children: [
            {
                path: '',
                element: <EmployeesPage/>
            },
            {
                path: ':id',
                element: <EmployeeDetails/>
            }
        ]
    },
    {
        path: '/gallery',
        element: <GalleryPage/>
    }
    // {
    //     element: <ProtectedRoute />,
    //     children: [
    //         {
    //             path: '',
    //             element: ''
    //         }
    //     ]
    // }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <App/>
      <KindeProvider
          clientId={KINDE_CLIENT_ID}
          domain={KINDE_DOMAIN}
          redirectUri={KINDE_REDIRECT_URI}
          logoutUri={KINDE_LOGOUT_URI}
      >
        <RouterProvider router={router}/>
      </KindeProvider>
  </React.StrictMode>,
)
