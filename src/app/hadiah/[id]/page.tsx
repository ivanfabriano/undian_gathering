import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PrizeDraw } from "@/components/prize-draw";
import { getPrize, PRIZES } from "@/lib/prizes";

export function generateStaticParams() {
  return PRIZES.map((prize) => ({ id: prize.id }));
}

type PrizePageProps = {
  params: Promise<{ id: string }>;
};

async function PrizePageContent({ params }: PrizePageProps) {
  const { id } = await params;
  const prize = getPrize(id);
  if (!prize) notFound();
  return <PrizeDraw prize={prize} />;
}

export default function PrizePage({ params }: PrizePageProps) {
  return (
    <Suspense fallback={<main className="draw-page" aria-busy="true" />}>
      <PrizePageContent params={params} />
    </Suspense>
  );
}
