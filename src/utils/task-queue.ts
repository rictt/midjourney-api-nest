export interface ITask {
  // taskId: string;
  messageId?: string;
  creator?: string;
  execute: () => void;
  onTimeout?: () => void;
  done?: boolean;
  startTime?: number;
}

export interface ITaskQueueOps {
  max?: number;
  interval?: number;
  concurrency?: number;
}

export class TaskQueue {
  queue: ITask[];
  interval: number;
  max: number;
  executing: boolean;
  concurrency: number;
  executeQueue: any[];

  constructor(ops: ITaskQueueOps) {
    const { interval, max, concurrency } = ops;
    this.interval = interval || 0;
    this.max = max || 20;
    this.executing = false;
    this.concurrency = concurrency || 3;
    this.queue = [];
    this.executeQueue = [];
  }

  push(task: ITask) {
    this.queue.push(task);
    if (this.executeQueue.length < this.concurrency) {
      console.log('execute new loop');
      this.execute();
    }
  }

  pop() {
    this.queue.pop();
  }

  async executeTask(task: ITask) {
    // 超过5分钟，任务丢掉
    return new Promise(async (resolve, reject) => {
      const timer = setTimeout(() => {
        if (!task.done) {
          reject('绘制任务超时，取消任务');
        }
        task?.onTimeout();
      }, 1000 * 60 * 5);
      try {
        await task.execute();
        task.done = true;
        clearTimeout(timer);
        resolve('');
      } catch (error) {
        reject(error);
      }
    });
  }

  async execute() {
    this.executeQueue.push(true);
    console.log('待执行任务数量：', this.queue.length);
    while (this.queue.length) {
      try {
        console.log('task 得到执行: ', new Date().toLocaleTimeString());
        const task = this.queue.shift();
        await this.executeTask(task);

        if (this.interval) {
          console.log('等待间隔执行：', this.interval);
          await new Promise((resolve) => setTimeout(resolve, this.interval));
        }
      } catch (error) {
        console.log('[execute task error]: ', error);
      }
    }
    this.executeQueue.pop();
  }
}

export const taskQueueInstance = new TaskQueue({
  interval: 500,
});
