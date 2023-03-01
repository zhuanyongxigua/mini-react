import { PriorityLevel, getTimeoutByPriorityLevel } from './SchedulerPriorities'
import { getCurrentTime } from 'shared/utils'
import { push, peek } from './SchedulerMinHeap'

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

function requestHostTimeout (callback: () => void, delay: number) {
  taskTimeoutID = setTimeout(callback, delay) as number
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
      const handler = requestHostTimeout(handleTimeout, startTime - currentTime)
    }
  } else {
    task.sortIndex = expirationTime
    push(taskQueue, task)
  }



}
