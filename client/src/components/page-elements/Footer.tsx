import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo"
import { UPLOAD_PAGE } from "../../helpers/routes"

const quickLinks = [
    { label: "Upload Resume", href: "/#upload" },
    { label: "How it Works", href: "/#how-it-works" },
    { label: "FAQ", href: "/#faq" },
];

type SupportLink = { label: string; href: string; internal?: boolean };

const supportLinks: SupportLink[] = [
    { label: "Privacy Policy", href: "/privacy-policy", internal: true },
    { label: "Terms of Service", href: "/terms-of-service", internal: true },
];

export const Footer: React.FC = () => (
    <footer className="bg-brand-dark" style={{ paddingTop: 56, paddingBottom: 0 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", paddingLeft: 24, paddingRight: 24 }}>
            {/* Main row */}
            <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 48, paddingBottom: 48 }}>
                {/* Brand column */}
                <div className="flex flex-col" style={{ gap: 14, gridColumn: "span 1" }}>
                    <div className="flex items-center" style={{ gap: 8 }}>
                        <Link to={UPLOAD_PAGE} className = "flex flex-row gap-x-2 items-center">
                            <Logo isFooter={true}/> 
                        </Link>
                    </div>
                    <p className="text-brand-subtle" style={{ fontSize: 13.5, lineHeight: 1.65, margin: 0, maxWidth: 260 }}>
                        AI-powered resume parsing and tailoring. Turn any resume into an ATS-friendly draft in seconds.
                    </p>
                </div>

                {/* Quick Links */}
                <div className="flex flex-col" style={{ gap: 14 }}>
                    <span className="font-semibold text-white" style={{ fontSize: 13 }}>
                        Quick Links
                    </span>
                    <ul className="flex flex-col" style={{ gap: 10, listStyle: "none", padding: 0, margin: 0 }}>
                        {quickLinks.map((link) => (
                            <li key={link.label}>
                                <a
                                    href={link.href}
                                    style={{ fontSize: 13.5, textDecoration: "none" }}
                                    className="text-brand-subtle"
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Support */}
                <div className="flex flex-col" style={{ gap: 14 }}>
                    <span className="font-semibold text-white" style={{ fontSize: 13 }}>
                        Support
                    </span>
                    <ul className="flex flex-col" style={{ gap: 10, listStyle: "none", padding: 0, margin: 0 }}>
                        {supportLinks.map((link) => (
                            <li key={link.label}>
                                {link.internal ? (
                                    <Link
                                        to={link.href}
                                        style={{ fontSize: 13.5, textDecoration: "none" }}
                                        className="text-brand-subtle"
                                    >
                                        {link.label}
                                    </Link>
                                ) : (
                                    <a
                                        href={link.href}
                                        style={{ fontSize: 13.5, textDecoration: "none" }}
                                        className="text-brand-subtle"
                                    >
                                        {link.label}
                                    </a>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Bottom bar */}
            <div
                className="flex items-center border-t"
                style={{ borderColor: "#1e5c38", paddingTop: 20, paddingBottom: 20 }}
            >
                <p className = "text-brand-subtle" style={{ fontSize: 12.5, margin: 0 }}>
                    © {new Date().getFullYear()} Draftwise. All rights reserved.
                </p>
            </div>
        </div>
    </footer>
);
