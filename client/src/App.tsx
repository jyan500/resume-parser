import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UploadPage } from "./pages/UploadPage";
import { EditorPage } from "./pages/EditorPage";
import { RedirectIfLoaded } from "./components/page-elements/RedirectIfLoaded"

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Redirect to the editor page if a user still has a resume loaded in local storage */}
                <Route element={<RedirectIfLoaded/>}>
                    <Route path="/" element={<UploadPage />} />
                </Route>
                <Route path="/editor" element={<EditorPage />} />
                {/* Catch-all — redirect unknown routes to upload */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
