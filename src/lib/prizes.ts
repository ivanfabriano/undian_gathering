import type { Prize } from "./types";

export const PRIZES: Prize[] = [
  {
    id: "tv-40",
    name: "TV",
    shortName: "TV",
    description:
      "Hadiah utama Gathering SBU HIMPM 2026 untuk karyawan yang beruntung.",
    quantity: 1,
    eligibility: ["NPP"],
    tone: "grand",
    visual: "tv",
    simulationWinnerNames: ["Ginanjar Ardiansyah"],
  },
  {
    id: "smartwatch",
    name: "Smartwatch",
    shortName: "Smartwatch",
    description: "Smartwatch modern untuk karyawan yang beruntung.",
    quantity: 3,
    eligibility: ["NPP"],
    tone: "employee",
    visual: "watch",
    simulationWinnerNames: ["Aqsha Suyudi Putera", "Akbar Nandito Presetia"],
  },
  {
    id: "tumbler",
    name: "Tumbler Lock & Lock",
    shortName: "Tumbler",
    description: "Tumbler premium Lock & Lock untuk karyawan yang beruntung.",
    quantity: 3,
    eligibility: ["NPP"],
    tone: "employee",
    visual: "tumbler",
  },
  {
    id: "tws",
    name: "True Wireless Stereo",
    shortName: "TWS",
    description: "Perangkat TWS untuk menemani perjalanan karyawan.",
    quantity: 12,
    eligibility: ["NPP"],
    tone: "employee",
    visual: "tws",
  },
  {
    id: "kipas-elektrik",
    name: "Kipas Tangan Elektrik",
    shortName: "Kipas Elektrik",
    description: "Kipas tangan elektrik untuk karyawan yang beruntung.",
    quantity: 13,
    eligibility: ["NPP"],
    tone: "employee",
    visual: "fan",
  },
  {
    id: "gopay-100",
    name: "GoPay Rp100.000",
    shortName: "GoPay 100K",
    description: "Saldo GoPay senilai Rp100.000 untuk peserta yang beruntung.",
    quantity: 16,
    eligibility: ["NPP", "NON_NPP"],
    tone: "gopay",
    visual: "gopay100",
  },
  {
    id: "gopay-50",
    name: "GoPay Rp50.000",
    shortName: "GoPay 50K",
    description:
      "Saldo GoPay senilai Rp50.000 untuk peserta Unit Driver yang beruntung.",
    quantity: 5,
    eligibility: ["NON_NPP"],
    requiredDepartment: "Driver",
    tone: "gopay",
    visual: "gopay50",
  },
];

export const getPrize = (id: string) => PRIZES.find((prize) => prize.id === id);

export const TOTAL_PRIZES = PRIZES.reduce(
  (total, prize) => total + prize.quantity,
  0,
);
