import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector, selectParseStatus } from "../../store";

export const RedirectIfLoaded: React.FC = () => {
    const {parseStatus} = useAppSelector((state) => state.resume)

    if (parseStatus === "success") {
        return <Navigate to="/editor" replace />;
    }

    return <Outlet />;
};
