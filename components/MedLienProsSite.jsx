"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  FileText,
  Send,
  CalendarClock,
  Stamp,
  BadgeCheck,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Building2,
  Users,
  Sparkles,
  CreditCard,
  Plus,
  Trash2,
  Info,
} from "lucide-react";

/**
 * Logo
 * - Recommended: place your logo at /public/Logo.png and keep LOGO_SRC = "/Logo.png"
 */
const LOGO_SRC = "/logo.jpg";

const BRAND = {
  name: "MedLien Pros",
  tagline: "Medical Lien Filing Services",
  phone: "(619) 277-5179",
  email: "medlienpros.submissions@gmail.com",
  addressLines: [
    "PMB 236",
    "13771 N Fountain Hills BLVD",
    "Fountain Hills, Arizona 85268",
  ],
  serviceArea: "Arizona • Statewide",
};

const PRICING = {
  file: 75,
  release: 75,
  rush: 75,
  standardTurnaround: "2–3 business days",
  rushTurnaround: "24 hours",
};

const money = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number.isFinite(n) ? n : 0);

const isBlank = (v) => String(v ?? "").trim() === "";

const allFilled = (obj) =>
  Object.values(obj).every((v) => String(v ?? "").trim() !== "");

const Section = ({ id, eyebrow, title, subtitle, children }) => (
  <section id={id} className="scroll-mt-24 py-16 md:py-20">
    <div className="mx-auto max-w-6xl px-4">
      <div className="mb-10">
        {eyebrow ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
            <Sparkles className="h-4 w-4" />
            {eyebrow}
          </div>
        ) : null}
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
            {subtitle}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  </section>
);

const Pill = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
    {children}
  </span>
);

const NavLink = ({ href, children }) => (
  <a
    href={href}
    className="text-sm font-medium text-slate-700 hover:text-slate-900"
  >
    {children}
  </a>
);

const Card = ({ icon: Icon, title, children }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-start gap-3">
      <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <div className="mt-2 text-sm leading-relaxed text-slate-600">
          {children}
        </div>
      </div>
    </div>
  </div>
);

const inputBase =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200";

const emptyInsurance = () => ({
  companyName: "",
  phone: "",
  address: "",
  policyNumber: "",
  adjusterName: "",
});

const emptyAttorney = () => ({
  attorneyName: "",
  firmName: "",
  phone: "",
  address: "",
});

const emptyRow = () => ({
  patientFirst: "",
  patientLast: "",
  dob: "",
  dateOfInjury: "",
  dateOfServiceFrom: "", // required
  dateOfServiceTo: "", // optional
  treatmentOngoing: false,
  totalCharges: "", // required for new lien
  county: "", // required
  accidentLocation: "",
  rush: false,
  notes: "",

  hasInsurance: false,
  insurance: emptyInsurance(),

  hasAttorney: false,
  attorney: emptyAttorney(),
});

