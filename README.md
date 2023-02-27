### February 21

You can read "React18 新特性" courses first. The way is in the first line of image below.

![](http://www.zhuanyongxigua.cn/2023-02-26-082656.png)

90% interview problems of React is about state management.

##### How to handle multiple tasks in single thread? #Q

时间分片。

![](http://www.zhuanyongxigua.cn/2023-02-26-084041.png)

In the lower picture, the time zone is very small, it may be 5ms. The system would check the task queue again each 5ms. Another task would be implemented if its priority is higher.

##### Which JS data structure should be used for taskQueue? What properties should be contained by a Task? And real data structure? #Q

Array.

```ts
interface Task {
  id: number
  callback: () => void
  priorityLevel: PriorityLevel
  startTime: number
  expireTime: number
  sortIndex: number
}
```

MinHeap.

##### What is the different between startTime and expirationTime? #Q

StartTime is the time when the task is created. expirationTime is the time when the task should be executed.

##### What is the function of schedulerCallback? #Q

Put task into taskQueue. Users use scheduler through schedulerCallback. This function is not a callback function, it's used for scheduling callbacks.

##### How to design scheduler? #Q

##### Why does React use more ES5 than ES6? #Q

E.g. `[...list]`, `Object.assign` is used more.
1. `Object.assign` is original API, `[...list]` must be translate.
2. `[...list]` would throw an error if there is an undefined value.

##### What is the different between priorityLevel and sortIndex? #Q

Higher priority would be executed first. Task which has higher sortIndex would be executed first if there are other same priorityLevel tasks behind it.

##### What is the different between taskQueue and timerQueue? #Q

Tasks in taskQueue would be executed immediately. Tasks in timerQueue would be move into taskQueue when their delay is over.









