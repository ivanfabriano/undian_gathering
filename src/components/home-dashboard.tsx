"use client";

import Link from "next/link";
import { useState } from "react";
import { Database, RotateCcw, Settings, Sparkles } from "lucide-react";
import { useRaffle } from "@/context/raffle-context";
import { PRIZES } from "@/lib/prizes";
import { PageDecorations } from "./decorations";
import { EventHeader } from "./event-header";
import { ParticipantManager } from "./participant-manager";
import { PrizeVisual } from "./prize-visual";

export function HomeDashboard() {
    const { participants, winners, winnersForPrize, prizeQuantity, resetDraws, ready } = useRaffle();
    const [managerOpen, setManagerOpen] = useState(false);
    const handleReset = () => {
        if (!winners.length) return;
        if (window.confirm("Reset seluruh hasil undian? Database peserta tetap tersimpan.")) resetDraws();
    };

    return (
        <main className="home-page">
            <PageDecorations mountains />
            <div className="page-shell home-content">
                <EventHeader />

                <section className="hero-copy">
                    <span className="eyebrow"><Sparkles size={14} /> MALAM PENUH KEJUTAN</span>
                    <h2>Doorprize Gala Dinner <em>Gathering HMPM 2026</em></h2>
                    <p>Saksikan pengundian secara langsung dan dapatkan berbagai hadiah menarik!</p>
                </section>

                <section className="control-bar" aria-label="Kontrol database dan undian">
                    <button className="database-trigger" onClick={() => setManagerOpen(true)}>
                        <Database size={15} />
                        <span className={`status-dot ${participants.length ? "is-ready" : ""}`} />
                        {ready ? (participants.length ? `${participants.length} peserta` : "Unggah database") : "Memuat..."}
                    </button>
                    <Link href="/pengaturan-hadiah" className="database-trigger">
                        <Settings size={15} /> Atur Hadiah
                    </Link>
                    <button
                        className="reset-button reset-button--compact"
                        onClick={handleReset}
                        disabled={!winners.length}
                        title={winners.length ? "Reset seluruh hasil undian" : "Belum ada hasil undian"}
                    >
                        <RotateCcw size={14} /> Reset Undian
                    </button>
                </section>

                <section className="prize-section">
                    <div className="section-heading">
                        <div>
                            <span className="eyebrow">DAFTAR HADIAH</span>
                            <h3>Pilih Kategori Hadiah</h3>
                        </div>
                    </div>

                    <div className="prize-grid">
                        {PRIZES.map((prize, index) => {
                            const quantity = prizeQuantity(prize.id);
                            const won = winnersForPrize(prize.id).length;
                            const complete = won >= quantity;
                            return (
                                <Link
                                    key={prize.id}
                                    href={`/hadiah/${prize.id}`}
                                    className={`prize-card prize-card--${prize.tone} ${complete ? "is-complete" : ""}`}
                                    style={{ "--delay": `${index * 70}ms` } as React.CSSProperties}
                                >
                                    <div className="prize-card-topline">
                                        {prize.tone === "grand" && <span className="grand-badge">HADIAH UTAMA</span>}
                                    </div>
                                    <div className="card-visual"><PrizeVisual prize={prize} compact /></div>
                                    <div className="prize-card-body">
                                        <small>{String(index + 1).padStart(2, "0")}</small>
                                        <h4>{prize.shortName}</h4>
                                        <p>{quantity} Pemenang</p>
                                    </div>
                                    <div className="card-status">
                                        <span>{complete ? "Undian selesai" : won ? `${won} dari ${quantity} terpilih` : "Klik untuk mengundi"}</span>
                                        <i>{complete ? "✓" : "→"}</i>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                <footer className="home-footer">
                    <span>Same People, <em>Brighter Journeys</em></span>
                    <span>© 2026 SBU HIMPM</span>
                </footer>
            </div>
            <ParticipantManager open={managerOpen} onClose={() => setManagerOpen(false)} />
        </main>
    );
}
