"use client";

import confetti from "canvas-confetti";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Gift, PartyPopper, Sparkles, Trophy } from "lucide-react";
import { useRaffle } from "@/context/raffle-context";
import { playShuffleSound, playWinSound } from "@/lib/sound";
import type { Participant, Prize } from "@/lib/types";
import { PageDecorations } from "./decorations";
import { EventHeader } from "./event-header";
import { PrizeVisual } from "./prize-visual";

export function PrizeDraw({ prize }: { prize: Prize }) {
    const { participants, winnersForPrize, eligibleCount, drawWinners, prizeQuantity, ready } = useRaffle();
    const [drawing, setDrawing] = useState(false);
    const [rollingName, setRollingName] = useState("Siap untuk diundi");
    const [newWinners, setNewWinners] = useState<Participant[]>([]);
    const [newWinnerStart, setNewWinnerStart] = useState(0);
    const timers = useRef<number[]>([]);
    const existingWinners = winnersForPrize(prize.id);
    const quantity = prizeQuantity(prize.id);
    const remaining = Math.max(0, quantity - existingWinners.length);
    const available = eligibleCount(prize.eligibility);
    const complete = remaining === 0;

    const eligibleNames = useMemo(
        () => participants
            .filter((participant) => prize.eligibility.includes(participant.type))
            .map((participant) => participant.name),
        [participants, prize.eligibility],
    );
    const eligibilityLabel = prize.eligibility.length === 2 ? "NPP & NON NPP" : "KHUSUS NPP";

    useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

    const launchConfetti = () => {
        const colors = ["#f6bd4b", "#dc6b26", "#8f1d1d", "#fff0b5"];
        confetti({ particleCount: 130, spread: 85, origin: { y: 0.62 }, colors, scalar: 1.05 });
        timers.current.push(window.setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 65, origin: { x: 0 }, colors }), 250));
        timers.current.push(window.setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 65, origin: { x: 1 }, colors }), 350));
    };

    const beginDraw = () => {
        if (drawing || complete || !participants.length || available < remaining) return;
        setDrawing(true);
        setNewWinners([]);
        setNewWinnerStart(existingWinners.length);
        playShuffleSound();

        const interval = window.setInterval(() => {
            const name = eligibleNames[Math.floor(Math.random() * eligibleNames.length)] ?? "Golden Hours";
            setRollingName(name);
            playShuffleSound();
        }, 240);

        const finishTimer = window.setTimeout(() => {
            window.clearInterval(interval);
            const selected = drawWinners(prize.id, prize.eligibility, remaining);
            setNewWinners(selected);
            setRollingName(selected.length === 1 ? selected[0].name : `${selected.length} pemenang terpilih!`);
            setDrawing(false);
            if (selected.length) {
                playWinSound();
                launchConfetti();
            }
        }, 3200);
        timers.current.push(finishTimer);
    };

    const notEnough = participants.length > 0 && available < remaining && !complete;

    return (
        <main className="draw-page">
            <PageDecorations />
            <div className="draw-glow" />
            <div className="page-shell draw-content">
                <EventHeader back />

                <section className="draw-hero">
                    <div className="draw-prize-info">
                        <span className="eyebrow"><Gift size={14} /> HADIAH UNDIAN</span>
                        <h2>{prize.name}</h2>
                        <p>{prize.description}</p>
                        <div className="draw-badges">
                            <span><Trophy size={15} /> {quantity} Pemenang</span>
                            <span>{eligibilityLabel}</span>
                        </div>
                    </div>
                    <div className="draw-visual-wrap">
                        {prize.tone === "grand" && <span className="main-prize-ribbon">HADIAH UTAMA</span>}
                        <PrizeVisual prize={prize} />
                    </div>
                </section>

                <section className={`raffle-stage ${drawing ? "is-drawing" : ""} ${newWinners.length ? "has-result" : ""}`}>
                    <div className="stage-ornament"><span>✦</span><i /><span>✦</span></div>
                    {drawing ? (
                        <>
                            <span className="stage-label">SEDANG MENGOCOK...</span>
                            <div className="rolling-window"><b>{rollingName}</b></div>
                            <div className="shuffle-dots"><i /><i /><i /><i /><i /></div>
                            <p>Mencari {remaining} pemenang terbaik malam ini</p>
                        </>
                    ) : newWinners.length ? (
                        <>
                            <span className="stage-label stage-label--win"><PartyPopper size={16} /> SELAMAT KEPADA</span>
                            <h3 className="result-title">{rollingName}</h3>
                            <div className={`new-winner-grid ${newWinners.length === 1 ? "is-single" : ""}`}>
                                {newWinners.map((winner, index) => (
                                    <div className="winner-chip is-new" key={winner.id} style={{ "--winner-delay": `${index * 70}ms` } as React.CSSProperties}>
                                        <span>{index + newWinnerStart + 1}</span>
                                        <div><b>{winner.name}</b><small>{winner.employeeId}{winner.department ? ` · ${winner.department}` : ""}</small></div>
                                    </div>
                                ))}
                            </div>
                            <p>Hadiah ini resmi menjadi milik para pemenang. Selamat!</p>
                        </>
                    ) : complete ? (
                        <>
                            <CheckCircle2 size={42} className="complete-icon" />
                            <span className="stage-label stage-label--win">UNDIAN SELESAI</span>
                            <h3 className="result-title">Semua pemenang telah terpilih</h3>
                            <p>Kategori hadiah ini telah selesai diundi.</p>
                        </>
                    ) : (
                        <>
                            <Sparkles size={36} className="ready-icon" />
                            <span className="stage-label">SIAP DIUNDI</span>
                            <h3>{remaining > 1 ? `${remaining} pemenang dalam sekali kocok` : "Satu nama, satu momen istimewa"}</h3>
                            <p>Pastikan seluruh peserta sudah siap sebelum memulai undian.</p>
                        </>
                    )}

                    {!complete && !newWinners.length && (
                        <button className="draw-button" onClick={beginDraw} disabled={drawing || !ready || !participants.length || notEnough}>
                            <span className="draw-button-shine" />
                            {drawing ? "Sedang Mengocok..." : <><Sparkles size={20} /> Kocok Sekarang</>}
                        </button>
                    )}

                    {!participants.length && ready && (
                        <p className="stage-warning">Database peserta belum tersedia. <Link href="/">Unggah Excel di halaman utama.</Link></p>
                    )}
                    {notEnough && (
                        <p className="stage-warning">Peserta yang memenuhi syarat hanya {available}, sedangkan masih dibutuhkan {remaining} pemenang.</p>
                    )}
                </section>

                {existingWinners.length > 0 && (
                    <section className="winner-history">
                        <div className="section-heading">
                            <div><span className="eyebrow">HASIL UNDIAN</span><h3>Daftar Pemenang</h3></div>
                            <span className="winner-count">{existingWinners.length}/{quantity} terpilih</span>
                        </div>
                        <div className="winner-list">
                            {existingWinners.map((winner, index) => (
                                <div className="winner-row" key={`${winner.id}-${index}`}>
                                    <span className="winner-number">{String(index + 1).padStart(2, "0")}</span>
                                    <div className="winner-avatar">{winner.name.charAt(0).toUpperCase()}</div>
                                    <div className="winner-identity"><b>{winner.name}</b><small>{winner.employeeId}{winner.department ? ` · ${winner.department}` : ""}</small></div>
                                    <CheckCircle2 size={20} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <footer className="draw-footer">Same People, <em>Brighter Journeys</em></footer>
            </div>
        </main>
    );
}
