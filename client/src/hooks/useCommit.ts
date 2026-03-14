import React, {useState, useRef, useEffect} from "react"
// ─── useCommit ────────────────────────────────────────────────────────────────
// Shared logic for both Field and DebouncedTextarea.
//
// Behaviour:
//  • Local state updates instantly on every keystroke (fast UI).
//  • `onChange` (Redux dispatch) is called automatically after `delay` ms of
//    silence — the debounce path.
//  • `flush()` cancels the pending timer and dispatches immediately — used by
//    onBlur so that clicking away never leaves a stale pending value.
//  • `useEffect([reduxValue])` syncs local state back down if Redux changes
//    externally (e.g. loading a new resume).
 
export const useCommit = (
    reduxValue: string,
    onChange: (v: string) => void,
    delay = 600
) => {
    const [local, setLocal] = useState(reduxValue);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingRef = useRef<string | null>(null); // value waiting to be committed
 
    // Sync down when the upstream value is replaced externally.
    useEffect(() => {
        setLocal(reduxValue);
    }, [reduxValue]);
 
    // Cancel timer on unmount.
    useEffect(() => {
        return () => { if (timer.current) clearTimeout(timer.current); };
    }, []);
 
    const handleChange = (v: string) => {
        setLocal(v);
        pendingRef.current = v;
 
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            if (pendingRef.current !== null && pendingRef.current !== reduxValue) {
                onChange(pendingRef.current);
                pendingRef.current = null;
            }
            timer.current = null;
        }, delay);
    };
 
    // Flush: cancel the timer and commit right now (called from onBlur).
    const flush = () => {
        if (timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
        }
        if (pendingRef.current !== null && pendingRef.current !== reduxValue) {
            onChange(pendingRef.current);
            pendingRef.current = null;
        }
    };
 
    return { local, handleChange, flush };
}
