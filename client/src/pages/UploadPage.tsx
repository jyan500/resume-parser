import React from "react";
import { CircleCheck } from "lucide-react";
import { UploadPanel } from "../components/upload/UploadPanel";

import floatingLeft from "../assets/floating-resume-left.svg";
import floatingRight from "../assets/floating-resume-right.svg";
import { Header } from "../components/page-elements/Header";
import { HowItWorks } from "../components/landing/HowItWorks";
import { FAQ } from "../components/landing/FAQ";
import { Footer } from "../components/page-elements/Footer";

const trustItems = ["Private by default", "Never stored", "Parses in seconds"];

export const UploadPage: React.FC = () => {
    return (
        <div
            className="flex flex-col"
            style={{ fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif" }}
        >
            {/* Hero wrapper — keeps overflow-hidden scoped to this section */}
            <div id = "upload" className="min-h-screen flex flex-col relative overflow-hidden bg-brand-bg">
                {/* Header */}
                <Header/>

                {/* Floating resume decorations — desktop only */}
                <div
                    className="hidden lg:block absolute z-0 pointer-events-none select-none"
                    style={{ left: 110, top: 260, transform: "rotate(-8deg)", opacity: 0.8 }}
                    aria-hidden="true"
                >
                    <img src={floatingLeft} alt="" width={300} height={380} />
                </div>
                <div
                    className="hidden lg:block absolute z-0 pointer-events-none select-none"
                    style={{ right: 110, top: 260, transform: "rotate(8deg)", opacity: 0.8 }}
                    aria-hidden="true"
                >
                    <img src={floatingRight} alt="" width={300} height={380} />
                </div>

                {/* Hero content */}
                <main
                    className="relative flex-1 flex flex-col items-center px-6 pb-16"
                    style={{ zIndex: 1, paddingTop: 90, gap: 22 }}
                >
                    {/* Badge */}
                    <div
                        className="font-medium tracking-widest uppercase bg-brand-subtle text-brand-medium"
                        style={{
                            padding: "4px 10px",
                            borderRadius: 999,
                            fontSize: 11.5,
                        }}
                    >
                        For job seekers
                    </div>

                    {/* Headline */}
                    <h1
                        className="font-bold text-center text-brand-dark"
                        style={{
                            margin: 0,
                            fontSize: 46,
                            letterSpacing: "-0.028em",
                            lineHeight: 1.08,
                            maxWidth: 780,
                        }}
                    >
                        Turn any resume into an{" "}
                        <span className="text-brand-accent">editable draft</span>.
                    </h1>

                    {/* Description */}
                    <p
                        className="text-center text-brand-muted"
                        style={{ margin: 0, fontSize: 16, fontWeight: 400, maxWidth: 520, lineHeight: 1.55 }}
                    >
                        We handle PDF and DOCX files, pull every section into structured fields, and hand you a
                        clean editor to tailor it to any job.
                    </p>

                    {/* Upload card */}
                    <div style={{ width: "100%", maxWidth: 480, marginTop: 4 }}>
                        <UploadPanel />
                    </div>

                    {/* Trust row */}
                    <div
                        className="flex flex-wrap justify-center"
                        style={{ gap: 28, fontSize: 12.5, color: "#4b6b55", letterSpacing: "0.01em" }}
                    >
                        {trustItems.map((item) => (
                            <div key={item} className="flex items-center" style={{ gap: 7 }}>
                                <CircleCheck size={15} className="text-brand-accent" strokeWidth={1.5} />
                                <span className="text-brand-muted">{item}</span>
                            </div>
                        ))}
                    </div>
                </main>
            </div>

            {/* How it works */}
            <HowItWorks />

            {/* FAQ */}
            <FAQ />

            {/* Footer */}
            <Footer />
        </div>
    );
};
