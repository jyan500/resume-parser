"use client"

import { HOVER_Z_INDEX } from "../../_lib/constants"

interface Props {
	text: string
	width?: string
	direction?: 'top' | 'left' | 'bottom' | 'right'
    forceShow?: boolean
}

/* CSS only tooltip that displays text and appears on hover only */
export const HoverTooltip = ({text, width, direction = 'top', forceShow=false}: Props) => {
    let tooltipClasses = ""
    let arrowClasses = ""

	/*
	how this works:
	a w-0 h-0 element with a border creates a triangle
	giving all three border directions a size but transparent will hide the triangles, but then leave
	the one direction you want with a color

	bottom-full left-1/2 -translate-x-1/2 controls the positioning of the arrow itself relative to the tooltip
	*/
    switch (direction) {
        case 'bottom':
            tooltipClasses = "top-full left-1/2 -translate-x-1/2 mt-2"
            arrowClasses = "bottom-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-transparent border-b-4 border-b-gray-900"
            break
        case 'left':
            tooltipClasses = "right-full top-1/2 -translate-y-1/2 mr-2"
            arrowClasses = "left-full top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-transparent border-l-4 border-l-gray-900"
            break
        case 'right':
            tooltipClasses = "left-full top-1/2 -translate-y-1/2 ml-2"
            arrowClasses = "right-full top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-transparent border-r-4 border-r-gray-900"
            break
        case 'top':
        default:
            tooltipClasses = "bottom-full left-1/2 -translate-x-1/2 mb-2"
            arrowClasses = "top-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-transparent border-t-4 border-t-gray-900"
            break
    }

	return (
	    <div className={`${HOVER_Z_INDEX} absolute px-2 py-1 text-sm text-white bg-gray-900 rounded ${!forceShow ? "opacity-0 invisible group-hover:opacity-100 group-hover:visible" : "opacity-100 visible"} transition-all duration-200 pointer-events-none ${width ? width : "w-max"} ${tooltipClasses}`}>
	        <span className = "w-full text-wrap">{text}</span>
	        <div className={`absolute w-0 h-0 ${arrowClasses}`}></div>
	    </div>
    )
}
