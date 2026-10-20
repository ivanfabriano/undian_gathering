import { notFound } from "next/navigation";
import { PrizeDraw } from "@/components/prize-draw";
import { getPrize, PRIZES } from "@/lib/prizes";

export function generateStaticParams() {
    return PRIZES.map((prize) => ({ id: prize.id }));
}

export default async function PrizePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const prize = getPrize(id);
    if (!prize) notFound();
    return <PrizeDraw prize={prize} />;
}
