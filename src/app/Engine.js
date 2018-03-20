import { PriorityQueue } from "./PriorityQueue";
import requestAnimationFrame from "requestanimationframe";
export class Engine {
  constructor(tasks) {
    this.isRunning = false;
    this.isPaused = false;
    this.tasks = new PriorityQueue();
    if (tasks) {
      while (tasks.length) {
        this.tasks.push(tasks.shift());
      }
    }
  }
  start() {
    if (this.isRunning) {
      if (!this.isPaused) {
        return;
      }
      this.pause();
    }
    this.isRunning = true;
    this.tick();
  }
  stop() {
    this.isRunning = false;
  }
  addTask(task, priority) {
    this.tasks.push(task, priority);
  }
  pause() {
    this.isPaused = !this.isPaused;
  }
  tick = () => {
    if (!this.isRunning || this.isPaused) {
      return;
    }
    this.tasks.forEach(task => task());
    requestAnimationFrame(this.tick);
  };
}
