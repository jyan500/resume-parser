"use client"

import React from "react";
import { Text } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";

export interface SharedSectionHeaderStyles {
    sectionHeader: Style;
}

interface SectionHeaderProps {
    title: string;
    styles: SharedSectionHeaderStyles;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, styles }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
);
