def capitalize_clean_text(line):
    """
    capitalize the first character of each word
    """
    def capitalize(text):
        return text[0].upper() + text[1:] if text else text
    return " ".join(list(map(capitalize, line.split(" "))))
