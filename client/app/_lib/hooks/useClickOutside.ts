import { type RefObject, useEffect } from "react"

/*
Places a click event listener on the component that is designated by the ref
Removes the click handler when the component unmounts or if addEventListener is false
If user clicks anywhere outside of the ref that was passed in, trigger callback function
*/
export const useClickOutside = (
	ref: RefObject<HTMLElement | undefined>,
	callback: () => void,
	ignoreClickRef: RefObject<HTMLElement | undefined> | undefined,
	addEventListener = true
) => {
	const handleClick = (event: MouseEvent) => {
		if (ignoreClickRef?.current?.contains(event.target as HTMLElement)) {
			return;
		}

		if (ref.current && !ref.current.contains(event.target as HTMLElement)) {
			callback();
		}
	}

	useEffect(() => {
		if (addEventListener){
			document.addEventListener("mousedown", handleClick)
		}

		return () => {
			document.removeEventListener("mousedown", handleClick)
		}
	}, [addEventListener])
}
