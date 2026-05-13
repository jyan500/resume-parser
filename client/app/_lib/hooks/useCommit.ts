import { useState, useRef, useEffect } from "react"

export const DEFAULT_COMMIT_DELAY = 600

export const useCommit = (
	reduxValue: string,
	onChange: (v: string) => void,
	delay = DEFAULT_COMMIT_DELAY
) => {
	const [local, setLocal] = useState(reduxValue);
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const pendingRef = useRef<string | null>(null);

	useEffect(() => {
		setLocal(reduxValue);
	}, [reduxValue]);

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
