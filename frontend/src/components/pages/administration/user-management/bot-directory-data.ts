export type BotStatus = "working" | "paused";

export type BotRecord = {
  id: string;
  name: string;
  pseudoName: string;
  status: BotStatus;
  startTime: string;
  restWindow: string;
  lastRun: string;
};

export const emptyBotRecord: BotRecord = {
  id: "",
  name: "",
  pseudoName: "",
  status: "paused",
  startTime: "09:30 AM",
  restWindow: "12:30 PM - 01:15 PM",
  lastRun: "Not started",
};

export const initialBotRows: BotRecord[] = [
  {
    id: "bot-01",
    name: "Trademark Notice Bot",
    pseudoName: "Notice Runner",
    status: "working",
    startTime: "09:30 AM",
    restWindow: "12:30 PM - 01:15 PM",
    lastRun: "Today, 09:32 AM",
  },
  {
    id: "bot-02",
    name: "Domain Outreach Bot",
    pseudoName: "Domain Scheduler",
    status: "paused",
    startTime: "10:00 AM",
    restWindow: "01:00 PM - 02:00 PM",
    lastRun: "Yesterday, 04:18 PM",
  },
  {
    id: "bot-03",
    name: "Mask Delivery Bot",
    pseudoName: "Mask Queue",
    status: "paused",
    startTime: "11:15 AM",
    restWindow: "02:00 PM - 02:30 PM",
    lastRun: "Not started",
  },
];