import { PriorityLevel, getTimeoutByPriorityLevel } from './SchedulerPriorities'
import { getCurrentTime } from 'shared/utils'
import { push, peek, pop } from './SchedulerMinHeap'

interface Task {
  id: number
  callback: () => void
  priorityLevel: PriorityLevel
  startTime: number
  expirationTime: number
  sortIndex: number
}

const taskQueue: Task[] = []
const timerQueue: Task[] = []

let taskIdCounter = 1
let taskTimeoutID: number = -1
// host 这里是主线程的意思
let isHostTimeoutScheduled = false
// 主线程有没有任务在执行
let isHostCallbackScheduled = false

function requestHostTimeout (callback: (time: number) => void, delay: number) {
  taskTimeoutID = setTimeout(() => {
    callback(getCurrentTime())
  }, delay) as unknown as number
}

const cancelTimeoutID = () => {
  clearTimeout(taskTimeoutID)
  taskTimeoutID = -1
}

const handleTimeout = (currentTime: number) => {
  isHostTimeoutScheduled = false
  advanceTimers(currentTime)
  if (!isHostCallbackScheduled) {
    if (peek(taskQueue) !== null) {
      isHostCallbackScheduled = true
      requestHostCallback(flushWork)
    } else {
      const top = pop(timerQueue) as Task
      if (top !== null) {
        requestHostTimeout(top.callback, top.startTime - currentTime)
      }
    }
  }
}

const advanceTimers = (currentTime: number) => {
  let top = peek(timerQueue) as Task
  while(top !== null) {
    // 比如在单页应用中，当前的页面 A 已经被跳过了，现在是页面 B
    // 那在页面 A 的时候添加的任务再执行就没有意义了，所以可以直接取消掉
    // 这个取消的行为需要交给使用 schedule 的“用户”
    if (top.callback === null) {
      pop(timerQueue)
    // 下面的创建 task 的时候，由于 startTime 是可能包含 delay 的
    // 所以 startTime 有可能比 currentTime 大
    } else if (top.startTime <= currentTime) {
      pop(timerQueue)
      top.sortIndex = top.expirationTime
      push(taskQueue, top)
    } else {
      return
    }
    top = peek(timerQueue) as Task
  }
}

export function scheduleCallback (
  priorityLevel: PriorityLevel,
  callback: () => void,
  options?: { delay?: number }
) {
  const currentTime = getCurrentTime()
  let startTime: number

  if (options?.delay > 0) {
    startTime = currentTime + options.delay
  } else {
    startTime = currentTime
  }
  const timeout = getTimeoutByPriorityLevel(priorityLevel)
  const expirationTime = startTime + timeout

  const task: Task = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: -1
  }
  // Timeout 应该是执行的等待时间，优先级高的等待时间就短
  // TimerQueue 确实应该用 startTime 来排序，如果一个先进来的优先级低的任务，用 expirationTime 来排序，那如果一个 delay 高的优先级高的任务在前面，这个优先级低的任务也会被挡住无法进入 taskQueue。
  // 所以主要还是因为这是延迟队列。
  if (startTime > currentTime) {
    task.sortIndex = startTime
    push(timerQueue, task)
    if (peek(taskQueue) === null && peek(timerQueue) === task) {
      // 这里就是这样的逻辑，在 task 成为堆顶之前，可能已经有一个 task 在 setTimeout 了
      // 但是当前的这个 task 的优先级会被认为是最高的，所以就是把之前的取消掉
      if (isHostTimeoutScheduled) {
        cancelTimeoutID()
      } else {
        isHostTimeoutScheduled = true
      }
      const handler = requestHostTimeout(handleTimeout, startTime - currentTime)
    }
  } else {
    task.sortIndex = expirationTime
    push(taskQueue, task)
    if (!isHostCallbackScheduled) {
      isHostCallbackScheduled = true
      requestHostCallback(flushWork)
    }
  }
}
