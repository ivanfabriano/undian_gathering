import type { Prize } from "@/lib/types";

type PrizeVisualProps = {
    prize: Prize;
    compact?: boolean;
};

function GoPayVisual({ amount }: { amount: string }) {
    return (
        <div className="gopay-visual" aria-label={`Voucher GoPay ${amount}`}>
            <div className="gopay-orbit orbit-one" />
            <div className="gopay-orbit orbit-two" />
            <span className="gopay-logo">go<span>pay</span></span>
            <strong>Rp{amount}</strong>
            <small>saldo digital</small>
        </div>
    );
}

export function PrizeVisual({ prize, compact = false }: PrizeVisualProps) {
    if (prize.visual.startsWith("gopay")) {
        const amount = prize.visual === "gopay150" ? "150.000" : prize.visual === "gopay100" ? "100.000" : "50.000";
        return <GoPayVisual amount={amount} />;
    }

    return (
        <div className={`prize-art prize-art--${prize.visual} ${compact ? "prize-art--compact" : ""}`}>
            <svg viewBox="0 0 460 310" role="img" aria-label={prize.name}>
                <defs>
                    <linearGradient id={`gold-${prize.id}`} x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0" stopColor="#ffd777" />
                        <stop offset=".55" stopColor="#e98220" />
                        <stop offset="1" stopColor="#a52a18" />
                    </linearGradient>
                    <linearGradient id={`screen-${prize.id}`} x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0" stopColor="#ffb23f" />
                        <stop offset=".48" stopColor="#de3f22" />
                        <stop offset="1" stopColor="#4f1232" />
                    </linearGradient>
                    <filter id={`shadow-${prize.id}`} x="-20%" y="-20%" width="140%" height="160%">
                        <feDropShadow dx="0" dy="13" stdDeviation="9" floodColor="#6d2414" floodOpacity=".28" />
                    </filter>
                </defs>

                {prize.visual === "tv" && (
                    <g filter={`url(#shadow-${prize.id})`}>
                        <rect x="35" y="28" width="390" height="222" rx="12" fill="#261d1c" />
                        <rect x="47" y="40" width="366" height="198" rx="5" fill={`url(#screen-${prize.id})`} />
                        <path d="M48 205C115 130 150 210 215 110s105 68 197-36v164H48z" fill="#6d1734" opacity=".72" />
                        <path d="M48 145C130 95 169 182 252 76s99 72 160 14v148H48z" fill="#ff7c32" opacity=".48" />
                        <path d="M200 250h60l32 25H168z" fill="#2a211f" />
                        <path d="M166 277h128" stroke="#221a19" strokeWidth="10" strokeLinecap="round" />
                    </g>
                )}

                {prize.visual === "watch" && (
                    <g filter={`url(#shadow-${prize.id})`}>
                        <rect x="135" y="5" width="118" height="300" rx="57" fill="#24201f" />
                        <rect x="91" y="72" width="205" height="177" rx="48" fill="#171414" stroke="#4d4745" strokeWidth="7" />
                        <rect x="105" y="86" width="177" height="149" rx="36" fill={`url(#screen-${prize.id})`} />
                        <circle cx="194" cy="160" r="52" fill="none" stroke="#ffd269" strokeWidth="8" opacity=".9" />
                        <path d="M194 119v44l31 21" stroke="#fff4d2" strokeWidth="8" strokeLinecap="round" />
                        <circle cx="300" cy="143" r="12" fill="#25201f" />
                    </g>
                )}

                {prize.visual === "tumbler" && (
                    <g filter={`url(#shadow-${prize.id})`}>
                        <path d="M105 53h105l-10 219c-1 20-15 30-43 30s-42-10-43-30z" fill="#f5ead1" />
                        <rect x="99" y="33" width="117" height="48" rx="18" fill="#e4d5b7" />
                        <rect x="141" y="43" width="35" height="26" rx="8" fill="#c7b489" />
                        <path d="M235 53h105l-10 219c-1 20-15 30-43 30s-42-10-43-30z" fill="#264b68" />
                        <rect x="229" y="33" width="117" height="48" rx="18" fill="#173b57" />
                        <rect x="271" y="43" width="35" height="26" rx="8" fill="#092941" />
                        <text x="157" y="260" textAnchor="middle" fill="#8a7553" fontSize="14">LocknLock</text>
                        <text x="287" y="260" textAnchor="middle" fill="#dce9eb" fontSize="14">LocknLock</text>
                    </g>
                )}

                {prize.visual === "tws" && (
                    <g filter={`url(#shadow-${prize.id})`}>
                        <rect x="120" y="150" width="220" height="130" rx="55" fill="#faf7ef" stroke="#dfd8ca" strokeWidth="5" />
                        <path d="M125 178c32 35 178 35 210 0" fill="none" stroke="#ddd5c7" strokeWidth="5" />
                        <path d="M160 43c-37 0-51 25-51 52 0 39 27 48 53 38l18-7v74c0 24 39 24 39 0V91c0-31-22-48-59-48z" fill="#fffdf8" stroke="#ddd7cc" strokeWidth="5" />
                        <path d="M300 43c37 0 51 25 51 52 0 39-27 48-53 38l-18-7v74c0 24-39 24-39 0V91c0-31 22-48 59-48z" fill="#fffdf8" stroke="#ddd7cc" strokeWidth="5" />
                        <circle cx="202" cy="92" r="8" fill="#24211f" /><circle cx="258" cy="92" r="8" fill="#24211f" />
                        <circle cx="230" cy="231" r="5" fill="#66c889" />
                    </g>
                )}

                {prize.visual === "fan" && (
                    <g filter={`url(#shadow-${prize.id})`}>
                        <rect x="188" y="184" width="84" height="120" rx="35" fill="#f5e9d5" />
                        <circle cx="230" cy="126" r="103" fill="#f6ecd9" stroke="#dac9a9" strokeWidth="7" />
                        {Array.from({ length: 12 }).map((_, index) => (
                            <line key={index} x1="230" y1="41" x2="230" y2="210" stroke="#cbb895" strokeWidth="7" transform={`rotate(${index * 15} 230 126)`} />
                        ))}
                        <circle cx="230" cy="126" r="25" fill={`url(#gold-${prize.id})`} />
                        <circle cx="230" cy="235" r="12" fill="none" stroke="#bd9f70" strokeWidth="4" />
                    </g>
                )}
            </svg>
        </div>
    );
}
