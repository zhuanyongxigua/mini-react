import { PriorityLevel, getTimeoutByPriorityLevel } from './SchedulerPriorities'
import { getCurrentTime } from 'shared/utils'

interface Task {
  id: number
  callback: () => void
  priorityLevel: PriorityLevel
  startTime: number
  expireTime: number
  sortIndex: number
}

const taskQueue: Task[] = []

const timerQueue: Task[] = []

let taskIdCounter = 1

export function scheduleCallback (
  priorityLevel: PriorityLevel,
  callback: () => void,
  options?: { delay?: number }
) {

}
