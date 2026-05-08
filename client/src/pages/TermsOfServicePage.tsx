import React from "react";
import { Header } from "../components/page-elements/Header";
import { Footer } from "../components/page-elements/Footer";

type Section = {
    title: string;
    content: React.ReactNode;
};

const sections: Section[] = [
    {
        title: "Acceptance of Terms",
        content: (
            <>
                <p style={{ marginBottom: 12 }}>
                    By accessing or using Draftwise, including uploading resume content, running analyses, or using
                    any of the tools on this site, you agree to be bound by these Terms of Service and our{" "}
                    <a href="/privacy-policy" className="text-brand-accent" style={{ textDecoration: "none" }}>
                        Privacy Policy
                    </a>
                    . Please read them carefully before using the service.
                </p>
                <p style={{ marginBottom: 12 }}>
                    Draftwise is primarily available without mandatory user accounts; most functionality is
                    session-based and can be used anonymously unless you provide contact information for optional
                    features.
                </p>
                <p>
                    We may update these Terms from time to time. We will update the &ldquo;Last Updated&rdquo; date
                    at the top of this page when changes are made. Continued use of Draftwise after any update
                    constitutes your acceptance of the revised Terms.
                </p>
            </>
        ),
    },
    {
        title: "Service Description",
        content: (
            <>
                <p style={{ marginBottom: 12 }}>
                    Draftwise provides AI-powered resume optimization services, including:
                </p>
                <ul className="list-disc pl-5" style={{ marginBottom: 12, lineHeight: 1.8 }}>
                    <li>Resume and job description matching</li>
                    <li>PDF preview and editing capabilities</li>
                    <li>Keyword identification and integration suggestions</li>
                </ul>
                <p>
                    Our service is provided &ldquo;as is.&rdquo; We make no guarantees about job placement,
                    interview invitations, or employment outcomes. Draftwise is a tool to assist in resume
                    preparation, not a guarantee of employment success.
                </p>
            </>
        ),
    },
    {
        title: "User Responsibilities and Acceptable Use",
        content: (
            <>
                <p style={{ marginBottom: 8 }}>
                    <strong>You agree to:</strong>
                </p>
                <ul className="list-disc pl-5" style={{ marginBottom: 16, lineHeight: 1.8 }}>
                    <li>Use the service only for lawful purposes</li>
                    <li>Provide accurate information in your resume</li>
                    <li>Not misrepresent your qualifications or experience</li>
                    <li>Not use the service to create fraudulent documents</li>
                    <li>Respect intellectual property rights</li>
                    <li>Not attempt to hack, disrupt, or compromise the platform&apos;s security</li>
                </ul>
                <p style={{ marginBottom: 8 }}>
                    <strong>You agree NOT to:</strong>
                </p>
                <ul className="list-disc pl-5" style={{ lineHeight: 1.8 }}>
                    <li>Upload malicious files or code</li>
                    <li>Use automated systems (bots) to access the service without permission</li>
                    <li>Reverse engineer or attempt to extract source code</li>
                    <li>Resell or redistribute our service without authorization</li>
                    <li>Use the platform to harass, abuse, or harm others</li>
                    <li>Violate any applicable laws or regulations</li>
                </ul>
            </>
        ),
    },
    {
        title: "Intellectual Property Rights",
        content: (
            <>
                <p style={{ marginBottom: 8 }}>
                    <strong>Your Content:</strong>
                </p>
                <p style={{ marginBottom: 16 }}>
                    You retain all rights to the content you upload, including your resume. By using our service,
                    you grant Draftwise a limited license to process, analyze, and optimize your content solely for
                    the purpose of providing our services to you.
                </p>
                <p style={{ marginBottom: 8 }}>
                    <strong>Our Platform:</strong>
                </p>
                <p style={{ marginBottom: 16 }}>
                    All rights, title, and interest in Draftwise, including software, algorithms, design,
                    trademarks, and content, are owned by Draftwise and protected by copyright and other
                    intellectual property laws.
                </p>
                <p style={{ marginBottom: 8 }}>
                    <strong>AI-Generated Content:</strong>
                </p>
                <p>
                    The optimized resumes generated by our AI are provided to you for your use. You are responsible
                    for reviewing and ensuring the accuracy of all AI-generated content before using it in job
                    applications.
                </p>
            </>
        ),
    },
    {
        title: "Limitation of Liability",
        content: (
            <>
                <p style={{ marginBottom: 12 }}>
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, DRAFTWISE AND ITS DEVELOPERS SHALL NOT BE LIABLE FOR:
                </p>
                <ul className="list-disc pl-5" style={{ lineHeight: 1.8 }}>
                    <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                    <li>Loss of profits, revenue, data, or business opportunities</li>
                    <li>Employment outcomes or lack thereof</li>
                    <li>Errors or inaccuracies in AI-generated content</li>
                    <li>Service interruptions or technical issues</li>
                    <li>Unauthorized access to your account due to your failure to maintain security</li>
                </ul>
            </>
        ),
    },
    {
        title: "Disclaimer of Warranties",
        content: (
            <>
                <p style={{ marginBottom: 12 }}>
                    DRAFTWISE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES
                    OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
                </p>
                <ul className="list-disc pl-5" style={{ marginBottom: 12, lineHeight: 1.8 }}>
                    <li>Warranties of merchantability or fitness for a particular purpose</li>
                    <li>Warranties that the service will be uninterrupted or error-free</li>
                    <li>Warranties regarding the accuracy or reliability of AI-generated content</li>
                    <li>Warranties that the service will result in employment or interviews</li>
                </ul>
                <p>
                    You acknowledge that AI technology has limitations and may produce errors. You are solely
                    responsible for reviewing and verifying all content before use.
                </p>
            </>
        ),
    },
    {
        title: "Indemnification",
        content: (
            <>
                <p style={{ marginBottom: 12 }}>
                    You agree to indemnify, defend, and hold harmless Draftwise and its developers from any claims,
                    damages, losses, liabilities, and expenses (including legal fees) arising from:
                </p>
                <ul className="list-disc pl-5" style={{ lineHeight: 1.8 }}>
                    <li>Your use or misuse of the service</li>
                    <li>Your violation of these Terms of Service</li>
                    <li>Your violation of any rights of another party</li>
                    <li>Any content you submit or generate using our service</li>
                </ul>
            </>
        ),
    },
    {
        title: "Governing Law and Disputes",
        content: (
            <>
                <p style={{ marginBottom: 12 }}>
                    These Terms of Service shall be governed by and construed in accordance with the laws of the
                    United States, without regard to conflict of law provisions.
                </p>
                <p>
                    Any disputes arising from these Terms or your use of Draftwise shall be resolved through binding
                    arbitration, except where prohibited by law. You agree to waive any right to a jury trial or to
                    participate in a class action.
                </p>
            </>
        ),
    },
    {
        title: "Severability",
        content: (
            <p>
                If any provision of these Terms of Service is found to be unenforceable or invalid, that provision
                will be limited or eliminated to the minimum extent necessary. The remaining provisions will remain in
                full force and effect.
            </p>
        ),
    },
    {
        title: "Entire Agreement",
        content: (
            <p>
                These Terms of Service, together with our{" "}
                <a href="/privacy-policy" className="text-brand-accent" style={{ textDecoration: "none" }}>
                    Privacy Policy
                </a>
                , constitute the entire agreement between you and Draftwise regarding your use of our service,
                superseding any prior agreements.
            </p>
        ),
    },
    {
        title: "Contact Information",
        content: (
            <>
                <p style={{ marginBottom: 12 }}>
                    If you have questions about these Terms of Service, please contact us:
                </p>
                <p>
                    <strong>Email:</strong>{" "}
                    <a href="mailto:jyan500@gmail.com" className="text-brand-accent" style={{ textDecoration: "none" }}>
                        jyan500@gmail.com
                    </a>
                </p>
            </>
        ),
    },
];

