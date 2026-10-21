"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Download, FileSpreadsheet, Trash2, Upload, X } from "lucide-react";
import { useRaffle } from "@/context/raffle-context";
import { downloadTemplate, parseParticipantFile } from "@/lib/excel";

type ParticipantManagerProps = {
    open: boolean;
    onClose: () => void;
};

export function ParticipantManager({ open, onClose }: ParticipantManagerProps) {
    const { participants, setParticipants, clearParticipants } = useRaffle();
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const processFile = async (file?: File) => {
        if (!file) return;
        if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
            setMessage("Format tidak didukung. Gunakan XLSX, XLS, atau CSV.");
            return;
        }

        setLoading(true);
        setMessage("");
        try {
            const result = await parseParticipantFile(file);
            if (!result.participants.length) {
                setMessage("Tidak ada data valid. Periksa nama sheet dan kolom pada template.");
                return;
            }
            setParticipants(result.participants);
            setMessage(
                `${result.participants.length} peserta berhasil dimuat${result.skipped ? `, ${result.skipped} baris dilewati` : ""}.`,
            );
        } catch {
            setMessage("File gagal dibaca. Pastikan file tidak rusak dan mengikuti template.");
        } finally {
            setLoading(false);
        }
    };

    const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
        void processFile(event.target.files?.[0]);
        event.target.value = "";
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragging(false);
        void processFile(event.dataTransfer.files?.[0]);
    };

    if (!open) return null;

    return (
        <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
            <section className="manager-modal" role="dialog" aria-modal="true" aria-labelledby="manager-title" onMouseDown={(event) => event.stopPropagation()}>
                <header className="modal-header">
                    <div>
                        <span className="eyebrow">DATABASE PESERTA</span>
                        <h2 id="manager-title">Kelola Data Karyawan</h2>
                    </div>
                    <button className="icon-button" onClick={onClose} aria-label="Tutup">
                        <X size={21} />
                    </button>
                </header>

                <div className="participant-stats">
                    <div><strong>{participants.length}</strong><span>Total Peserta</span></div>
                </div>

                <div
                    className={`upload-zone ${dragging ? "is-dragging" : ""}`}
                    onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                >
                    <div className="upload-icon"><FileSpreadsheet size={34} /></div>
                    <h3>{loading ? "Membaca data..." : "Unggah database Excel"}</h3>
                    <p>Tarik file ke sini atau pilih file. Gunakan dua sheet: <b>NPP</b> dan <b>NON NPP</b>.</p>
                    <button className="secondary-button" disabled={loading} onClick={() => inputRef.current?.click()}>
                        <Upload size={17} /> Pilih File Excel
                    </button>
                    <input ref={inputRef} hidden type="file" accept=".xlsx,.xls,.csv" onChange={handleInput} />
                </div>

                {message && <p className="import-message" role="status">{message}</p>}

                <div className="manager-actions">
                    <button className="text-button" onClick={downloadTemplate}><Download size={17} /> Unduh Template Excel</button>
                    {participants.length > 0 && (
                        <button
                            className="danger-text-button"
                            onClick={() => {
                                if (window.confirm("Hapus seluruh database peserta dan hasil undian?")) {
                                    clearParticipants();
                                    setMessage("Database peserta telah dihapus.");
                                }
                            }}
                        >
                            <Trash2 size={17} /> Hapus Database
                        </button>
                    )}
                </div>

                <div className="template-note">
                    <b>Kolom wajib:</b> Nama dan NPP/ID. Kolom Unit/Divisi bersifat opsional. Mengunggah file baru akan menghapus seluruh hasil undian sebelumnya.
                </div>
            </section>
        </div>
    );
}
