---
sidebar_position: 6
tags: [java, 线程, 并发, 线程池]
---

# Java 线程创建指南

在 Java 中创建线程有多种方式，从最基本的直接创建 Thread 对象到使用高级的线程池。本文将详细介绍各种线程创建方法及其适用场景。

## 为什么需要了解不同的线程创建方式？

不同的线程创建方式适用于不同的场景：
- **简单任务**：可以使用 `new Thread()` 快速创建
- **需要返回值**：使用 `Callable` 和 `Future`
- **大量短期任务**：使用线程池提高性能
- **需要线程复用**：使用线程池减少创建销毁开销

## 1. 直接创建线程

### 1.1 继承 Thread 类

这是最基础的线程创建方式：

```java
public class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("线程执行: " + Thread.currentThread().getName());
    }
}

// 使用方式
MyThread thread = new MyThread();
thread.start();
```

**优点**：简单直观
**缺点**：Java 不支持多重继承，如果已经继承了其他类则无法使用

### 1.2 实现 Runnable 接口

更灵活的方式，推荐使用：

```java
public class MyRunnable implements Runnable {
    @Override
    public void run() {
        System.out.println("Runnable 执行: " + Thread.currentThread().getName());
    }
}

// 使用方式
Thread thread = new Thread(new MyRunnable());
thread.start();

// 或者使用 Lambda 表达式（Java 8+）
Thread lambdaThread = new Thread(() -> {
    System.out.println("Lambda 线程执行: " + Thread.currentThread().getName());
});
lambdaThread.start();
```

**优点**：灵活，可以继承其他类，支持 Lambda 表达式
**缺点**：没有返回值，不能抛出受检异常

### 1.3 实现 Callable 接口

需要返回结果时使用：

```java
import java.util.concurrent.Callable;
import java.util.concurrent.FutureTask;

public class MyCallable implements Callable<String> {
    @Override
    public String call() throws Exception {
        Thread.sleep(1000);
        return "任务执行完成";
    }
}

// 使用方式
Callable<String> callable = new MyCallable();
FutureTask<String> futureTask = new FutureTask<>(callable);
Thread thread = new Thread(futureTask);
thread.start();

// 获取结果
String result = futureTask.get();  // 阻塞等待结果
System.out.println("结果: " + result);
```

**优点**：可以返回结果，可以抛出异常
**缺点**：使用稍复杂

## 2. 使用线程池创建线程

对于需要频繁创建线程的场景，使用线程池可以大大提高性能。

### 2.1 临时创建线程（使用 Executors 工厂类）

当你需要临时创建一个线程池来执行一些任务时，可以使用 `Executors` 工厂类提供的方法：

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

// 临时创建一个可缓存线程池
ExecutorService executorService = Executors.newCachedThreadPool();

// 提交任务
executorService.execute(() -> {
    System.out.println("临时线程池执行任务");
});

// 提交多个任务
for (int i = 0; i < 10; i++) {
    final int taskId = i;
    executorService.execute(() -> {
        System.out.println("执行任务 " + taskId + "，线程: " + Thread.currentThread().getName());
    });
}

// 关闭线程池（重要！）
executorService.shutdown();
```

**`Executors.newCachedThreadPool()` 的特点**：
- 创建一个可缓存的线程池
- 线程池大小可以根据需要动态调整
- 空闲线程默认存活 60 秒
- 适用于执行大量短期异步任务的场景
- **注意**：最大线程数为 `Integer.MAX_VALUE`，在高并发场景下可能导致资源耗尽

### 2.2 其他常用临时线程池

```java
// 1. 固定大小线程池
ExecutorService fixedPool = Executors.newFixedThreadPool(5);
// 特点：固定线程数，适用于负载较平稳的场景

// 2. 单线程池
ExecutorService singlePool = Executors.newSingleThreadExecutor();
// 特点：只有一个线程，保证任务顺序执行

// 3. 定时任务线程池
ScheduledExecutorService scheduledPool = Executors.newScheduledThreadPool(3);
// 特点：支持延迟执行和周期性执行

// 4. 工作窃取线程池（Java 8+）
ExecutorService workStealingPool = Executors.newWorkStealingPool();
// 特点：基于 ForkJoinPool，适用于计算密集型任务
```

## 3. 临时创建线程 vs 自定义线程池

### 临时创建线程（使用 Executors）

**适用场景**：
- 快速原型开发
- 简单的测试代码
- 短期的小型任务
- 不需要精细控制的场景

**优点**：
- 使用简单，一行代码即可创建
- 无需关心参数配置
- 快速上手

**缺点**：
- 参数不可控，可能隐藏风险
- `newCachedThreadPool()` 可能创建过多线程
- `newFixedThreadPool()` 使用无界队列可能导致内存溢出

### 自定义线程池（使用 ThreadPoolExecutor）

**适用场景**：
- 生产环境
- 需要精细控制线程池行为
- 高并发场景
- 需要监控和调优的场景

```java
import java.util.concurrent.*;

