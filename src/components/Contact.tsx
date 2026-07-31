"use client";

import { useState } from "react";

export function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="contact" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="glass glow overflow-hidden rounded-3xl">
          <div className="grid lg:grid-cols-2">
            <div className="bg-gradient-to-br from-indigo-600/20 to-violet-600/10 p-10 md:p-14">
              <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
                Contact
              </p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                Let&apos;s grow your brand
              </h2>
              <p className="mt-4 text-slate-400">
                Book a free 30-minute strategy call. No pitch deck — just
                honest advice on what will work for your business.
              </p>

              <div className="mt-10 space-y-4">
                <a
                  href="mailto:niravb68@gmail.com"
                  className="flex items-center gap-3 text-sm text-slate-300 transition hover:text-white"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                    ✉️
                  </span>
                  niravb68@gmail.com
                </a>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                    🌐
                  </span>
                  Available worldwide · Based in India
                </div>
              </div>
            </div>

            <div className="p-10 md:p-14">
              {submitted ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="text-5xl">🎉</span>
                  <h3 className="mt-4 text-xl font-semibold">Message received!</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    We&apos;ll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm text-slate-400">
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm text-slate-400">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
                      placeholder="you@company.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="service" className="mb-1.5 block text-sm text-slate-400">
                      Service interested in
                    </label>
                    <select
                      id="service"
                      name="service"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
                    >
                      <option value="seo">SEO & Content</option>
                      <option value="social">Social Media Marketing</option>
                      <option value="ads">Paid Advertising</option>
                      <option value="brand">Brand Strategy</option>
                      <option value="all">Full Package</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="mb-1.5 block text-sm text-slate-400">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
                      placeholder="Tell us about your goals..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
