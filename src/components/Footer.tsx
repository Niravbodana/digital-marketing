export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold">
              BD
            </span>
            <span className="font-semibold">Bodana Digital</span>
          </div>

          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Bodana Digital. All rights reserved.
          </p>

          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#services" className="hover:text-white">Services</a>
            <a href="#about" className="hover:text-white">About</a>
            <a href="#contact" className="hover:text-white">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
