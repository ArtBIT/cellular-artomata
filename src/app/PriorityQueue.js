class PriorityQueueItem {
  constructor(data, priority) {
    this.data = data;
    this.priority = priority || 0;
  }
}

export class PriorityQueue {
  constructor() {
    this.clear();
  }
  push(data, priority) {
    const item = new PriorityQueueItem(data, priority);
    let foundIndex = 0;
    for (var i = 0, ii = this.items; i < ii; i++) {
      if (this.items[i].priority > item.priority) {
        foundIndex = i;
        break;
      }
    }
    this.items.splice(foundIndex, 0, item);
  }
  pop() {
    return this.items.pop();
  }
  forEach(callback) {
    this.items.forEach(item => {
      callback(item.data);
    });
  }
  clear() {
    this.items = [];
  }
}
