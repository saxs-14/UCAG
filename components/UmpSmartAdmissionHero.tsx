"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export function UmpSmartAdmissionHero() {
  const graphicRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [visibleCards, setVisibleCards] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const graphic = graphicRef.current;
    const card = cardRef.current;
    if (!graphic || !card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = graphic.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -20;
      const rotateY = ((x - centerX) / centerX) * 20;

      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = `rotateX(0deg) rotateY(0deg)`;
    };

    graphic.addEventListener("mousemove", handleMouseMove);
    graphic.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      graphic.removeEventListener("mousemove", handleMouseMove);
      graphic.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-id");
            if (id) {
              setVisibleCards((prev) => ({ ...prev, [id]: true }));
            }
          }
        });
      },
      { threshold: 0.15 }
    );

    const cards = document.querySelectorAll(".feature-card-observer");
    cards.forEach((c) => observer.observe(c));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      {/* ── Hero Section ── */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#003b5c] via-[#002840] to-[#001f30] text-white py-16 px-6 sm:px-12 lg:px-16 shadow-lg">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-10 md:flex-row">
          {/* Hero Content */}
          <div className="max-w-xl animate-rise-in flex flex-col gap-4">
            <span className="w-fit rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#d4af37] border border-[#d4af37]/30 backdrop-blur-md">
              UCAG · UMP Smart Admission
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight">
              Your Journey Starts Here
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              UMP Smart Admission, Recruitment &amp; Student Success Platform. A unified experience for applicants, matriculants, and institutions.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/ump/programmes"
                className="inline-flex items-center gap-2 rounded-full bg-[#d4af37] px-7 py-3 text-sm font-bold text-[#003b5c] shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#d4af37]/30 active:translate-y-0"
              >
                Explore Platform →
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                Calculate APS Score
              </Link>
            </div>
          </div>

          {/* 3D Floating Graphic Card */}
          <div
            ref={graphicRef}
            className="hero-graphic relative flex size-72 sm:size-80 items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-transform duration-300 hover:shadow-2xl hover:shadow-[#d4af37]/10"
            style={{
              perspective: "1000px",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              ref={cardRef}
              className="card-3d flex size-full flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#f1d570] p-6 text-center text-[#003b5c] shadow-2xl transition-transform duration-100 ease-out"
            >
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#003b5c]/80">University of Mpumalanga</span>
              <span className="text-2xl sm:text-3xl font-black leading-tight">Apply Now<br />2027</span>
              <span className="mt-2 rounded-full bg-[#003b5c] px-3.5 py-1 text-[11px] font-bold text-[#d4af37]">Smart Portal</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="explore" className="w-full max-w-5xl px-6 py-12 sm:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              id: "f1",
              title: "Seamless Recruitment",
              description:
                "Advanced tools to engage prospective students and guide them through their application journey seamlessly across all devices.",
              icon: "📱",
            },
            {
              id: "f2",
              title: "Operational Efficiency",
              description:
                "Configurable administrative dashboards that streamline institutional decision-making and admission processing.",
              icon: "⚡",
            },
            {
              id: "f3",
              title: "Student Success",
              description:
                "Post-admission resources, tracking, and guidance to ensure every learner thrives at the University of Mpumalanga.",
              icon: "🎓",
            },
          ].map((f) => {
            const isVisible = visibleCards[f.id];
            return (
              <div
                key={f.id}
                data-id={f.id}
                className={`feature-card-observer card-learner flex flex-col gap-3 rounded-2xl p-6 text-center transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <span className="text-3xl">{f.icon}</span>
                <h3 className="text-lg font-bold text-[#003b5c]">{f.title}</h3>
                <p className="text-xs text-ink-soft leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
