---
sidebar_position: 5
tags: [java, 线程池, 并发]
---

# Java 线程池使用指南

线程池是 Java 并发编程中的核心概念，它通过管理线程的生命周期和复用，大大提高了系统的性能和资源利用率。本文将详细介绍 Java 线程池的使用方法和最佳实践。

## 为什么使用线程池？

在没有线程池的情况下，我们每执行一个任务都需要创建一个新线程，任务执行完毕后销毁线程。这种方式存在以下问题：

1. **创建和销毁线程的开销大**：线程的创建和销毁需要消耗系统资源
2. **缺乏统一管理**：大量线程同时运行可能导致系统资源耗尽
3. **缺乏灵活性**：无法根据系统负载动态调整线程数量

使用线程池可以：
- 复用已创建的线程，减少创建和销毁的开销
- 统一管理线程，控制最大并发数
- 提供定时执行、定期执行等高级功能
- 根据系统负载动态调整线程池大小

## ThreadPoolExecutor 核心参数

`ThreadPoolExecutor` 是 Java 中线程池的核心实现类，它的构造函数如下：

```java
public ThreadPoolExecutor(
    int corePoolSize,           // 核心线程数
    int maximumPoolSize,        // 最大线程数
    long keepAliveTime,         // 空闲线程存活时间
    TimeUnit unit,              // 时间单位
    BlockingQueue<Runnable> workQueue,  // 任务队列
    ThreadFactory threadFactory,        // 线程工厂
    RejectedExecutionHandler handler     // 拒绝策略
)
```

### 参数详解

| 参数 | 说明 |
|------|------|
| `corePoolSize` | 核心线程数，线程池中始终保持的线程数量，即使这些线程处于空闲状态 |
| `maximumPoolSize` | 线程池最大线程数，当任务队列满了之后，线程池最多能创建的线程数 |
| `keepAliveTime` | 空闲线程的存活时间，当线程数超过核心线程数时，多余的空闲线程在这个时间后会被销毁 |
| `unit` | `keepAliveTime` 的时间单位 |
| `workQueue` | 任务队列，用于存放等待执行的任务 |
| `threadFactory` | 线程工厂，用于创建线程，可以自定义线程名称、优先级等 |
| `handler` | 拒绝策略，当线程池和队列都满了时，如何处理新提交的任务 |

### 任务执行流程

当向线程池提交任务时，线程池的处理流程如下：

1. 如果当前线程数 < `corePoolSize`，创建新线程执行任务
2. 如果当前线程数 >= `corePoolSize`，将任务放入 `workQueue`
3. 如果 `workQueue` 已满，且当前线程数 < `maximumPoolSize`，创建新线程执行任务
4. 如果 `workQueue` 已满，且当前线程数 >= `maximumPoolSize`，执行拒绝策略

## 常见任务队列

`ThreadPoolExecutor` 支持多种任务队列，常用的有：

### 1. ArrayBlockingQueue

基于数组的有界阻塞队列，按 FIFO（先进先出）原则对元素进行排序。

```java
new ArrayBlockingQueue<>(100)  // 容量为100的有界队列
```

### 2. LinkedBlockingQueue

基于链表的阻塞队列，可以选择是否有界。如果不指定容量，默认容量为 `Integer.MAX_VALUE`。

```java
new LinkedBlockingQueue<>()           // 无界队列
new LinkedBlockingQueue<>(100)        // 容量为100的有界队列
```

### 3. SynchronousQueue

不存储元素的阻塞队列，每个插入操作必须等待另一个线程的移除操作。

```java
new SynchronousQueue<>()
```

### 4. PriorityBlockingQueue

支持优先级的无界阻塞队列，元素按照自然顺序或自定义比较器排序。

```java
new PriorityBlockingQueue<>()
```

## 拒绝策略

当线程池和任务队列都满了时，需要通过拒绝策略来处理新提交的任务。`ThreadPoolExecutor` 提供了 4 种内置的拒绝策略：

### 1. AbortPolicy（默认策略）

**行为**：直接抛出 `RejectedExecutionException` 异常，明确拒绝任务。

**适用场景**：希望知道任务被拒绝了，并手动处理异常逻辑（比如重试、报警等）。

```java
new ThreadPoolExecutor.AbortPolicy()
```

### 2. CallerRunsPolicy

**行为**：由提交任务的线程（比如主线程）来执行任务。

**适用场景**：不希望丢任务，也不想抛异常，用调用线程"降速"来缓解线程池压力。

```java
new ThreadPoolExecutor.CallerRunsPolicy()
```

### 3. DiscardPolicy

**行为**：直接丢弃任务，啥也不做，不抛异常。

**适用场景**：对实时性要求高、不关心个别任务丢失（比如日志收集、监控数据）的场景。

```java
new ThreadPoolExecutor.DiscardPolicy()
```

### 4. DiscardOldestPolicy

**行为**：丢弃队列中最早的任务（队头），然后尝试重新提交当前任务。

