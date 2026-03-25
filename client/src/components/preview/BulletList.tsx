import React from "react";
import { Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";

export interface SharedBulletStyles {
    bulletList: Style;
    bulletRow: Style;
    bulletDot: Style;
    bulletText: Style;
}

interface BulletListProps {
    bullets: Array<{ id: string | number; text: string; enabled: boolean }>;
    styles: SharedBulletStyles;
    /** Override the bullet character, e.g. "•" or "●". Defaults to "•". */
    bulletChar?: string;
}

export const BulletList: React.FC<BulletListProps> = ({
    bullets,
    styles,
    bulletChar = "•",
}) => (
    <View style={styles.bulletList}>
        {bullets
            .filter((b) => b.enabled && b.text)
            .map((bullet) => (
                /* wrap=false prevents the bullet point and text from being separated on a page break */
                <View key={bullet.id} style={styles.bulletRow} wrap={false}>
                    <Text style={styles.bulletDot}>{bulletChar}</Text>
                    <Text style={styles.bulletText}>{bullet.text}</Text>
                </View>
            ))}
    </View>
);
