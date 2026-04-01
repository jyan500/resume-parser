import type { StylesConfig, ClassNamesConfig, GroupBase } from 'react-select'
import type { OptionType } from "../types/api"
import { SELECT_Z_INDEX } from './constants'

// Define your option type (adjust based on your actual option structure)
interface GetSelectStylesParams {
    isDarkMode: boolean
    textColor?: string
    textAlign?: string
    className?: string
    hideIndicatorSeparator?: boolean
    menuInPortal?: boolean
    isError?: boolean
}

export const getSelectStyles = ({
    isDarkMode,
    textColor = 'inherit',
    textAlign = 'left',
    className = 'w-full',
    hideIndicatorSeparator = false,
    menuInPortal = false,
    isError = false,
}: GetSelectStylesParams): {
    classNames: ClassNamesConfig<OptionType, false, GroupBase<OptionType>>
    styles: StylesConfig<OptionType, false, GroupBase<OptionType>>
} => {

    /* TODO: Dark Mode Styling is commented out right now, but if other form inputs get dark styling, this can be uncommented*/
    return {
        classNames: {
            // control: (state) => `${className} ${SELECT_Z_INDEX}`,
            control: (state) => `${className} ${SELECT_Z_INDEX} dark:!tw-bg-gray-800 dark:!tw-border-gray-600`,
            menu: (base) => `dark:!tw-bg-gray-800`,
            placeholder: (base) => `dark:!tw-text-gray-200`,
        },
        styles: {
            /* https://stackoverflow.com/questions/57089251/react-select-can-not-overlay-react-modal */
            menuPortal: base => ({ ...base, zIndex: menuInPortal ? 9999 : 50 }),
            control: (baseStyles, state) => ({
                ...baseStyles,
                height: "43px",
                padding: ".1em",
                textAlign: textAlign as any,
                /* box shadow override is needed as react-select has preset box-shadow*/
                borderColor: isError
                    ? '#f87171'  // red-400
                    : state.isFocused
                        ? '#3b82f6'  // blue-500 on focus
                        : baseStyles.borderColor,
                boxShadow: isError
                    ? '0 0 0 1px #f87171'
                    : baseStyles.boxShadow,
                '&:hover': {
                    borderColor: isError ? '#f87171' : '#3b82f6',
                },
            }),
            option: (provided, state) => ({
                ...provided,
                color: isDarkMode
                    ? (state.isFocused ? '#f9fafb' : '#e5e7eb')
                    : (state.isFocused ? '#111827' : '#374151'),
                backgroundColor: isDarkMode
                    ? (state.isFocused ? '#374151' : '#1f2937')
                    : (state.isFocused ? '#f3f4f6' : 'white'),
                cursor: 'pointer',
            }),
            singleValue: (base) => ({
                ...base,
                // color: textColor,
                color: textColor === "inherit" ? isDarkMode ? "white" : "black" : textColor,
            }),
            placeholder: (base) => ({
                ...base,
                color: textColor === "inherit" ? (isDarkMode ? "white": "black") : textColor,
                // color: textColor,
                textAlign: textAlign as any,
            }),
            dropdownIndicator: (provided) => ({
                ...provided,
                'svg': {
                    fill: textColor === "inherit" ? (isDarkMode ? "white" : "black") : textColor,
                },
                // 'svg': {
                //     fill: textColor
                // }
            }),
            valueContainer: (provided) => ({
                ...provided,
                textAlign: textAlign as any,
            }),
            indicatorSeparator: () => ({
                display: hideIndicatorSeparator ? 'none' : 'block',
                'svg': {
                    fill: textColor === "inherit" ? (isDarkMode ? "white": "black") : textColor
                }
                // 'svg': {
                //     fill: textColor 
                // }
            }),
        },
    }
}
