"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import type { Participant, ParticipantType, RaffleState, Winner } from "@/lib/types";

const STORAGE_KEY = "golden-hours-raffle-v1";
const EMPTY_STATE: RaffleState = { participants: [], winners: [] };

type RaffleContextValue = RaffleState & {
    ready: boolean;
    setParticipants: (participants: Participant[]) => void;
    drawWinners: (prizeId: string, eligibility: ParticipantType, count: number) => Participant[];
    resetDraws: () => void;
    clearParticipants: () => void;
    winnersForPrize: (prizeId: string) => Participant[];
    eligibleCount: (type: ParticipantType) => number;
};

const RaffleContext = createContext<RaffleContextValue | null>(null);

function secureRandomIndex(max: number) {
    if (max <= 1) return 0;
    const range = 0x100000000;
    const limit = range - (range % max);
    const buffer = new Uint32Array(1);
    let value = range;
    while (value >= limit) {
        crypto.getRandomValues(buffer);
        value = buffer[0];
    }
    return value % max;
}

function secureShuffle<T>(items: T[]) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
        const randomIndex = secureRandomIndex(index + 1);
        [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
    }
    return result;
}

export function RaffleProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<RaffleState>(EMPTY_STATE);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) setState(JSON.parse(stored) as RaffleState);
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            } finally {
                setReady(true);
            }
        }, 0);
        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [ready, state]);

    const setParticipants = useCallback((participants: Participant[]) => {
        setState({ participants, winners: [] });
    }, []);

    const drawWinners = useCallback(
        (prizeId: string, eligibility: ParticipantType, count: number) => {
            const alreadyWon = new Set(state.winners.map((winner) => winner.participantId));
            const candidates = state.participants.filter(
                (participant) => participant.type === eligibility && !alreadyWon.has(participant.id),
            );
            const selected = secureShuffle(candidates).slice(0, Math.min(count, candidates.length));
            if (!selected.length) return [];

            const timestamp = new Date().toISOString();
            const newWinners: Winner[] = selected.map((participant) => ({
                participantId: participant.id,
                prizeId,
                wonAt: timestamp,
            }));
            setState((current) => ({ ...current, winners: [...current.winners, ...newWinners] }));
            return selected;
        },
        [state.participants, state.winners],
    );

    const resetDraws = useCallback(() => {
        setState((current) => ({ ...current, winners: [] }));
    }, []);

    const clearParticipants = useCallback(() => {
        setState(EMPTY_STATE);
    }, []);

    const value = useMemo<RaffleContextValue>(() => {
        const winnerMap = new Map(state.participants.map((participant) => [participant.id, participant]));
        const wonIds = new Set(state.winners.map((winner) => winner.participantId));

        return {
            ...state,
            ready,
            setParticipants,
            drawWinners,
            resetDraws,
            clearParticipants,
            winnersForPrize: (prizeId) =>
                state.winners
                    .filter((winner) => winner.prizeId === prizeId)
                    .map((winner) => winnerMap.get(winner.participantId))
                    .filter((participant): participant is Participant => Boolean(participant)),
            eligibleCount: (type) =>
                state.participants.filter((participant) => participant.type === type && !wonIds.has(participant.id))
                    .length,
        };
    }, [clearParticipants, drawWinners, ready, resetDraws, setParticipants, state]);

    return <RaffleContext.Provider value={value}>{children}</RaffleContext.Provider>;
}

export function useRaffle() {
    const context = useContext(RaffleContext);
    if (!context) throw new Error("useRaffle must be used inside RaffleProvider");
    return context;
}
