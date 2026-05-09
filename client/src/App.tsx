import React from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { RootLayout } from "./layouts/RootLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { UploadPage } from "./page-views/UploadPage";
import { EditorPage } from "./page-views/EditorPage";
import { PrivacyPolicyPage } from "./page-views/PrivacyPolicyPage";
import { TermsOfServicePage } from "./page-views/TermsOfServicePage";
import { UPLOAD_PAGE, EDITOR_PAGE, TERMS_OF_SERVICE_PAGE, PRIVACY_POLICY_PAGE } from "./helpers/routes"

const router = createBrowserRouter([
    {
        element: <RootLayout />,
        children: [
            {
                element: <PublicLayout />,
                children: [
                    { path: UPLOAD_PAGE, element: <UploadPage /> },
                    { path: PRIVACY_POLICY_PAGE, element: <PrivacyPolicyPage /> },
                    { path: TERMS_OF_SERVICE_PAGE, element: <TermsOfServicePage /> },
                ],
            },
            { path: EDITOR_PAGE, element: <EditorPage /> },
            { path: "*", element: <Navigate to={UPLOAD_PAGE} replace /> },
        ],
    },
]);

const App: React.FC = () => <RouterProvider router={router} />;

export default App;
