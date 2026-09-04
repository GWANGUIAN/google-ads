export interface CronPreset {
  label: string;
  expression: string;
}

export const CRON_PRESETS: CronPreset[] = [
  { label: "Every minute", expression: "* * * * *" },
  { label: "Every 15 minutes", expression: "*/15 * * * *" },
  { label: "Hourly", expression: "@hourly" },
  { label: "Daily at midnight", expression: "@daily" },
  { label: "Weekdays at 9am", expression: "0 9 * * 1-5" },
  { label: "Weekly (Sunday)", expression: "@weekly" },
  { label: "Monthly (1st)", expression: "@monthly" },
];