export default function MedLienProsSite() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Pay Online
  const [payType, setPayType] = useState("liens_filed"); // liens_filed | releases
  const [payInvoiceNumber, setPayInvoiceNumber] = useState("");
  const [payAmount, setPayAmount] = useState("");

  // Request form (bulk)
  const [requestType, setRequestType] = useState("new_lien"); // new_lien | release

  const [provider, setProvider] = useState({
    providerName: "", // provider who saw the patient
    contactName: "", // for lien-related communications
    practiceName: "",
    practiceAddress: "",
    fax: "",
    lienPhone: "",
    lienEmail: "",
  });

  const [rows, setRows] = useState([emptyRow()]);
  const [files, setFiles] = useState([]);

  // Mailing method election (standard is included in base pricing)
  const [mailingMethod, setMailingMethod] = useState("standard"); // standard | certified | certified_rr
  const [mailingRecipientCount, setMailingRecipientCount] = useState(2);
  const [mailingPostageEstimate, setMailingPostageEstimate] = useState(0);

  const MAIL_HANDLING_FEE = {
    standard: 0,
    certified: 5,
    certified_rr: 7,
  };

  const baseFee = requestType === "release" ? PRICING.release : PRICING.file;

  const rowTotals = useMemo(
    () => rows.map((r) => baseFee + (r.rush ? PRICING.rush : 0)),
    [rows, baseFee]
  );

  const mailingEstimate = useMemo(() => {
    const count = Math.max(0, Number(mailingRecipientCount) || 0);
    const handling = MAIL_HANDLING_FEE[mailingMethod] || 0;
    const postage = Math.max(0, Number(mailingPostageEstimate) || 0);
    if (mailingMethod === "standard") return 0;
    return count * (handling + postage);
  }, [mailingMethod, mailingRecipientCount, mailingPostageEstimate]);

  const grandTotal = useMemo(
    () =>
      rowTotals.reduce((sum, v) => sum + (Number.isFinite(v) ? v : 0), 0) +
      (Number.isFinite(mailingEstimate) ? mailingEstimate : 0),
    [rowTotals, mailingEstimate]
  );

  const setRequestTypeSafe = (next) => {
    setRequestType((prev) => {
      if (prev !== "release" && next === "release") {
        setRows((rs) =>
          rs.map((r) => ({
            ...r,
            dateOfServiceTo: "",
            treatmentOngoing: false,
            totalCharges: "",
            accidentLocation: "",
          }))
        );
        setMailingRecipientCount(0);
      }

      if (prev === "release" && next !== "release") {
        setMailingRecipientCount((c) => {
          const n = Number(c) || 0;
          return n <= 0 ? 2 : n;
        });
      }

      return next;
    });
  };

  const processSteps = [
    {
      icon: FileText,
      title: "1) Intake",
      text: "You submit the intake details (or bulk request) and any supporting documents. We confirm completeness (administrative only).",
    },
    {
      icon: Stamp,
      title: "2) Prepare",
      text: "We prepare lien or release documents using your information and approved templates (no legal advice).",
    },
    {
      icon: BadgeCheck,
      title: "3) Record",
      text: "We submit to the appropriate Arizona County Recorder (eRecording where available).",
    },
    {
      icon: Send,
      title: "4) Statutory Notices",
      text: "For new liens, we send notice copies as requested and log proof of mailing.",
    },
    {
      icon: CalendarClock,
      title: "5) Track",
      text: "We track recording and mailing dates and keep your request status organized.",
    },
    {
      icon: ShieldCheck,
      title: "6) Release",
      text: "For releases, we prepare and submit releases upon provider authorization and confirmation.",
    },
  ];

  const faqs = [
    {
      q: "Do you provide legal advice?",
      a: "No. MedLien Pros is an administrative filing service. We prepare and submit recording documents based on client-provided information and handle mailings and tracking. For legal questions, consult your attorney.",
    },
    {
      q: "Do you negotiate balances or collect funds?",
      a: "No. We do not negotiate, participate in settlement discussions, or collect debts. We file documents and releases when authorized.",
    },
    {
      q: "What’s the turnaround time?",
      a: `Standard processing is ${PRICING.standardTurnaround} after we receive complete, properly signed documentation. Rush processing (${PRICING.rushTurnaround}) is available as an add-on when feasible.`,
    },
    {
      q: "Can I submit multiple lien requests at once?",
      a: "Yes. Use the bulk submission table to add as many patients as needed. Totals are calculated per row and summed automatically.",
    },
  ];

  const onPayOnline = (e) => {
    e.preventDefault();

    if (isBlank(payInvoiceNumber)) {
      alert("Please enter an invoice number before continuing to payment.");
      return;
    }
    if (isBlank(payAmount)) {
      alert("Please enter the payment amount.");
      return;
    }

    alert(
      `Demo: Pay Online\nType: ${payType}\nInvoice: ${payInvoiceNumber}\nAmount: ${payAmount}`
    );

    setPayInvoiceNumber("");
    setPayAmount("");
  };

  const validateRowOptionalSections = (r, idx1) => {
    // If they say YES, require complete info (no partials).
    if (r.hasInsurance) {
      if (!allFilled(r.insurance)) {
        alert(
          `Row ${idx1}: Third-party insurance is set to YES, but the section is incomplete. Please complete ALL fields or switch it to NO.`
        );
        return false;
      }
    }

    if (r.hasAttorney) {
      if (!allFilled(r.attorney)) {
        alert(
          `Row ${idx1}: Attorney is set to YES, but the section is incomplete. Please complete ALL fields or switch it to NO.`
        );
        return false;
      }
    }

    return true;
  };

  const onSubmitRequest = (e) => {
    e.preventDefault();

    // Provider required fields
    const providerRequired = [
      provider.providerName,
      provider.contactName,
      provider.practiceName,
      provider.practiceAddress,
      provider.lienPhone,
      provider.lienEmail,
    ];
    if (providerRequired.some(isBlank)) {
      alert("Please complete all required Provider / Practice fields.");
      return;
    }

    // Bulk rows required fields
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const idx1 = i + 1;

      if (isBlank(r.patientFirst) || isBlank(r.patientLast)) {
        alert(`Row ${idx1}: Patient first and last name are required.`);
        return;
      }
      if (isBlank(r.dob)) {
        alert(`Row ${idx1}: DOB is required.`);
        return;
      }
      if (isBlank(r.dateOfServiceFrom)) {
        alert(`Row ${idx1}: DOS From is required.`);
        return;
      }
      if (requestType !== "release" && isBlank(r.totalCharges)) {
        alert(`Row ${idx1}: Total Charges is required for New Lien Filing.`);
        return;
      }
      if (isBlank(r.county)) {
        alert(`Row ${idx1}: County is required.`);
        return;
      }

      if (!validateRowOptionalSections(r, idx1)) return;
    }

    const payload = {
      requestType,
      mailing: {
        method: mailingMethod,
        recipientCount: mailingRecipientCount,
        postageEstimatePerPiece: mailingPostageEstimate,
        handlingFeePerPiece: MAIL_HANDLING_FEE[mailingMethod] || 0,
        estimatedMailingTotal: mailingEstimate,
        standardIncluded: mailingMethod === "standard",
      },
      provider,
      rows,
      totals: { baseFee, rowTotals, grandTotal },
      files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
      submittedAt: new Date().toISOString(),
    };

    console.log("MedLien Pros submission payload:", payload);

    alert(
      `Thanks! Your ${requestType === "release" ? "Release" : "New Lien"} request was submitted for processing.\n\nTotal: ${money(
        grandTotal
      )}`
    );

    setProvider({
      providerName: "",
      contactName: "",
      practiceName: "",
      practiceAddress: "",
      fax: "",
      lienPhone: "",
      lienEmail: "",
    });
    setRows([emptyRow()]);
    setFiles([]);
    setMailingMethod("standard");
    setMailingPostageEstimate(0);
    setMailingRecipientCount(requestType === "release" ? 0 : 2);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top bar */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-sm">
          <div className="flex flex-wrap items-center gap-3 text-slate-600">
            <span className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4" /> {BRAND.phone}
            </span>
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4" /> {BRAND.email}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Pill>{BRAND.serviceArea}</Pill>
            <Pill>Filing-only admin service</Pill>
            <Pill>Medical liens only</Pill>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <img
                src={LOGO_SRC}
                alt={`${BRAND.name} logo`}
                className="h-12 w-12 object-contain"
              />
            </div>
            <div>
              <div className="text-sm font-semibold leading-none">{BRAND.name}</div>
              <div className="text-xs text-slate-600">{BRAND.tagline}</div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <NavLink href="#services">Services</NavLink>
            <NavLink href="#process">Process</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="#pay">Pay Online</NavLink>
            <NavLink href="#request">Patient Requests</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#request"
              className="hidden rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 md:inline-flex"
            >
              Start a Request
            </a>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50 md:hidden"
              aria-label="Toggle menu"
            >
              Menu
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="border-t border-slate-200 bg-white md:hidden">
            <div className="mx-auto max-w-6xl px-4 py-3">
              <div className="grid gap-3">
                <NavLink href="#services">Services</NavLink>
                <NavLink href="#process">Process</NavLink>
                <NavLink href="#pricing">Pricing</NavLink>
                <NavLink href="#pay">Pay Online</NavLink>
                <NavLink href="#request">Patient Requests</NavLink>
                <NavLink href="#faq">FAQ</NavLink>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-slate-200/60 blur-3xl" />
          <div className="absolute -bottom-40 right-10 h-[520px] w-[520px] rounded-full bg-slate-200/50 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid items-center gap-10 md:grid-cols-2"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Pill>Medical liens only</Pill>
                <Pill>PI cases</Pill>
                <Pill>Arizona statewide</Pill>
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
                Administrative lien filing & release support — built for speed and tracking.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
                Submit one or 100 patient requests in one intake. Add third‑party insurance and attorney information per patient when available.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="#request"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                  Submit a request <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#pay"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                >
                  Pay online <CreditCard className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-6 grid gap-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Bulk-friendly intake
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Optional certified mailing upgrade
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Clear totals and tracking
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Typical turnaround</div>
                  <div className="mt-1 text-sm text-slate-600">
                    Standard: {PRICING.standardTurnaround} • Rush: {PRICING.rushTurnaround}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5" />
                    <div>
                      <div className="text-sm font-semibold text-slate-900">For providers & facilities</div>
                      <div className="mt-1 text-sm text-slate-600">
                        Upload patient details and supporting docs. We prep and submit filings based on your info.
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5" />
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Bulk requests</div>
                      <div className="mt-1 text-sm text-slate-600">
                        Add third‑party insurance and attorney info per patient when available (no partial entries).
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4" />
                  <p>
                    This site is a demo build. Before launch, connect payments (Stripe) and submissions (API + database) and add your compliance copy.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <Section
        id="services"
        eyebrow="What we do"
        title="Lien filing and release support"
        subtitle="Administrative document prep, recording submission, and tracking. We do not provide legal advice."
      >
        <div className="grid gap-5 md:grid-cols-3">
          <Card icon={Stamp} title="New lien filing">
            Intake → prepare → submit for recording with your information.
          </Card>
          <Card icon={BadgeCheck} title="Lien release filing">
            Prepare and submit releases upon provider authorization.
          </Card>
          <Card icon={Send} title="Mailing & proof tracking">
            Standard mailing is included. Certified options are available as an upgrade.
          </Card>
        </div>
      </Section>

      {/* Process */}
      <Section
        id="process"
        eyebrow="How it works"
        title="Simple, repeatable process"
        subtitle="Designed to keep requests moving while staying organized."
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {processSteps.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{s.title}</div>
                  <div className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Pricing */}
      <Section
        id="pricing"
        eyebrow="Transparent pricing"
        title="Flat fees per request"
        subtitle="County recording fees and optional certified mail costs are pass-through at cost."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {[{
            title: "New Lien Filing",
            price: PRICING.file,
            text: "Per patient request. Standard mailing included.",
          }, {
            title: "Lien Release",
            price: PRICING.release,
            text: "Per patient request. No statutory notice required.",
          }, {
            title: "Rush add-on",
            price: PRICING.rush,
            text: "Optional per request when feasible.",
          }].map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="text-sm font-semibold text-slate-900">{p.title}</div>
              <div className="mt-3 flex items-end justify-between">
                <div className="text-3xl font-semibold">{money(p.price)}</div>
                <div className="text-xs text-slate-500">per request</div>
              </div>
              <p className="mt-3 text-sm text-slate-600">{p.text}</p>
              <a
                href="#request"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Start <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Pass-through costs</div>
          <p className="mt-2 text-sm text-slate-600">
            County recording fees and certified mail costs (if used) are billed at cost.
          </p>
        </div>
      </Section>

      {/* Pay Online */}
      <Section
        id="pay"
        eyebrow="Payments"
        title="Pay online"
        subtitle="Pay an invoice for liens filed or lien releases."
      >
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <form onSubmit={onPayOnline} className="grid gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Invoice type</label>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPayType("liens_filed")}
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm ${
                      payType === "liens_filed"
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" /> Pay for Liens Filed
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayType("releases")}
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm ${
                      payType === "releases"
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" /> Pay for Releases
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Invoice number <span className="text-rose-600">*</span>
                  </label>
                  <input
                    required
                    value={payInvoiceNumber}
                    onChange={(e) => setPayInvoiceNumber(e.target.value)}
                    className={inputBase}
                    placeholder="INV-2026-0012"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Amount <span className="text-rose-600">*</span>
                  </label>
                  <input
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className={inputBase}
                    placeholder="$150.00"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                Continue to Payment <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-xs text-slate-500">
                Secure payment powered by your processor (Stripe). This demo shows the required invoice number capture for internal tracking.
              </p>
            </form>
          </div>

          <div className="lg:col-span-2 grid gap-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Billing address</div>
              <div className="mt-3 text-sm text-slate-600">
                {BRAND.addressLines.map((l) => (
                  <div key={l}>{l}</div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Need help?</div>
              <p className="mt-2 text-sm text-slate-600">
                Include your invoice number in your message and we’ll assist.
              </p>
              <div className="mt-3 grid gap-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> {BRAND.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> {BRAND.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Patient Requests */}
      <Section
        id="request"
        eyebrow="Bulk submission"
        title="Patient Requests (Bulk Submission)"
        subtitle="Choose new lien filing or lien release. Add multiple patients and optional rush per row."
      >
        <div className="grid gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">Request type</div>
                <p className="mt-1 text-sm text-slate-600">Select what you need us to file.</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setRequestTypeSafe("new_lien")}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm ${
                    requestType === "new_lien"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Stamp className="h-4 w-4" /> New Lien Filing
                </button>
                <button
                  type="button"
                  onClick={() => setRequestTypeSafe("release")}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm ${
                    requestType === "release"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <BadgeCheck className="h-4 w-4" /> Lien Release Filing
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="font-semibold">Pricing summary</div>
              <div className="mt-1">
                Base fee per request: <span className="font-semibold">{money(baseFee)}</span> • Optional rush add‑on per request:{" "}
                <span className="font-semibold">{money(PRICING.rush)}</span>
              </div>
              <div className="mt-1 text-xs text-slate-600">
                Standard first‑class mailing for notices is included in the base fee. Certified options are an optional upgrade billed as pass‑through USPS postage at cost plus a handling fee.
              </div>
            </div>
          </div>

          <form onSubmit={onSubmitRequest} className="grid gap-6">
            {/* Mailing method */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Mailing method for notices</div>
              <p className="mt-1 text-sm text-slate-600">
                Standard first‑class mailing is included. Select Certified only if you want the optional best‑practice upgrade.
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setMailingMethod("standard")}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm ${
                    mailingMethod === "standard"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  Standard (Included)
                </button>
                <button
                  type="button"
                  onClick={() => setMailingMethod("certified")}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm ${
                    mailingMethod === "certified"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  Certified (+$5/pc + USPS)
                </button>
                <button
                  type="button"
                  onClick={() => setMailingMethod("certified_rr")}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm ${
                    mailingMethod === "certified_rr"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  Certified + RR (+$7/pc + USPS)
                </button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Number of recipients to mail</label>
                  <input
                    inputMode="numeric"
                    value={mailingRecipientCount}
                    onChange={(e) => setMailingRecipientCount(e.target.value)}
                    className={inputBase}
                    placeholder={requestType === "release" ? "0" : "2"}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    {requestType === "release"
                      ? "Releases do not require statutory notice; set recipients to 0 unless you want courtesy copies mailed."
                      : "Common statutory recipients may include patient and at‑fault/insurer/attorney addresses as applicable."}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Estimated USPS postage per piece</label>
                  <input
                    inputMode="decimal"
                    value={mailingPostageEstimate}
                    onChange={(e) => setMailingPostageEstimate(e.target.value)}
                    className={inputBase}
                    placeholder="0.68"
                    disabled={mailingMethod === "standard"}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Used for estimate only. Standard mailing included.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-semibold text-slate-700">Estimated mailing total</div>
                  <div className="mt-2 text-xl font-semibold text-slate-900">{money(mailingEstimate)}</div>
                  <div className="mt-1 text-xs text-slate-600">
                    Handling: {money(MAIL_HANDLING_FEE[mailingMethod] || 0)}/pc
                  </div>
                </div>
              </div>
            </div>

            {/* Provider info */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Provider / Practice</div>
              <p className="mt-1 text-sm text-slate-600">Required for processing and status updates.</p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Provider name <span className="text-rose-600">*</span></label>
                  <input
                    value={provider.providerName}
                    onChange={(e) => setProvider((p) => ({ ...p, providerName: e.target.value }))}
                    className={inputBase}
                    placeholder="Provider Name"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Contact name <span className="text-rose-600">*</span></label>
                  <input
                    value={provider.contactName}
                    onChange={(e) => setProvider((p) => ({ ...p, contactName: e.target.value }))}
                    className={inputBase}
                    placeholder="Lien/Records Contact"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Practice name <span className="text-rose-600">*</span></label>
                  <input
                    value={provider.practiceName}
                    onChange={(e) => setProvider((p) => ({ ...p, practiceName: e.target.value }))}
                    className={inputBase}
                    placeholder="Facility / Practice"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Fax</label>
                  <input
                    value={provider.fax}
                    onChange={(e) => setProvider((p) => ({ ...p, fax: e.target.value }))}
                    className={inputBase}
                    placeholder="(000) 000-0000"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Practice address <span className="text-rose-600">*</span></label>
                  <input
                    value={provider.practiceAddress}
                    onChange={(e) => setProvider((p) => ({ ...p, practiceAddress: e.target.value }))}
                    className={inputBase}
                    placeholder="Street, City, State ZIP"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Lien phone <span className="text-rose-600">*</span></label>
                  <input
                    value={provider.lienPhone}
                    onChange={(e) => setProvider((p) => ({ ...p, lienPhone: e.target.value }))}
                    className={inputBase}
                    placeholder="(000) 000-0000"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Lien email <span className="text-rose-600">*</span></label>
                  <input
                    value={provider.lienEmail}
                    onChange={(e) => setProvider((p) => ({ ...p, lienEmail: e.target.value }))}
                    className={inputBase}
                    placeholder="email@practice.com"
                  />
                </div>
              </div>
            </div>

            {/* Bulk rows */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Patients</div>
                  <p className="mt-1 text-sm text-slate-600">
                    Add up to 100 rows. Per patient, you can optionally add third‑party insurance and/or attorney information.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setRows((rs) => (rs.length >= 100 ? rs : [...rs, emptyRow()]))
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" /> Add patient
                </button>
              </div>

              <div className="mt-6 grid gap-6">
                {rows.map((r, idx) => {
                  const idx1 = idx + 1;

                  const setRow = (patch) =>
                    setRows((rs) =>
                      rs.map((row, i) => (i === idx ? { ...row, ...patch } : row))
                    );

                  const setInsurance = (patch) =>
                    setRows((rs) =>
                      rs.map((row, i) =>
                        i === idx
                          ? { ...row, insurance: { ...row.insurance, ...patch } }
                          : row
                      )
                    );

                  const setAttorneyRow = (patch) =>
                    setRows((rs) =>
                      rs.map((row, i) =>
                        i === idx
                          ? { ...row, attorney: { ...row.attorney, ...patch } }
                          : row
                      )
                    );

                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-slate-900">
                          Patient {idx1}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                            {money(rowTotals[idx] || 0)}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setRows((rs) =>
                                rs.length <= 1 ? rs : rs.filter((_, i) => i !== idx)
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-100"
                            title="Remove patient"
                          >
                            <Trash2 className="h-4 w-4" /> Remove
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-xs font-semibold text-slate-700">Patient first name <span className="text-rose-600">*</span></label>
                          <input
                            value={r.patientFirst}
                            onChange={(e) => setRow({ patientFirst: e.target.value })}
                            className={inputBase}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-700">Patient last name <span className="text-rose-600">*</span></label>
                          <input
                            value={r.patientLast}
                            onChange={(e) => setRow({ patientLast: e.target.value })}
                            className={inputBase}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-700">DOB <span className="text-rose-600">*</span></label>
                          <input
                            type="date"
                            value={r.dob}
                            onChange={(e) => setRow({ dob: e.target.value })}
                            className={inputBase}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-700">Date of injury</label>
                          <input
                            type="date"
                            value={r.dateOfInjury}
                            onChange={(e) => setRow({ dateOfInjury: e.target.value })}
                            className={inputBase}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-700">DOS From <span className="text-rose-600">*</span></label>
                          <input
                            type="date"
                            value={r.dateOfServiceFrom}
                            onChange={(e) => setRow({ dateOfServiceFrom: e.target.value })}
                            className={inputBase}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-700">DOS To</label>
                          <input
                            type="date"
                            value={r.dateOfServiceTo}
                            onChange={(e) => setRow({ dateOfServiceTo: e.target.value })}
                            className={inputBase}
                            disabled={requestType === "release"}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            id={`ongoing_${idx}`}
                            type="checkbox"
                            checked={!!r.treatmentOngoing}
                            onChange={(e) => setRow({ treatmentOngoing: e.target.checked })}
                            className="h-4 w-4 rounded border-slate-300"
                            disabled={requestType === "release"}
                          />
                          <label
                            htmlFor={`ongoing_${idx}`}
                            className={`text-sm ${
                              requestType === "release" ? "text-slate-400" : "text-slate-700"
                            }`}
                          >
                            Continuing treatment
                          </label>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            id={`rush_${idx}`}
                            type="checkbox"
                            checked={!!r.rush}
                            onChange={(e) => setRow({ rush: e.target.checked })}
                            className="h-4 w-4 rounded border-slate-300"
                          />
                          <label htmlFor={`rush_${idx}`} className="text-sm text-slate-700">
                            Rush add‑on
                          </label>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-700">County filed <span className="text-rose-600">*</span></label>
                          <input
                            value={r.county}
                            onChange={(e) => setRow({ county: e.target.value })}
                            className={inputBase}
                            placeholder="Maricopa"
                          />
                        </div>

                        {requestType !== "release" ? (
                          <div>
                            <label className="text-xs font-semibold text-slate-700">Total charges <span className="text-rose-600">*</span></label>
                            <input
                              inputMode="decimal"
                              value={r.totalCharges}
                              onChange={(e) => setRow({ totalCharges: e.target.value })}
                              className={inputBase}
                              placeholder="1234.56"
                            />
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                            Releases: total charges not required.
                          </div>
                        )}

                        <div className="md:col-span-2">
                          <label className="text-xs font-semibold text-slate-700">Accident location</label>
                          <input
                            value={r.accidentLocation}
                            onChange={(e) => setRow({ accidentLocation: e.target.value })}
                            className={inputBase}
                            placeholder="City / intersection (optional)"
                            disabled={requestType === "release"}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-xs font-semibold text-slate-700">Notes</label>
                          <textarea
                            value={r.notes}
                            onChange={(e) => setRow({ notes: e.target.value })}
                            className={`${inputBase} min-h-[90px]`}
                            placeholder="Anything we should know (optional)"
                          />
                        </div>
                      </div>

                      {/* Optional Insurance + Attorney per patient */}
                      <div className="mt-5 grid gap-5 lg:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-slate-900">
                                Third-party insurance information (optional)
                              </div>
                              <p className="mt-1 text-xs text-slate-600">
                                Provide this section only if the information is known. No partial information allowed.
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setRows((rs) =>
                                    rs.map((row, i) =>
                                      i === idx
                                        ? {
                                            ...row,
                                            hasInsurance: false,
                                            insurance: emptyInsurance(),
                                          }
                                        : row
                                    )
                                  )
                                }
                                className={`rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm ${
                                  r.hasInsurance
                                    ? "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                                    : "border-slate-900 bg-slate-900 text-white"
                                }`}
                              >
                                No
                              </button>
                              <button
                                type="button"
                                onClick={() => setRow({ hasInsurance: true })}
                                className={`rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm ${
                                  r.hasInsurance
                                    ? "border-slate-900 bg-slate-900 text-white"
                                    : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                                }`}
                              >
                                Yes
                              </button>
                            </div>
                          </div>

                          {r.hasInsurance ? (
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                              <div>
                                <label className="text-xs font-semibold text-slate-700">Insurance Company Name</label>
                                <input
                                  value={r.insurance.companyName}
                                  onChange={(e) => setInsurance({ companyName: e.target.value })}
                                  className={inputBase}
                                  placeholder="Carrier Name"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                                <input
                                  value={r.insurance.phone}
                                  onChange={(e) => setInsurance({ phone: e.target.value })}
                                  className={inputBase}
                                  placeholder="(000) 000-0000"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-slate-700">Address</label>
                                <input
                                  value={r.insurance.address}
                                  onChange={(e) => setInsurance({ address: e.target.value })}
                                  className={inputBase}
                                  placeholder="Street, City, State ZIP"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-slate-700">Policy Number</label>
                                <input
                                  value={r.insurance.policyNumber}
                                  onChange={(e) => setInsurance({ policyNumber: e.target.value })}
                                  className={inputBase}
                                  placeholder="Policy #"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-slate-700">Adjuster Name</label>
                                <input
                                  value={r.insurance.adjusterName}
                                  onChange={(e) => setInsurance({ adjusterName: e.target.value })}
                                  className={inputBase}
                                  placeholder="Adjuster Name"
                                />
                              </div>
                            </div>
                          ) : null}
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-slate-900">Attorney information (optional)</div>
                              <p className="mt-1 text-xs text-slate-600">
                                Provide this section only if the information is known. No partial information allowed.
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setRows((rs) =>
                                    rs.map((row, i) =>
                                      i === idx
                                        ? {
                                            ...row,
                                            hasAttorney: false,
                                            attorney: emptyAttorney(),
                                          }
                                        : row
                                    )
                                  )
                                }
                                className={`rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm ${
                                  r.hasAttorney
                                    ? "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                                    : "border-slate-900 bg-slate-900 text-white"
                                }`}
                              >
                                No
                              </button>
                              <button
                                type="button"
                                onClick={() => setRow({ hasAttorney: true })}
                                className={`rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm ${
                                  r.hasAttorney
                                    ? "border-slate-900 bg-slate-900 text-white"
                                    : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                                }`}
                              >
                                Yes
                              </button>
                            </div>
                          </div>

                          {r.hasAttorney ? (
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                              <div>
                                <label className="text-xs font-semibold text-slate-700">Attorney Name</label>
                                <input
                                  value={r.attorney.attorneyName}
                                  onChange={(e) => setAttorneyRow({ attorneyName: e.target.value })}
                                  className={inputBase}
                                  placeholder="Attorney Name"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-slate-700">Firm Name</label>
                                <input
                                  value={r.attorney.firmName}
                                  onChange={(e) => setAttorneyRow({ firmName: e.target.value })}
                                  className={inputBase}
                                  placeholder="Law Firm"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                                <input
                                  value={r.attorney.phone}
                                  onChange={(e) => setAttorneyRow({ phone: e.target.value })}
                                  className={inputBase}
                                  placeholder="(000) 000-0000"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-slate-700">Address</label>
                                <input
                                  value={r.attorney.address}
                                  onChange={(e) => setAttorneyRow({ address: e.target.value })}
                                  className={inputBase}
                                  placeholder="Street, City, State ZIP"
                                />
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">Estimated total</div>
                    <div className="mt-1 text-xs text-slate-600">
                      Sum of all patient requests + mailing estimate.
                    </div>
                  </div>
                  <div className="text-2xl font-semibold text-slate-900">{money(grandTotal)}</div>
                </div>
              </div>
            </div>

            {/* File upload */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Supporting documents (optional)</div>
              <p className="mt-1 text-sm text-slate-600">
                Upload any relevant documents (e.g., signed authorization, itemized statement). Files are not actually uploaded in this demo.
              </p>
              <input
                type="file"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="mt-4 block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
              />
              {files.length ? (
                <div className="mt-4 grid gap-2 text-sm text-slate-600">
                  {files.map((f) => (
                    <div key={f.name} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="truncate">{f.name}</span>
                      <span className="text-xs text-slate-500">{Math.round(f.size / 1024)} KB</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Submit */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                Submit request <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-3 text-xs text-slate-500">
                By submitting, you confirm you have authorization to request these filings and that any optional insurance/attorney sections are complete when provided.
              </p>
            </div>
          </form>
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" eyebrow="Questions" title="FAQ" subtitle="Common questions we get from facilities and providers.">
        <div className="grid gap-5 md:grid-cols-2">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">{f.q}</div>
              <div className="mt-2 text-sm leading-relaxed text-slate-600">{f.a}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">{BRAND.name}</div>
              <div className="mt-2 text-sm text-slate-600">{BRAND.tagline}</div>
              <div className="mt-4 grid gap-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> {BRAND.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> {BRAND.email}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {BRAND.addressLines.join(", ")}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-900">Quick links</div>
              <div className="mt-3 grid gap-2 text-sm">
                <NavLink href="#services">Services</NavLink>
                <NavLink href="#pricing">Pricing</NavLink>
                <NavLink href="#pay">Pay Online</NavLink>
                <NavLink href="#request">Patient Requests</NavLink>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-900">Disclaimer</div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                MedLien Pros provides administrative filing support only and does not provide legal advice. For legal questions, consult qualified counsel.
              </p>
            </div>
          </div>

          <div className="mt-10 text-xs text-slate-500">
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
