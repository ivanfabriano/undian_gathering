export type ParticipantType = "NPP" | "NON_NPP";

export type Participant = {
    id: string;
    name: string;
    employeeId: string;
    type: ParticipantType;
    department?: string;
};

export type Winner = {
    participantId: string;
    prizeId: string;
    wonAt: string;
};

export type Prize = {
    id: string;
    name: string;
    shortName: string;
    description: string;
    quantity: number;
    eligibility: ParticipantType;
    tone: "grand" | "employee" | "gopay";
    visual: "tv" | "watch" | "tumbler" | "tws" | "fan" | "gopay150" | "gopay100" | "gopay50";
};

export type RaffleState = {
    participants: Participant[];
    winners: Winner[];
};

export type ImportResult = {
    participants: Participant[];
    skipped: number;
};
