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
import { PRIZES } from "@/lib/prizes";
import type {
  Participant,
  PrizeEligibility,
  PrizeQuantities,
  RaffleState,
  Winner,
} from "@/lib/types";

const STORAGE_KEY = "golden-hours-raffle-v1";
const DEFAULT_PRIZE_QUANTITIES: PrizeQuantities = Object.fromEntries(
  PRIZES.map((prize) => [prize.id, prize.quantity]),
);
const EMPTY_STATE: RaffleState = {
  participants: [],
  winners: [],
  prizeQuantities: DEFAULT_PRIZE_QUANTITIES,
};

type RaffleContextValue = RaffleState & {
  ready: boolean;
  setParticipants: (participants: Participant[]) => void;
  drawWinners: (
    prizeId: string,
    eligibility: PrizeEligibility,
    count: number,
    simulationWinnerNames?: string[],
    requiredDepartment?: string,
  ) => Participant[];
  setPrizeQuantity: (prizeId: string, quantity: number) => void;
  resetPrizeQuantities: () => void;
  resetDraws: () => void;
  clearParticipants: () => void;
  winnersForPrize: (prizeId: string) => Participant[];
  eligibleCount: (
    eligibility: PrizeEligibility,
    requiredDepartment?: string,
  ) => number;
  prizeQuantity: (prizeId: string) => number;
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
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<RaffleState>;
          const winners = Array.isArray(parsed.winners) ? parsed.winners : [];
          const winnerCounts = winners.reduce<Record<string, number>>(
            (counts, winner) => {
              counts[winner.prizeId] = (counts[winner.prizeId] ?? 0) + 1;
              return counts;
            },
            {},
          );
          const savedQuantities = Object.fromEntries(
            Object.entries(parsed.prizeQuantities ?? {}).filter(
              ([, quantity]) => Number.isInteger(quantity) && quantity >= 0,
            ),
          );
          const prizeQuantities = Object.fromEntries(
            PRIZES.map((prize) => [
              prize.id,
              Math.max(
                savedQuantities[prize.id] ?? DEFAULT_PRIZE_QUANTITIES[prize.id],
                winnerCounts[prize.id] ?? 0,
              ),
            ]),
          );
          setState({
            participants: Array.isArray(parsed.participants)
              ? parsed.participants
              : [],
            winners,
            prizeQuantities,
          });
        }
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
    setState((current) => ({ ...current, participants, winners: [] }));
  }, []);

  const drawWinners = useCallback(
    (
      prizeId: string,
      eligibility: PrizeEligibility,
      count: number,
      simulationWinnerNames: string[] = [],
      requiredDepartment?: string,
    ) => {
      const alreadyWon = new Set(
        state.winners.map((winner) => winner.participantId),
      );
      const normalizedDepartment = requiredDepartment
        ?.trim()
        .toLocaleLowerCase("id-ID");
      const candidates = state.participants.filter(
        (participant) =>
          eligibility.includes(participant.type) &&
          !alreadyWon.has(participant.id) &&
          (!normalizedDepartment ||
            participant.department?.trim().toLocaleLowerCase("id-ID") ===
              normalizedDepartment),
      );
      const normalizedSimulationNames = simulationWinnerNames.map((name) =>
        name.trim().toLocaleLowerCase("id-ID"),
      );
      const simulationWinners = normalizedSimulationNames
        .map((name) =>
          candidates.find(
            (participant) =>
              participant.name.trim().toLocaleLowerCase("id-ID") === name,
          ),
        )
        .filter((participant): participant is Participant =>
          Boolean(participant),
        );
      const simulationWinnerIds = new Set(
        simulationWinners.map((participant) => participant.id),
      );
      if (
        simulationWinners.length !== normalizedSimulationNames.length ||
        simulationWinnerIds.size !== simulationWinners.length ||
        simulationWinners.length > count
      ) {
        return [];
      }

      const randomizedCandidates = secureShuffle(
        candidates.filter(
          (participant) => !simulationWinnerIds.has(participant.id),
        ),
      );
      const selected = [...simulationWinners, ...randomizedCandidates].slice(
        0,
        Math.min(count, candidates.length),
      );
      if (!selected.length) return [];

      const timestamp = new Date().toISOString();
      const newWinners: Winner[] = selected.map((participant) => ({
        participantId: participant.id,
        prizeId,
        wonAt: timestamp,
      }));
      setState((current) => ({
        ...current,
        winners: [...current.winners, ...newWinners],
      }));
      return selected;
    },
    [state.participants, state.winners],
  );

  const setPrizeQuantity = useCallback((prizeId: string, quantity: number) => {
    setState((current) => {
      const winnerCount = current.winners.filter(
        (winner) => winner.prizeId === prizeId,
      ).length;
      const nextQuantity = Math.max(
        winnerCount,
        Math.floor(Number.isFinite(quantity) ? quantity : 0),
      );
      return {
        ...current,
        prizeQuantities: {
          ...current.prizeQuantities,
          [prizeId]: nextQuantity,
        },
      };
    });
  }, []);

  const resetPrizeQuantities = useCallback(() => {
    setState((current) => {
      const winnerCounts = current.winners.reduce<Record<string, number>>(
        (counts, winner) => {
          counts[winner.prizeId] = (counts[winner.prizeId] ?? 0) + 1;
          return counts;
        },
        {},
      );
      const prizeQuantities = Object.fromEntries(
        PRIZES.map((prize) => [
          prize.id,
          Math.max(prize.quantity, winnerCounts[prize.id] ?? 0),
        ]),
      );
      return { ...current, prizeQuantities };
    });
  }, []);

  const resetDraws = useCallback(() => {
    setState((current) => ({ ...current, winners: [] }));
  }, []);

  const clearParticipants = useCallback(() => {
    setState((current) => ({ ...current, participants: [], winners: [] }));
  }, []);

  const value = useMemo<RaffleContextValue>(() => {
    const winnerMap = new Map(
      state.participants.map((participant) => [participant.id, participant]),
    );
    const wonIds = new Set(state.winners.map((winner) => winner.participantId));

    return {
      ...state,
      ready,
      setParticipants,
      drawWinners,
      setPrizeQuantity,
      resetPrizeQuantities,
      resetDraws,
      clearParticipants,
      winnersForPrize: (prizeId) =>
        state.winners
          .filter((winner) => winner.prizeId === prizeId)
          .map((winner) => winnerMap.get(winner.participantId))
          .filter((participant): participant is Participant =>
            Boolean(participant),
          ),
      eligibleCount: (eligibility, requiredDepartment) => {
        const normalizedDepartment = requiredDepartment
          ?.trim()
          .toLocaleLowerCase("id-ID");
        return state.participants.filter(
          (participant) =>
            eligibility.includes(participant.type) &&
            !wonIds.has(participant.id) &&
            (!normalizedDepartment ||
              participant.department?.trim().toLocaleLowerCase("id-ID") ===
                normalizedDepartment),
        ).length;
      },
      prizeQuantity: (prizeId) => state.prizeQuantities[prizeId] ?? 0,
    };
  }, [
    clearParticipants,
    drawWinners,
    ready,
    resetDraws,
    resetPrizeQuantities,
    setParticipants,
    setPrizeQuantity,
    state,
  ]);

  return (
    <RaffleContext.Provider value={value}>{children}</RaffleContext.Provider>
  );
}

export function useRaffle() {
  const context = useContext(RaffleContext);
  if (!context) throw new Error("useRaffle must be used inside RaffleProvider");
  return context;
}