export const TermsOfServicePage: React.FC = () => (
    <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main style={{ flex: 1 }}>
            <div style={{ maxWidth: 800, margin: "0 auto", padding: "56px 24px 72px" }}>
                {/* Page heading */}
                <div style={{ marginBottom: 40, textAlign: "center" }}>
                    <h1
                        className="text-brand-dark font-bold"
                        style={{ fontSize: 32, marginBottom: 8 }}
                    >
                        Terms of Service
                    </h1>
                    <p className="text-slate-500" style={{ fontSize: 13.5 }}>
                        Last Updated: May 7, 2026
                    </p>
                </div>

                {/* Intro */}
                <p className="text-slate-600" style={{ fontSize: 15, lineHeight: 1.75, marginBottom: 40 }}>
                    Welcome to Draftwise. By accessing or using our platform, you agree to be bound by these Terms
                    of Service. Please read them carefully before using any part of the service.
                </p>

                {/* Sections */}
                <div className="flex flex-col" style={{ gap: 40 }}>
                    {sections.map((section) => (
                        <section key={section.title}>
                            <h2
                                className="text-brand-dark font-semibold"
                                style={{ fontSize: 19, marginBottom: 14 }}
                            >
                                {section.title}
                            </h2>
                            <div className="text-slate-600" style={{ fontSize: 14.5, lineHeight: 1.75 }}>
                                {section.content}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </main>
        <Footer />
    </div>
);
