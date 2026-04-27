import { useCallback } from "react"
import logoDraftwise from "../../assets/logo-draftwise.svg";
import { useLocation, useNavigate } from "react-router-dom"
import { persistor, useAppDispatch } from "../../store";
import { resetResume } from "../../slices/resumeSlice";
import { UPLOAD_PAGE, EDITOR_PAGE } from "../../helpers/routes"
import { ArrowLeft } from "lucide-react"

export const Header = () => {

    const navigate = useNavigate()
    const location = useLocation()
    const isEditorPage = location.pathname === EDITOR_PAGE
    const dispatch = useAppDispatch()
    // Reset in-memory Redux state, flush & purge the localStorage persistence,
    // then navigate back. Awaiting purge ensures the key is removed before the
    // upload page mounts and checks the store.
    const handleBackToUpload = useCallback(async () => {
        dispatch(resetResume());
        await persistor.purge();
        navigate(UPLOAD_PAGE);
    }, [dispatch, navigate]);

    {/* Header */}
    return (
        <header
            className="flex-none flex items-center gap-x-2 border-b border-brand-border"
            style={{ padding: `14px ${isEditorPage ? "20px" : "32px"}`, position: "relative", zIndex: 3 }}
        >
            {/* Back to upload */}
            {
                isEditorPage ? (
                <>
                    <button
                        onClick={() => handleBackToUpload()}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors duration-150"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
                        Upload new
                    </button>
                    <span className="text-slate-200">|</span>
                </>
                ) : null
            }
            <img src={logoDraftwise} alt="Draftwise" className="h-7 w-auto" />
            <p className="text-brand-dark font-semibold" style={{ fontSize: "15.6px", lineHeight: "1.4" }}>Draftwise</p>
        </header>
    )
}
