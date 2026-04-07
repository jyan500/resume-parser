import React from "react";
import { Link, Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { Bullet } from "../../types/resume"

export interface SharedBulletStyles {
    bulletList: Style;
    bulletRow: Style;
    bulletLinkContainer: Style;
    bulletDot: Style;
    bulletText: Style;
}

interface BulletListProps {
    bullets: Array<Bullet>;
    styles: SharedBulletStyles;
    interactive?: boolean
    /** Override the bullet character, e.g. "•" or "●". Defaults to "•". */
    bulletChar?: string;
}

export const BulletList: React.FC<BulletListProps> = ({
    bullets,
    styles,
    interactive,
    bulletChar = "•",
}) => {
    const showBullet = (b: Bullet) => {
        return (
            <View style={styles.bulletRow} wrap={false}>
                <Text style={styles.bulletDot}>{bulletChar}</Text>
                <Text style={styles.bulletText}>{b.text}</Text>
            </View>
        )
    }

    return (
        <View style={styles.bulletList}>
            {bullets
                .filter((b) => b.enabled && b.text)
                .map((bullet) => {
                    // Link wraps the whole row so the annotation covers the full
                    // bullet region including the dot. The View inside keeps
                    // wrap={false} so page-break behaviour is unchanged.
                    if (interactive){
                        return (
                            <Link style={styles.bulletLinkContainer} key={bullet.id} src={`http://r/#${bullet.id}`}>
                                {showBullet(bullet)}          
                            </Link>
                        )
                    }
                    return showBullet(bullet)
                })}
        </View>
    )
};
     