**适用场景**：优先处理新任务，希望淘汰旧任务（比如 UI 刷新、监控推送等）。

```java
new ThreadPoolExecutor.DiscardOldestPolicy()
```

### 拒绝策略对比表

| 策略                    | 是否抛异常 | 是否丢任务 | 描述              |
| --------------------- | ----- | ----- | --------------- |
| `AbortPolicy`         | ✅ 是   | ❌ 否   | 明确拒绝任务并抛出异常     |
| `CallerRunsPolicy`    | ❌ 否   | ❌ 否   | 由提交线程自己执行任务（削峰） |
| `DiscardPolicy`       | ❌ 否   | ✅ 是   | 安静丢弃任务          |
| `DiscardOldestPolicy` | ❌ 否   | ✅ 是   | 丢掉最旧任务，尝试执行新任务  |

### 自定义拒绝策略

如果内置的拒绝策略不能满足需求，可以实现 `RejectedExecutionHandler` 接口自定义拒绝策略：

```java
public class CustomRejectedPolicy implements RejectedExecutionHandler {
    @Override
    public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
        // 自定义处理逻辑
        System.out.println("任务被拒绝，进行自定义处理");
        // 例如：记录日志、发送告警、持久化任务等
    }
}
```

## Executors 工厂类

Java 提供了 `Executors` 工厂类，可以快速创建常见类型的线程池：

### 1. newFixedThreadPool

创建固定大小的线程池，核心线程数和最大线程数相同。

```java
ExecutorService executor = Executors.newFixedThreadPool(5);
```

**特点**：
- 核心线程数 = 最大线程数
- 任务队列为无界的 `LinkedBlockingQueue`
- 适用于任务量相对稳定的场景

### 2. newCachedThreadPool

创建可缓存的线程池，线程数可以根据需要动态调整。

```java
ExecutorService executor = Executors.newCachedThreadPool();
```

**特点**：
- 核心线程数为 0，最大线程数为 `Integer.MAX_VALUE`
- 使用 `SynchronousQueue` 作为任务队列
- 空闲线程存活时间为 60 秒
- 适用于执行大量短期异步任务的场景

### 3. newSingleThreadExecutor

创建单线程的线程池，只有一个线程在工作。

```java
ExecutorService executor = Executors.newSingleThreadExecutor();
```

**特点**：
- 核心线程数和最大线程数都为 1
- 使用无界的 `LinkedBlockingQueue`
- 适用于需要保证任务顺序执行的场景

### 4. newScheduledThreadPool

创建支持定时和周期性任务执行的线程池。

```java
ScheduledExecutorService executor = Executors.newScheduledThreadPool(3);
```

**特点**：
- 支持延迟执行和周期性执行任务
- 适用于需要定时执行任务的场景

**注意**：虽然 `Executors` 工厂类使用方便，但在生产环境中建议直接使用 `ThreadPoolExecutor` 构造函数，这样可以更精确地控制线程池的参数，避免资源耗尽的风险。

## 线程池使用示例

### 基本使用示例

```java
import java.util.concurrent.*;

public class ThreadPoolExample {
    public static void main(String[] args) {
        // 创建线程池
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                2,                      // corePoolSize
                4,                      // maximumPoolSize
                10, TimeUnit.SECONDS,   // keepAliveTime
                new ArrayBlockingQueue<>(2), // workQueue
                new ThreadPoolExecutor.CallerRunsPolicy() // RejectedExecutionHandler
        );

        // 提交任务
        for (int i = 0; i < 10; i++) {
            final int taskId = i;
            executor.execute(() -> {
                System.out.println(Thread.currentThread().getName() + " 执行任务 " + taskId);
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException ignored) {
                }
            });
        }

        // 关闭线程池
        executor.shutdown();
    }
}
```

### 带返回值的任务

使用 `Callable` 接口和 `Future` 对象可以获取任务的执行结果：

```java
import java.util.concurrent.*;

public class CallableExample {
    public static void main(String[] args) throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(3);

        // 提交 Callable 任务
        Future<Integer> future = executor.submit(() -> {
            System.out.println("任务开始执行");
            Thread.sleep(2000);
            return 42;
        });

        // 获取任务执行结果
        System.out.println("等待任务执行...");
        Integer result = future.get();  // 阻塞等待任务完成
        System.out.println("任务执行结果: " + result);

        executor.shutdown();
    }
}
```

### 定时任务示例

```java
import java.util.concurrent.*;

public class ScheduledThreadPoolExample {
    public static void main(String[] args) {
        ScheduledExecutorService executor = Executors.newScheduledThreadPool(2);

        // 延迟 3 秒后执行一次
        executor.schedule(() -> {
            System.out.println("延迟任务执行: " + System.currentTimeMillis());
        }, 3, TimeUnit.SECONDS);

        // 初始延迟 1 秒，之后每隔 2 秒执行一次
        executor.scheduleAtFixedRate(() -> {
            System.out.println("固定频率任务执行: " + System.currentTimeMillis());
        }, 1, 2, TimeUnit.SECONDS);

        // 初始延迟 1 秒，在上一次任务执行完毕后延迟 2 秒再执行
        executor.scheduleWithFixedDelay(() -> {
            System.out.println("固定延迟任务执行: " + System.currentTimeMillis());
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }, 1, 2, TimeUnit.SECONDS);
    }
}
```

