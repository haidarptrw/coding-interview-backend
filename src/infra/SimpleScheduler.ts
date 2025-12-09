import { IScheduler } from "../core/IScheduler";

type Scheduled = {
  timer: NodeJS.Timeout;
  intervalMs: number;
}

export class SimpleScheduler implements IScheduler {
  private intervals = new Map<string, Scheduled>();

  scheduleRecurring(
    name: string,
    intervalMs: number,
    fn: () => void | Promise<void>
  ): void {
    if (this.intervals.has(name)) {
      this.stop(name);
    }

    //  Wrap with a safe exception handling
    const runner = async () => {
      try {
        await Promise.resolve(fn());
      }catch (e) {
        console.error(`[SimpleScheduler:${name}] job failed:`, e);
      }
    }

    const interval:Scheduled = {
      timer: setInterval(runner, intervalMs),
      intervalMs
    }

    this.intervals.set(name, interval);

    // this should be the cleanup logic
  }

  stop(name: string): void {
    const interval = this.intervals.get(name);
    if (!interval) return;

    clearInterval(interval.timer);
    this.intervals.delete(name);
  }
}
