/* Collapses newlines and extra whitespace into single spaces. */
export const normalizeText = (text: string) => {
    return text.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
}