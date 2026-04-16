import React, { RefObject, useEffect } from "react"

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
		// If there's an ignoreClickRef and the click is inside it, do nothing
		if (ignoreClickRef?.current?.contains(event.target as HTMLElement)) {
			return;
		}
		
		// // If click is outside the ref, trigger callback
		if (ref.current && !ref.current.contains(event.target as HTMLElement)) {
			callback();
		}
	}

	useEffect(() => {
		/* 
			The mousedown event fires before the click event, 
			so it processes the "click outside" logic before the parent button's onClick handler 
			fires to open the dropdown.
		*/
		if (addEventListener){
			document.addEventListener("mousedown", handleClick)
		}

		return () => {
			document.removeEventListener("mousedown", handleClick)
		}
	}, [addEventListener])
}