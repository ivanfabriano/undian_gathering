"use client";

import confetti from "canvas-confetti";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Download,
  Gift,
  PartyPopper,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useRaffle } from "@/context/raffle-context";
import { playShuffleSound, playWinSound } from "@/lib/sound";
import type { Participant, Prize } from "@/lib/types";
import { PageDecorations } from "./decorations";
import { EventHeader } from "./event-header";
import { PrizeVisual } from "./prize-visual";

export function PrizeDraw({ prize }: { prize: Prize }) {
  const {
    participants,
    winners,
    winnersForPrize,
    eligibleCount,
    drawWinners,
    prizeQuantity,
    ready,
  } = useRaffle();
  const [drawing, setDrawing] = useState(false);
  const [rollingName, setRollingName] = useState("Siap untuk diundi");
  const [newWinners, setNewWinners] = useState<Participant[]>([]);
  const [newWinnerStart, setNewWinnerStart] = useState(0);
  const timers = useRef<number[]>([]);
  const existingWinners = winnersForPrize(prize.id);
  const quantity = prizeQuantity(prize.id);
  const remaining = Math.max(0, quantity - existingWinners.length);
  const available = eligibleCount(prize.eligibility, prize.requiredDepartment);
  const complete = remaining === 0;
  const normalizedDepartment = prize.requiredDepartment
    ?.trim()
    .toLocaleLowerCase("id-ID");
  const simulationWinnerNames = prize.simulationWinnerNames ?? [];
  const simulationWinnersAvailable = simulationWinnerNames.every((name) => {
    const normalizedName = name.trim().toLocaleLowerCase("id-ID");
    return participants.some(
      (participant) =>
        participant.name.trim().toLocaleLowerCase("id-ID") === normalizedName &&
        prize.eligibility.includes(participant.type) &&
        (!normalizedDepartment ||
          participant.department?.trim().toLocaleLowerCase("id-ID") ===
            normalizedDepartment) &&
        !winners.some((winner) => winner.participantId === participant.id),
    );
  });

  const eligibleNames = useMemo(
    () =>
      participants
        .filter(
          (participant) =>
            prize.eligibility.includes(participant.type) &&
            (!normalizedDepartment ||
              participant.department?.trim().toLocaleLowerCase("id-ID") ===
                normalizedDepartment),
        )
        .map((participant) => participant.name),
    [normalizedDepartment, participants, prize.eligibility],
  );

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const launchConfetti = () => {
    const colors = ["#f6bd4b", "#dc6b26", "#8f1d1d", "#fff0b5"];
    confetti({
      particleCount: 130,
      spread: 85,
      origin: { y: 0.62 },
      colors,
      scalar: 1.05,
    });
    timers.current.push(
      window.setTimeout(
        () =>
          confetti({
            particleCount: 80,
            angle: 60,
            spread: 65,
            origin: { x: 0 },
            colors,
          }),
        250,
      ),
    );
    timers.current.push(
      window.setTimeout(
        () =>
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 65,
            origin: { x: 1 },
            colors,
          }),
        350,
      ),
    );
  };

  const beginDraw = () => {
    if (
      drawing ||
      complete ||
      !participants.length ||
      available < remaining ||
      !simulationWinnersAvailable
    )
      return;
    setDrawing(true);
    setNewWinners([]);
    setNewWinnerStart(existingWinners.length);
    playShuffleSound();

    const interval = window.setInterval(() => {
      const name =
        eligibleNames[Math.floor(Math.random() * eligibleNames.length)] ??
        "Golden Hours";
      setRollingName(name);
      playShuffleSound();
    }, 240);

    const finishTimer = window.setTimeout(() => {
      window.clearInterval(interval);
      const selected = drawWinners(
        prize.id,
        prize.eligibility,
        remaining,
        simulationWinnerNames,
        prize.requiredDepartment,
      );
      setNewWinners(selected);
      setRollingName(
        selected.length === 1
          ? selected[0].name
          : `${selected.length} pemenang terpilih!`,
      );
      setDrawing(false);
      if (selected.length) {
        playWinSound();
        launchConfetti();
      }
    }, 3200);
    timers.current.push(finishTimer);
  };

  const notEnough =
    participants.length > 0 && available < remaining && !complete;

  const downloadWinnersImage = () => {
    const width = 1200;
    const rowHeight = 92;
    const height = 390 + existingWinners.length * rowHeight;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return;

    const background = context.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, "#fff8e8");
    background.addColorStop(1, "#f3dfad");
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    context.fillStyle = "#8f1d1d";
    context.fillRect(0, 0, 24, height);
    context.fillStyle = "#6f1717";
    context.font = "700 24px Arial, sans-serif";
    context.fillText("GATHERING SBU HIMPM 2026", 72, 74);
    context.fillStyle = "#24170f";
    context.font = "700 52px Georgia, serif";
    context.fillText(`Pemenang ${prize.name}`, 72, 142);
    context.fillStyle = "#6b5749";
    context.font = "400 22px Arial, sans-serif";
    context.fillText(
      `${existingWinners.length} pemenang · Disimpan ${new Date().toLocaleString("id-ID")}`,
      72,
      184,
    );

    context.strokeStyle = "rgba(143, 29, 29, 0.22)";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(72, 218);
    context.lineTo(width - 72, 218);
    context.stroke();

    existingWinners.forEach((winner, index) => {
      const top = 252 + index * rowHeight;
      context.fillStyle =
        index % 2 === 0
          ? "rgba(255, 255, 255, 0.68)"
          : "rgba(255, 255, 255, 0.38)";
      context.beginPath();
      context.roundRect(72, top, width - 144, 72, 14);
      context.fill();

      context.fillStyle = "#8f1d1d";
      context.font = "700 24px Arial, sans-serif";
      context.fillText(String(index + 1).padStart(2, "0"), 98, top + 45);
      context.fillStyle = "#24170f";
      context.font = "700 25px Arial, sans-serif";
      context.fillText(winner.name, 160, top + 31);
      context.fillStyle = "#6b5749";
      context.font = "400 18px Arial, sans-serif";
      const detail = `${winner.employeeId}${winner.department ? ` · ${winner.department}` : ""}`;
      context.fillText(detail, 160, top + 57);
    });

    context.fillStyle = "#8f1d1d";
    context.font = "italic 700 20px Georgia, serif";
    context.fillText("Same People, Brighter Journeys", 72, height - 45);

    const link = document.createElement("a");
    const safePrizeName = prize.shortName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    link.download = `pemenang-${safePrizeName || prize.id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <main className="draw-page">
      <PageDecorations />
      <div className="draw-glow" />
      <div className="page-shell draw-content">
        <EventHeader back />

        <section className="draw-hero">
          <div className="draw-prize-info">
            <span className="eyebrow">
              <Gift size={14} /> HADIAH UNDIAN
            </span>
            <h2>{prize.name}</h2>
            <p>{prize.description}</p>
            <div className="draw-badges">
              <span>
                <Trophy size={15} /> {quantity} Pemenang
              </span>
            </div>
          </div>
          <div className="draw-visual-wrap">
            {prize.tone === "grand" && (
              <span className="main-prize-ribbon">HADIAH UTAMA</span>
            )}
            <PrizeVisual prize={prize} />
          </div>
        </section>

        <section
          className={`raffle-stage ${drawing ? "is-drawing" : ""} ${newWinners.length ? "has-result" : ""}`}
        >
          <div className="stage-ornament">
            <span>✦</span>
            <i />
            <span>✦</span>
          </div>
          {drawing ? (
            <>
              <span className="stage-label">SEDANG MENGOCOK...</span>
              <div className="rolling-window">
                <b>{rollingName}</b>
              </div>
              <div className="shuffle-dots">
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <p>Mencari {remaining} pemenang terbaik malam ini</p>
            </>
          ) : newWinners.length ? (
            <>
              <span className="stage-label stage-label--win">
                <PartyPopper size={16} /> SELAMAT KEPADA
              </span>
              <h3 className="result-title">{rollingName}</h3>
              <div
                className={`new-winner-grid ${newWinners.length === 1 ? "is-single" : ""}`}
              >
                {newWinners.map((winner, index) => (
                  <div
                    className="winner-chip is-new"
                    key={winner.id}
                    style={
                      {
                        "--winner-delay": `${index * 70}ms`,
                      } as React.CSSProperties
                    }
                  >
                    <span>{index + newWinnerStart + 1}</span>
                    <div>
                      <b>{winner.name}</b>
                      <small>
                        {winner.employeeId}
                        {winner.department ? ` · ${winner.department}` : ""}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
              <p>Hadiah ini resmi menjadi milik para pemenang. Selamat!</p>
            </>
          ) : complete ? (
            <>
              <CheckCircle2 size={42} className="complete-icon" />
              <span className="stage-label stage-label--win">
                UNDIAN SELESAI
              </span>
              <h3 className="result-title">Semua pemenang telah terpilih</h3>
              <p>Kategori hadiah ini telah selesai diundi.</p>
            </>
          ) : (
            <>
              <Sparkles size={36} className="ready-icon" />
              <span className="stage-label">SIAP DIUNDI</span>
              <h3>
                {remaining > 1
                  ? `${remaining} pemenang dalam sekali kocok`
                  : "Satu nama, satu momen istimewa"}
              </h3>
              <p>Pastikan seluruh peserta sudah siap sebelum memulai undian.</p>
            </>
          )}

          {!complete && !newWinners.length && (
            <button
              className="draw-button"
              onClick={beginDraw}
              disabled={
                drawing ||
                !ready ||
                !participants.length ||
                notEnough ||
                !simulationWinnersAvailable
              }
            >
              <span className="draw-button-shine" />
              {drawing ? (
                "Sedang Mengocok..."
              ) : (
                <>
                  <Sparkles size={20} /> Kocok Sekarang
                </>
              )}
            </button>
          )}

          {!participants.length && ready && (
            <p className="stage-warning">
              Database peserta belum tersedia.{" "}
              <Link href="/">Unggah Excel di halaman utama.</Link>
            </p>
          )}
          {notEnough && (
            <p className="stage-warning">
              Peserta yang memenuhi syarat hanya {available}, sedangkan masih
              dibutuhkan {remaining} pemenang.
            </p>
          )}
        </section>

        {existingWinners.length > 0 && (
          <section className="winner-history">
            <div className="section-heading">
              <div>
                <span className="eyebrow">HASIL UNDIAN</span>
                <h3>Daftar Pemenang</h3>
              </div>
              <div className="winner-history-actions">
                <span className="winner-count">
                  {existingWinners.length}/{quantity} terpilih
                </span>
                <button
                  type="button"
                  className="reset-button reset-button--compact"
                  onClick={downloadWinnersImage}
                >
                  <Download size={14} /> Simpan Gambar
                </button>
              </div>
            </div>
            <div className="winner-list">
              {existingWinners.map((winner, index) => (
                <div className="winner-row" key={`${winner.id}-${index}`}>
                  <span className="winner-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="winner-avatar">
                    {winner.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="winner-identity">
                    <b>{winner.name}</b>
                    <small>
                      {winner.employeeId}
                      {winner.department ? ` · ${winner.department}` : ""}
                    </small>
                  </div>
                  <CheckCircle2 size={20} />
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="draw-footer">
          Same People, <em>Brighter Journeys</em>
        </footer>
      </div>
    </main>
  );
}
