const MARTIAL_ARTS = ['Brazilian Jiu-Jitsu', 'Karate', 'Muay Thai', 'MMA', 'Judo', 'Taekwondo', 'Boxing'];

export function TrustBar() {
  return (
    <section className="bg-[#F7F7F5] border-b border-[#E5E5E3] py-5 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Social proof */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0A0A0A] flex items-center justify-center shrink-0" style={{ borderRadius: '2px' }}>
            <span className="text-[#EF233C] font-serif font-bold text-sm">PN</span>
          </div>
          <div>
            <p className="text-xs font-medium text-[#0A0A0A]">Pantera Negra BJJ</p>
            <p className="text-xs text-[#6B7280]">São Paulo, Brasil — usa MatFlow</p>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-[#E5E5E3]" aria-hidden="true" />

        {/* Free badge */}
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#EF233C]" aria-hidden="true" />
          <span className="text-xs font-medium text-[#0A0A0A] font-mono">100% gratuito — siempre</span>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-[#E5E5E3]" aria-hidden="true" />

        {/* Disciplines marquee */}
        <div className="flex items-center gap-2 overflow-hidden max-w-xs">
          <span className="text-xs text-[#6B7280] shrink-0 font-mono">Para:</span>
          <div className="flex gap-4 text-xs text-[#6B7280] overflow-hidden">
            {MARTIAL_ARTS.slice(0, 4).map(art => (
              <span key={art} className="whitespace-nowrap">{art}</span>
            ))}
            <span className="text-[#EF233C] shrink-0">+{MARTIAL_ARTS.length - 4} más</span>
          </div>
        </div>
      </div>
    </section>
  );
}
