import React from "react";
import { Header } from "../components/page-elements/Header";
import { Footer } from "../components/page-elements/Footer";

type Section = {
    title: string;
    content: React.ReactNode;
};

const sections: Section[] = [
    {
        title: "Information We Collect",
        content: (
            <>
                <p style={{ marginBottom: 12 }}>
                    When you use Draftwise, we collect only the information you explicitly provide during your session:
                </p>
                <ul className="list-disc pl-5" style={{ marginBottom: 12, lineHeight: 1.8 }}>
                    <li>The resume file you upload for parsing and editing</li>
                    <li>Job descriptions or role text you paste for tailoring and matching</li>
                    <li>Target job titles or keywords you supply to guide suggestions</li>
                </ul>
                <p>
                    We do not require account creation and do not collect personal identifiers such as your name,
                    email address, or payment information as part of normal resume processing.
                </p>
            </>
        ),
    },
    {
        title: "How We Use Your Information",
        content: (
            <>
                <p style={{ marginBottom: 12 }}>
                    The information you provide is used exclusively to deliver the service you requested:
                </p>
                <ul className="list-disc pl-5" style={{ marginBottom: 12, lineHeight: 1.8 }}>
                    <li>Parse your uploaded resume and display it in an editable format</li>
                    <li>
                        Send your resume content and job description to a third-party AI service for analysis,
                        tailoring suggestions, and scoring (see <em>Third-Party AI Processing</em> below)
                    </li>
                    <li>Return the AI-generated output to you within your active session</li>
                </ul>
                <p>
                    We do not use your resume data for advertising, profiling, or to train proprietary machine
                    learning models.
                </p>
            </>
        ),
    },
    {
        title: "Third-Party AI Processing",
        content: (
            <>
                <p style={{ marginBottom: 12 }}>
                    <strong>Important:</strong> To generate tailored resume suggestions and analysis, Draftwise
                    transmits your resume text and any job description you provide to third-party large language
                    model (LLM) providers, which may include Google Gemini or OpenAI.
                </p>
                <p style={{ marginBottom: 12 }}>
                    These providers process your data under their own privacy policies and terms of service.
                    While we do not store your resume content in our own databases, the third-party providers
                    may temporarily retain submitted content in accordance with their data handling practices.
                </p>
                <p style={{ marginBottom: 12 }}>
                    <strong>We strongly recommend that you do not include highly sensitive information in your
                    resume or job description text</strong>, such as:
                </p>
                <ul className="list-disc pl-5" style={{ marginBottom: 12, lineHeight: 1.8 }}>
                    <li>Social Security Numbers or national identification numbers</li>
                    <li>Financial account or banking details</li>
                    <li>Passwords or access credentials</li>
                    <li>Medical or health information beyond what is professionally relevant</li>
                </ul>
                <p>
                    By using Draftwise, you acknowledge and consent to your provided content being transmitted
                    to these third-party AI services for processing.
                </p>
            </>
        ),
    },
    {
        title: "Data Storage and Retention",
        content: (
            <>
                <p style={{ marginBottom: 12 }}>
                    <strong>Current implementation:</strong> Draftwise processes your resume in real time and
                    stores your parsed resume data locally in your browser&apos;s sessionStorage for the duration
                    of your session.
                </p>
                <p style={{ marginBottom: 12 }}>
                    We do not maintain a server-side database containing your resume content. Your data is not
                    retained on our servers after your session ends.
                </p>
                <p>
                    You can remove all locally stored resume data at any time by clicking &ldquo;Upload new&rdquo;
                    in the editor header, or by closing your browser&apos;s tab, which will clear the sessionStorage.
                </p>
            </>
        ),
    },
    {
        title: "Data Security",
        content: (
            <>
                <p style={{ marginBottom: 12 }}>
                    We take reasonable technical measures to protect your data while it is in transit:
                </p>
                <ul className="list-disc pl-5" style={{ marginBottom: 12, lineHeight: 1.8 }}>
                    <li>All data transmitted between your browser and our service uses HTTPS/TLS encryption</li>
                    <li>
                        Connections to third-party AI providers are made over encrypted channels
                    </li>
                    <li>
                        We do not permanently store full resume files on our servers as part of normal operation
                    </li>
                </ul>
                <p>
                    No system is completely secure. If you have specific security concerns, please contact us
                    using the information in the <em>Contact</em> section below.
                </p>
            </>
        ),
    },
    {
        title: "Your Rights and Choices",
        content: (
            <>
                <p style={{ marginBottom: 12 }}>You have the following controls over your data:</p>
                <ul className="list-disc pl-5" style={{ lineHeight: 1.8 }}>
                    <li>
                        <strong>Reset session:</strong> Click &ldquo;Upload new&rdquo; in the editor at any time
                        to clear your current resume from both the application state and localStorage.
                    </li>
                    <li>
                        <strong>Clear browser storage:</strong> You can manually clear localStorage through your
                        browser&apos;s developer tools or privacy settings to remove any cached resume data.
                    </li>
                    <li>
                        <strong>Opt out:</strong> Simply do not use the service if you are not comfortable with
                        your resume content being sent to third-party AI providers.
                    </li>
                </ul>
            </>
        ),
    },
    {
        title: "Children's Privacy",
        content: (
            <p>
                Draftwise is not directed at children under the age of 16. We do not knowingly collect or
                process personal information from children. If you believe a child has submitted information
                through our service, please contact us and we will take steps to remove it.
            </p>
        ),
    },
    {
        title: "Changes to This Policy",
        content: (
            <p>
                We may update this Privacy Policy from time to time as our service evolves. When we make
                material changes, we will update the &ldquo;Last Updated&rdquo; date at the top of this page.
                We encourage you to review this policy periodically. Continued use of Draftwise after any
                changes constitutes your acceptance of the updated policy.
            </p>
        ),
    },
    {
        title: "Contact",
        content: (
            <>
                <p style={{ marginBottom: 12 }}>
                    If you have questions or concerns about this Privacy Policy or how your data is handled,
                    please reach out:
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

export const PrivacyPolicyPage: React.FC = () => (
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
                        Privacy Policy
                    </h1>
                    <p className="text-slate-500" style={{ fontSize: 13.5 }}>
                        Last Updated: May 7, 2026
                    </p>
                </div>

                {/* Intro */}
                <p className="text-slate-600" style={{ fontSize: 15, lineHeight: 1.75, marginBottom: 40 }}>
                    At Draftwise, your privacy matters. This Privacy Policy describes what information we collect
                    when you use our resume parsing and tailoring service, how we use it, and the choices you have
                    regarding your data. Please read this policy carefully before submitting your resume.
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