## 线程池监控

在生产环境中，对线程池进行监控是非常重要的。`ThreadPoolExecutor` 提供了一些方法可以获取线程池的运行状态：

```java
ThreadPoolExecutor executor = ...;

// 获取线程池状态
System.out.println("核心线程数: " + executor.getCorePoolSize());
System.out.println("最大线程数: " + executor.getMaximumPoolSize());
System.out.println("当前线程数: " + executor.getPoolSize());
System.out.println("活动线程数: " + executor.getActiveCount());
System.out.println("已完成任务数: " + executor.getCompletedTaskCount());
System.out.println("总任务数: " + executor.getTaskCount());
System.out.println("队列大小: " + executor.getQueue().size());
System.out.println("线程池是否关闭: " + executor.isShutdown());
System.out.println("线程池是否终止: " + executor.isTerminated());
```

## 线程池关闭

正确关闭线程池非常重要，有两种主要的关闭方式：

### 1. shutdown()

平缓关闭线程池，不再接受新任务，但会执行完队列中已有的任务。

```java
executor.shutdown();
```

### 2. shutdownNow()

立即关闭线程池，尝试停止正在执行的任务，并返回队列中未执行的任务。

```java
List<Runnable> pendingTasks = executor.shutdownNow();
```

### 优雅关闭线程池的最佳实践

```java
executor.shutdown();
try {
    // 等待线程池终止，最多等待 60 秒
    if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
        // 如果超时，强制关闭
        executor.shutdownNow();
        // 再等待一段时间
        if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
            System.err.println("线程池未能正常终止");
        }
    }
} catch (InterruptedException e) {
    // 如果当前线程也被中断，强制关闭
    executor.shutdownNow();
    // 重新设置中断状态
    Thread.currentThread().interrupt();
}
```

## 线程池最佳实践

### 1. 合理设置线程池大小

线程池大小的设置需要考虑任务的类型：

- **CPU 密集型任务**：线程数 = CPU 核心数 + 1
- **IO 密集型任务**：线程数 = 2 * CPU 核心数
- **混合型任务**：可以考虑将任务拆分为 CPU 密集型和 IO 密集型，分别使用不同的线程池

### 2. 使用有界队列

使用无界队列可能会导致内存溢出，建议使用有界队列并合理设置容量。

### 3. 自定义线程工厂

自定义线程工厂可以设置有意义的线程名称，方便问题排查：

```java
ThreadFactory threadFactory = new ThreadFactory() {
    private final AtomicInteger threadNumber = new AtomicInteger(1);
    
    @Override
    public Thread newThread(Runnable r) {
        Thread thread = new Thread(r, "my-pool-" + threadNumber.getAndIncrement());
        thread.setDaemon(false);
        thread.setPriority(Thread.NORM_PRIORITY);
        return thread;
    }
};
```

### 4. 处理线程池异常

线程池中的线程如果抛出异常，默认情况下不会有任何提示。可以通过以下方式处理：

```java
// 方式一：在任务内部捕获异常
executor.execute(() -> {
    try {
        // 任务逻辑
    } catch (Exception e) {
        // 处理异常
        e.printStackTrace();
    }
});

// 方式二：重写 afterExecute 方法
ThreadPoolExecutor executor = new ThreadPoolExecutor(...) {
    @Override
    protected void afterExecute(Runnable r, Throwable t) {
        super.afterExecute(r, t);
        if (t != null) {
            // 处理异常
            t.printStackTrace();
        }
    }
};
```

### 5. 避免在任务中使用 ThreadLocal

线程池中的线程会被复用，如果任务中使用了 `ThreadLocal`，可能会导致数据污染或内存泄漏。如果必须使用，确保在任务结束时清理 `ThreadLocal`。

## 常见问题

### 1. 线程池的线程会抛出异常吗？

会。如果任务中抛出异常且没有被捕获，线程会终止，但线程池会创建新的线程来替代它。

### 2. 如何实现线程池的动态调整？

可以通过 `setCorePoolSize()` 和 `setMaximumPoolSize()` 方法动态调整线程池大小。

### 3. 线程池中的核心线程会被回收吗？

默认情况下不会。但可以通过 `allowCoreThreadTimeOut(true)` 方法允许核心线程在空闲时被回收。

### 4. 如何保证任务的执行顺序？

可以使用 `newSingleThreadExecutor()` 或者将所有任务提交到同一个线程中执行。

## 总结

线程池是 Java 并发编程中的重要工具，合理使用线程池可以大大提高系统的性能和资源利用率。在使用线程池时，需要根据业务场景合理设置参数，选择合适的拒绝策略，并注意线程池的监控和正确关闭。

希望本文能够帮助你更好地理解和使用 Java 线程池！