// 自定义线程池
ThreadPoolExecutor customExecutor = new ThreadPoolExecutor(
    2,                      // corePoolSize：核心线程数
    10,                     // maximumPoolSize：最大线程数
    60, TimeUnit.SECONDS,   // keepAliveTime：空闲线程存活时间
    new ArrayBlockingQueue<>(100),  // workQueue：有界任务队列
    Executors.defaultThreadFactory(),  // threadFactory：线程工厂
    new ThreadPoolExecutor.CallerRunsPolicy()  // handler：拒绝策略
);
```

## 4. 线程创建的常见问题

### 4.1 直接创建线程过多

```java
// ❌ 错误示例：大量创建线程
for (int i = 0; i < 10000; i++) {
    new Thread(() -> {
        // 任务逻辑
    }).start();
}
```

**问题**：
- 创建和销毁线程开销大
- 可能导致系统资源耗尽
- 线程调度开销大

**解决方案**：
- 使用线程池复用线程

### 4.2 忘记关闭线程池

```java
// ❌ 错误示例：创建线程池但忘记关闭
ExecutorService executor = Executors.newCachedThreadPool();
executor.execute(() -> System.out.println("任务执行"));

// 忘记调用 executor.shutdown()
```

**问题**：
- 线程池中的线程不会自动销毁
- 可能导致内存泄漏
- 程序无法正常退出

**解决方案**：
- 确保在程序退出前关闭线程池
- 使用 try-with-resources（如果线程池支持 AutoCloseable）

### 4.3 不合理使用 newCachedThreadPool

```java
// ⚠️ 注意：在高并发场景下谨慎使用
ExecutorService executor = Executors.newCachedThreadPool();

// 如果突然提交大量任务，可能会创建大量线程
for (int i = 0; i < 100000; i++) {
    executor.execute(() -> {
        // 短期任务
    });
}
```

**风险**：
- 可能创建大量线程（最大 Integer.MAX_VALUE）
- 消耗大量系统资源
- 可能导致系统崩溃

**替代方案**：
- 使用有界线程池
- 设置合理的队列容量

## 5. 最佳实践

### 5.1 临时任务的推荐做法

对于简单的临时任务，推荐以下方式：

```java
// 方案1：使用虚拟线程（Java 21+）
try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(() -> System.out.println("虚拟线程执行"));
}

// 方案2：使用简单的线程池
ExecutorService executor = Executors.newFixedThreadPool(Math.min(10, Runtime.getRuntime().availableProcessors()));
try {
    executor.execute(() -> {
        // 任务逻辑
    });
} finally {
    executor.shutdown();
}

// 方案3：直接创建线程（适用于非常简单的场景）
Thread thread = new Thread(() -> {
    System.out.println("直接创建线程执行");
});
thread.start();
```

### 5.2 线程命名规范

为了方便调试和问题排查，建议为线程设置有意义的名称：

```java
// 为直接创建的线程命名
Thread thread = new Thread(() -> {
    // 任务逻辑
}, "my-task-thread");

// 为线程池中的线程命名
ThreadFactory namedThreadFactory = new ThreadFactory() {
    private final AtomicInteger counter = new AtomicInteger(1);
    
    @Override
    public Thread newThread(Runnable r) {
        return new Thread(r, "my-pool-thread-" + counter.getAndIncrement());
    }
};

ExecutorService executor = Executors.newFixedThreadPool(3, namedThreadFactory);
```

### 5.3 异常处理

线程中的异常如果不处理，可能会导致线程意外终止：

```java
// 捕获线程中的异常
Thread thread = new Thread(() -> {
    try {
        // 任务逻辑
    } catch (Exception e) {
        System.err.println("线程执行异常: " + e.getMessage());
        // 记录日志、发送告警等
    }
});

// 或者设置未捕获异常处理器
Thread.setDefaultUncaughtExceptionHandler((thread1, throwable) -> {
    System.err.println("线程 " + thread1.getName() + " 发生未捕获异常: " + throwable.getMessage());
});
```

## 6. 总结

| 创建方式 | 适用场景 | 优点 | 缺点 |
|---------|---------|------|------|
| 继承 Thread | 简单的学习示例 | 简单直观 | 无法继承其他类 |
| 实现 Runnable | 大多数场景 | 灵活，可继承其他类 | 无返回值 |
| 实现 Callable | 需要返回结果 | 有返回值，可抛异常 | 使用复杂 |
| Executors.newCachedThreadPool() | 大量短期异步任务 | 自动调整大小 | 可能创建过多线程 |
| Executors.newFixedThreadPool() | 负载平稳的任务 | 线程数固定 | 无界队列可能内存溢出 |
| ThreadPoolExecutor | 生产环境 | 完全可控 | 配置复杂 |

**选择建议**：
- **学习/测试**：使用 `Executors` 工厂类快速创建
- **生产环境**：使用 `ThreadPoolExecutor` 自定义配置
- **简单任务**：直接创建 `Thread` 或使用 `Runnable`
- **需要结果**：使用 `Callable` 和 `Future`
- **Java 21+**：考虑使用虚拟线程

记住：对于临时创建线程的需求，`Executors.newCachedThreadPool()` 是一个方便的选择，但在高并发场景下需要谨慎使用。在生产环境中，建议使用自定义的 `ThreadPoolExecutor` 以获得更好的控制和性能。