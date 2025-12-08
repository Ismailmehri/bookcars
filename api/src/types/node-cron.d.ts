declare module 'node-cron' {
  export interface ScheduleOptions {
    timezone?: string
  }

  export interface ScheduledTask {
    start: () => void
    stop: () => void
  }

  export function schedule(expression: string, callback: () => void, options?: ScheduleOptions): ScheduledTask
}
