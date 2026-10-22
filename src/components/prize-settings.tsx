"use client";

import { Minus, Plus, RotateCcw, SlidersHorizontal } from "lucide-react";
import { useRaffle } from "@/context/raffle-context";
import { PRIZES } from "@/lib/prizes";
import { PageDecorations } from "./decorations";
import { EventHeader } from "./event-header";
import { PrizeVisual } from "./prize-visual";

export function PrizeSettings() {
    const {
        prizeQuantities,
        winners,
        ready,
        setPrizeQuantity,
        resetPrizeQuantities,
    } = useRaffle();

    const winnerCounts = winners.reduce<Record<string, number>>((counts, winner) => {
        counts[winner.prizeId] = (counts[winner.prizeId] ?? 0) + 1;
        return counts;
    }, {});
    const totalPrizes = PRIZES.reduce(
        (total, prize) => total + (prizeQuantities[prize.id] ?? prize.quantity),
        0,
    );

    const handleReset = () => {
        if (window.confirm("Kembalikan semua jumlah hadiah ke nilai awal?")) resetPrizeQuantities();
    };

    return (
        <main className="settings-page">
            <PageDecorations />
            <div className="page-shell settings-content">
                <EventHeader back />

                <section className="settings-hero">
                    <span className="eyebrow"><SlidersHorizontal size={14} /> PENGATURAN HADIAH</span>
                    <h2>Atur Jumlah Pemenang</h2>
                    <p>Perubahan tersimpan otomatis di perangkat ini dan langsung berlaku pada dashboard serta proses undian.</p>
                    <div className="settings-summary">
                        <span><b>{totalPrizes}</b> Total Hadiah</span>
                        <button type="button" className="reset-button reset-button--compact" onClick={handleReset} disabled={!ready}>
                            <RotateCcw size={14} /> Reset Jumlah
                        </button>
                    </div>
                </section>

                <section className="settings-grid" aria-label="Daftar pengaturan jumlah hadiah">
                    {PRIZES.map((prize) => {
                        const quantity = prizeQuantities[prize.id] ?? prize.quantity;
                        const winnerCount = winnerCounts[prize.id] ?? 0;
                        const eligibilityLabel = prize.eligibility.length === 2 ? "NPP & NON NPP" : "Khusus NPP";

                        return (
                            <article className={`settings-card settings-card--${prize.tone}`} key={prize.id}>
                                <div className="settings-card-visual">
                                    <PrizeVisual prize={prize} compact />
                                </div>
                                <div className="settings-card-copy">
                                    <span>{eligibilityLabel}</span>
                                    <h3>{prize.shortName}</h3>
                                    <p>{winnerCount} pemenang sudah terpilih</p>
                                </div>
                                <div className="quantity-control">
                                    <button
                                        type="button"
                                        aria-label={`Kurangi jumlah ${prize.name}`}
                                        onClick={() => setPrizeQuantity(prize.id, quantity - 1)}
                                        disabled={!ready || quantity <= winnerCount}
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <label>
                                        <span>Jumlah</span>
                                        <input
                                            type="number"
                                            min={winnerCount}
                                            max={999}
                                            value={quantity}
                                            disabled={!ready}
                                            onChange={(event) => {
                                                const value = Math.min(999, Math.max(winnerCount, Number(event.target.value) || 0));
                                                setPrizeQuantity(prize.id, value);
                                            }}
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        aria-label={`Tambah jumlah ${prize.name}`}
                                        onClick={() => setPrizeQuantity(prize.id, Math.min(999, quantity + 1))}
                                        disabled={!ready || quantity >= 999}
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </section>

                <p className="settings-note">
                    Jumlah hadiah tidak dapat dibuat lebih kecil dari jumlah pemenang yang sudah terpilih. Reset hasil undian terlebih dahulu bila perlu menurunkannya.
                </p>
                <footer className="draw-footer">Same People, <em>Brighter Journeys</em></footer>
            </div>
        </main>
    );
}
