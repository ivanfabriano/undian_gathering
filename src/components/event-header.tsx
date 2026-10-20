import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";

export function EventHeader({ back = false }: { back?: boolean }) {
    return (
        <header className={`event-header ${back ? "event-header--compact" : ""}`}>
            {back && (
                <Link href="/" className="back-link" aria-label="Kembali ke daftar hadiah">
                    <ArrowLeft size={20} /> <span>Kembali</span>
                </Link>
            )}
            <div className="event-brand">
                <p>GATHERING SBU HIMPM 2026</p>
                <h1>Golden Hours</h1>
            </div>
            {!back && (
                <div className="event-meta">
                    <span><MapPin size={15} /> Bumi Gumati, Bogor</span>
                    <span><CalendarDays size={15} /> 23–24 Oktober 2026</span>
                </div>
            )}
            {back && <div className="event-header-spacer" />}
        </header>
    );
}
