export function LeafCorner({ position }: { position: "top-left" | "top-right" | "bottom-left" | "bottom-right" }) {
    return (
        <svg className={`leaf-corner leaf-corner--${position}`} viewBox="0 0 300 220" aria-hidden="true">
            <defs>
                <linearGradient id={`leaf-${position}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#6e1018" />
                    <stop offset=".5" stopColor="#b82e18" />
                    <stop offset="1" stopColor="#ef8d1e" />
                </linearGradient>
            </defs>
            <path d="M-20 18C65 38 132 82 214 180" fill="none" stroke="#8b2616" strokeWidth="7" />
            <g fill={`url(#leaf-${position})`}>
                <ellipse cx="23" cy="22" rx="37" ry="15" transform="rotate(18 23 22)" />
                <ellipse cx="65" cy="46" rx="42" ry="17" transform="rotate(-14 65 46)" />
                <ellipse cx="99" cy="68" rx="45" ry="18" transform="rotate(35 99 68)" />
                <ellipse cx="135" cy="96" rx="42" ry="17" transform="rotate(-18 135 96)" />
                <ellipse cx="169" cy="126" rx="42" ry="17" transform="rotate(44 169 126)" />
                <ellipse cx="198" cy="159" rx="38" ry="15" transform="rotate(-12 198 159)" />
                <ellipse cx="250" cy="18" rx="45" ry="17" transform="rotate(-16 250 18)" />
                <ellipse cx="205" cy="45" rx="43" ry="17" transform="rotate(31 205 45)" />
                <ellipse cx="154" cy="35" rx="39" ry="15" transform="rotate(-30 154 35)" />
            </g>
        </svg>
    );
}

export function MountainBackdrop() {
    return (
        <div className="mountain-backdrop" aria-hidden="true">
            <div className="sun-disc" />
            <svg viewBox="0 0 1600 430" preserveAspectRatio="none">
                <path d="M0 230 210 80 376 212 550 120 724 250 930 100 1130 235 1320 112 1600 260V430H0Z" fill="#e99547" opacity=".35" />
                <path d="M0 300 260 155 420 300 655 185 850 325 1080 177 1240 300 1430 198 1600 290V430H0Z" fill="#bd582d" opacity=".58" />
                <path d="M0 345 210 253 365 337 570 245 760 350 990 258 1190 342 1420 260 1600 330V430H0Z" fill="#70301f" opacity=".8" />
                <path d="M0 390c185-65 300 30 468-25 185-60 333 28 512-12 223-50 390 18 620-15v92H0Z" fill="#3f201a" />
            </svg>
        </div>
    );
}

export function PageDecorations({ mountains = false }: { mountains?: boolean }) {
    return (
        <>
            <LeafCorner position="top-left" />
            <LeafCorner position="top-right" />
            <LeafCorner position="bottom-left" />
            <LeafCorner position="bottom-right" />
            {mountains && <MountainBackdrop />}
        </>
    );
}
