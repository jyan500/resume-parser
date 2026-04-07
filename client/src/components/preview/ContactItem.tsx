import React from "react";
import { Text, View, Link } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";

export interface SharedContactStyles {
    contactText: Style;
    contactSeparator: Style;
    contactLink: Style;
}

interface ContactItemProps {
    value?: string;
    isLink?: boolean;
    isFirst?: boolean;
    styles: SharedContactStyles;
    interactive?: boolean
}

export const ContactItem: React.FC<ContactItemProps> = ({
    value,
    isLink,
    isFirst,
    styles,
    interactive,
}) => {
    if (!value) return null;
    return (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
            {!isFirst && <Text style={styles.contactSeparator}>|</Text>}
            {isLink ? (
                <Link style={styles.contactLink} src={value}>
                    {value.replace(/^https?:\/\//, "")}
                </Link>
            ) : (
                <Text style={styles.contactText}>{value}</Text>
            )}
        </View>
    );
};

