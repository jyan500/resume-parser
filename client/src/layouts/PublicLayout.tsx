import { Outlet } from "react-router-dom";

export const PublicLayout: React.FC = () => (
    <div style={{ fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <Outlet />
    </div>
);
