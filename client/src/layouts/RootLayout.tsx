import { Outlet, ScrollRestoration } from "react-router-dom";

export const RootLayout: React.FC = () => (
    <>
        <ScrollRestoration />
        <Outlet />
    </>
);
