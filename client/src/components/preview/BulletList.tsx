import React from "react";
import { Link, Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";

export interface SharedBulletStyles {
    bulletList: Style;
    bulletRow: Style;
    bulletLinkContainer: Style;
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
                // Link wraps the whole row so the annotation covers the full
                // bullet region including the dot. The View inside keeps
                // wrap={false} so page-break behaviour is unchanged.
                <Link style={styles.bulletLinkContainer} key={bullet.id} src={`http://r/#${bullet.id}`}>
                    <View style={styles.bulletRow} wrap={false}>
                        <Text style={styles.bulletDot}>{bulletChar}</Text>
                        <Text style={styles.bulletText}>{bullet.text}</Text>
                    </View>
                </Link>
            ))}
    </View>
);
