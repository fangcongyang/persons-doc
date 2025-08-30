## 引入依赖

```xml
<dependency>
    <groupId>io.reactivex.rxjava2</groupId>
    <artifactId>rxjava</artifactId>
    <version>2.2.21</version>
</dependency>
```

## 使用示例

### 多线程开启任务，单线程观察结果

```java
try {
    Kc21ClosableIterator kc21ClosableIterator = monitorClientBusiness.getKc21Iterator(taskDomain);
    Flowable.fromIterable(() -> kc21ClosableIterator)
            .takeUntil(stopSignal.toFlowable(BackpressureStrategy.LATEST)) //中断信号用于控制任务中断
            .flatMap(kc21Domain ->
                    Flowable.just(kc21Domain)
                    .subscribeOn(Schedulers.from(threadPoolTaskExecutor)) //指定线程池
                    .doOnNext(v -> {
                        long summitedCount = taskDomain.getSubmittedCount().addAndGet(1L);
                        if (logger.isInfoEnabled() && summitedCount % 1000 == 0) {
                            //每100条记录，执行一次过程统计
                            printTaskState();
                        }
                        //获取审核场景
                        String scenes = monitorClientBusiness.getScenesByAka130(v.getAka130());
                        MonitorClientCheckBusiness monitorClientCheckBusiness = monitorClientBusiness.generateMonitorClientCheckBusiness(taskDomain, scenes);
                        monitorClientCheckBusiness.doCheck(v);
                    }))
            .observeOn(Schedulers.single())// 在单一线程上观察结果
            .subscribe(
                    result -> {},
                    e -> {
                        taskDomain.setErrorMsg(e.getMessage());
                        logger.error("", e);
                        monitorClientBusiness.afterBatchExecute(taskDomain, threadState);
                    },
                    () -> {
                        kc21ClosableIterator.close();
                        logger.info("当前任务taskID[" + taskDomain.getTaskId() + "]执行完成");
                        monitorClientBusiness.afterBatchExecute(taskDomain, threadState);
                    });
} catch (Exception e) {
    taskDomain.setErrorMsg(e.getMessage());
    logger.error("", e);
    monitorClientBusiness.afterBatchExecute(taskDomain, threadState);
}
```
