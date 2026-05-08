import React from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { RootLayout } from "./layouts/RootLayout";
import { UploadPage } from "./pages/UploadPage";
import { EditorPage } from "./pages/EditorPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { TermsOfServicePage } from "./pages/TermsOfServicePage";
import { RedirectIfLoaded } from "./components/page-elements/RedirectIfLoaded";

const router = createBrowserRouter([
    {
        element: <RootLayout />,
        children: [
            {
                element: <RedirectIfLoaded />,
                children: [{ path: "/", element: <UploadPage /> }],
            },
            { path: "/editor", element: <EditorPage /> },
            { path: "/privacy-policy", element: <PrivacyPolicyPage /> },
            { path: "/terms-of-service", element: <TermsOfServicePage /> },
            { path: "*", element: <Navigate to="/" replace /> },
        ],
    },
]);

const App: React.FC = () => <RouterProvider router={router} />;

export default App;
