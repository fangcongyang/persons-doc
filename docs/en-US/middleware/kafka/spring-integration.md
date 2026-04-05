---
sidebar_position: 2
tags: [kafka, spring]
---

# Spring Kafka 集成

## 集成

> 引入kafka依赖

```xml
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
</dependency>
```

## 使用

### 消费者及生产者配置

```java title="消费者配置实体类.java"
package com.yinhai.push.common.entity;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties("kafka.consumer")
@Data
public class KafkaConsumerConfig {
    // 自动提交间隔毫秒数
    private int autoCommitInterval;
    // 集群地址
    private String bootstrapServers;
    // 分组id
    private String groupId;
    // 自动提交
    private String enableAutoCommit;
    // 最大拉取数据数量
    private int maxPollRecords;
    // 自动将偏移重置为最新偏移量，如果没有找到消费者组的先前偏移量，则向用户抛出异常
    private String autoOffsetReset;
    // 检测消费者故障超时
    private String sessionTimeoutMs;
    // 手动提交设置与poll的心跳数,如果消息队列中没有消息，等待毫秒后，调用poll()方法。如果队列中有消息，立即消费消息，每次消费的消息的多少可以通过max.poll.records配置。
    private int maxPollInterval;
    // 设置拉取数据的大小
    private int maxPartitionFetchBytes;
}

```

```yml title="配置文件"
kafka:
  consumer:
    autoCommitInterval: 1000 #自动提交的间隔时间
    bootstrapServers: 127.0.0.1:9092
    groupId: dataPush
    enableAutoCommit: false #是否开启自动提交
    maxPollRecords: 20 #批量消费一次最大拉取的数据量
    autoOffsetReset: latest #最早未被消费的offset earliest
    sessionTimeoutMs: 15000 #连接超时时间
    maxPollInterval: 400 #手动提交设置与poll的心跳数,如果消息队列中没有消息，等待毫秒后，调用poll()方法。如果队列中有消息，立即消费消息，每次消费的消息的多少可以通过max.poll.records配置。
    maxPartitionFetchBytes: 15728640 #设置拉取数据的大小,15M
```

 - 生产者配置

```java
package com.yinhai.push.common.entity;


import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties("kafka.producer")
@Data
public class KafkaProducerConfig {
    /**
     * 集群地址
     */
    private String bootstrapServers;
    /**
     * 重试配置
     */
    private String retries;
    /**
     * 批量提交数据大小
     */
    private String batchSize;
    /**
     * 数据延迟提交ms数,如果未到延迟ms数，数据量达到批量提交大小时，会直接提交数据
     */
    private String lingerMs;
    /**
     * 缓冲内存配置
     */
    private String bufferMemory;
    /**
     *  副本数 建议与集群数一致
     */
    private Integer replicationFactor;
}

```

```yml title="配置文件"
kafka:
  producer:
    bootstrapServers: 127.0.0.1:9092
    retries: 0
    batchSize: 10485760
    lingerMs: 200
    bufferMemory: 33554432
    replicationFactor: 1 #副本数 建议与集群数一致
```

#### 主配置
```java
package com.yinhai.push.common.config;

import com.yinhai.push.common.entity.KafkaConsumerConfig;
import com.yinhai.push.common.entity.KafkaProducerConfig;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.config.KafkaListenerContainerFactory;
import org.springframework.kafka.core.*;
import org.springframework.kafka.listener.ConcurrentMessageListenerContainer;
import org.springframework.kafka.listener.ConsumerAwareListenerErrorHandler;
import org.springframework.kafka.listener.ContainerProperties;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableKafka
@Slf4j
public class KafkaConfig {
    @Resource
    private KafkaConsumerConfig kafkaConsumerConfig;
    @Resource
    private KafkaProducerConfig kafkaProducerConfig;

    @Bean //创建一个kafka管理类，相当于rabbitMQ的管理类rabbitAdmin,没有此bean无法自定义的使用adminClient创建topic
    public KafkaAdmin kafkaAdmin() {
        Map<String, Object> props = new HashMap<>();
        //配置Kafka实例的连接地址
        //kafka的地址，不是zookeeper
        props.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaConsumerConfig.getBootstrapServers());
        return new KafkaAdmin(props);
    }

    @Bean  //kafka客户端，在spring中创建这个bean之后可以注入并且创建topic
    public AdminClient adminClient() {
        return AdminClient.create(kafkaAdmin().getConfig());
    }

    @Bean
    public NewTopic initialTopic() {
        return new NewTopic("push-data-service-handle",4, kafkaProducerConfig.getReplicationFactor().shortValue());
    }

    @Bean
    KafkaListenerContainerFactory<ConcurrentMessageListenerContainer<String, String>> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, String> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        factory.setConcurrency(4);
        factory.setBatchListener(true);
        factory.getContainerProperties().setPollTimeout(kafkaConsumerConfig.getMaxPollInterval());
        //设置提交偏移量的方式， MANUAL_IMMEDIATE 表示消费一条提交一次；MANUAL表示批量提交一次
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL);
        return factory;
    }

    @Bean
    public ConsumerFactory<String, String> consumerFactory() {
        return new DefaultKafkaConsumerFactory<>(consumerConfigs());
    }

    /**
     * 消费者配置
     * @return
     */
    @Bean
    public Map<String, Object> consumerConfigs() {
        Map<String, Object> props = new HashMap<>();
        //自动提交间隔毫秒数
        props.put(ConsumerConfig.AUTO_COMMIT_INTERVAL_MS_CONFIG, kafkaConsumerConfig.getAutoCommitInterval());
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaConsumerConfig.getBootstrapServers());
        props.put(ConsumerConfig.GROUP_ID_CONFIG, kafkaConsumerConfig.getGroupId());
        //自动提交配置
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, kafkaConsumerConfig.getEnableAutoCommit());
        props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, kafkaConsumerConfig.getMaxPollRecords());
        //自动将偏移重置为最新偏移量，如果没有找到消费者组的先前偏移量，则向用户抛出异常
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, kafkaConsumerConfig.getAutoOffsetReset());
        //检测消费者故障超时
        props.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, kafkaConsumerConfig.getSessionTimeoutMs());
        props.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, kafkaConsumerConfig.getMaxPollInterval());
        props.put(ConsumerConfig.MAX_PARTITION_FETCH_BYTES_CONFIG, kafkaConsumerConfig.getMaxPartitionFetchBytes());
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        return props;
    }

    @Bean
    public ProducerFactory<String, String> producerFactory() {
        return new DefaultKafkaProducerFactory<>(producerConfigs());
    }

    /**
     * 生产者配置
     * @return
     */
    @Bean
    public Map<String, Object> producerConfigs() {
        Map<String, Object> props = new HashMap<>();
        //kafka服务器地址
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaProducerConfig.getBootstrapServers());
        //重试配置
        props.put(ProducerConfig.RETRIES_CONFIG, kafkaProducerConfig.getRetries());
        //批量提交数据大小
        props.put(ProducerConfig.BATCH_SIZE_CONFIG, kafkaProducerConfig.getBatchSize());
        props.put(ProducerConfig.MAX_REQUEST_SIZE_CONFIG, "12695150");
        //数据延迟提交ms数,如果未到延迟ms数，数据量达到批量提交大小时，会直接提交数据
        props.put(ProducerConfig.LINGER_MS_CONFIG, kafkaProducerConfig.getLingerMs());
        //缓冲内存配置
        props.put(ProducerConfig.BUFFER_MEMORY_CONFIG, kafkaProducerConfig.getBufferMemory());
        props.put(ProducerConfig.ACKS_CONFIG, "1");
        // key序列化器
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        // value序列化器
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        return props;
    }

    /**
     * kafka操作bean
     * @return
     */
    @Bean
    public KafkaTemplate<String, String> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }

    /**
     * 异常消费配置
     * @return
     */
    @Bean
    public ConsumerAwareListenerErrorHandler consumerAwareErrorHandler() {
        return (message, exception, consumer) -> {
            log.error("消费异常:{}", message.getPayload());
            return null;
        };
    }
}

```

#### 生产者

- 生产类

```java
package com.yinhai.push.producer;

import com.yinhai.push.common.util.UUIDUtil;
import com.yinhai.push.entity.dto.DataPushReceiveFailDTO;
import com.yinhai.push.service.data.IDataPushReceiveFailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;
import org.springframework.util.concurrent.ListenableFuture;

import javax.annotation.Resource;

/**
 * @Description ：
 * @Author ： fangcy
 * @Date ： 2018/09/14 15:13
 */
@Component
@Slf4j
public class DataPushProducer {

    @Resource
    private KafkaTemplate<String,String> kafkaTemplate;
    @Resource
    private IDataPushReceiveFailService iDataPushReceiveFailService;

    /**
     * push-data-service-handle-消息通知
     * @param
     */
    public void pushDataServiceSuccessMessage(String message){
        try {
            ListenableFuture<SendResult<String, String>> listenableFuture =
                    kafkaTemplate.send("push-data-service-handle", UUIDUtil.getUUID(), message);
            listenableFuture.addCallback(new DataPushListenableFutureCallback(message, iDataPushReceiveFailService));
        } catch (Exception e){
            log.error("请求kafka服务器错误!", e);
            iDataPushReceiveFailService.addDataPushReceiveFail(message);
        }
    }

    /**
     * 带事务控制的消息发送
     */
    public void sendMessage(){
        // 声明事务：后面报错消息不会发出去
        kafkaTemplate.executeInTransaction(operations -> {
            operations.send("push-data-service-handle","test executeInTransaction");
            throw new RuntimeException("fail");
        });

        // 不声明事务：后面报错但前面消息已经发送成功了
        kafkaTemplate.send("push-data-service-handle","test executeInTransaction");
        throw new RuntimeException("fail");
    }

    /**
     * 定时任务处理数据接收失败的数据，push-data-service-handle-消息通知
     * @param
     */
    public void pushDataServiceSuccessMessage(DataPushReceiveFailDTO dto){
        log.info("定时任务处理数据接收失败的数据到kafka服务器");
        ListenableFuture<SendResult<String, String>> listenableFuture =
                kafkaTemplate.send("push-data-service-handle", UUIDUtil.getUUID(), dto.getData());
        listenableFuture.addCallback(success -> {
            log.info("kafka服务器接收消息成功,删除数据接收失败的数据!");
            iDataPushReceiveFailService.removeById(dto.getId());
        }, failure -> {
            log.error("kafka服务器接收消息失败!", failure);
            dto.setRequestFailNum(dto.getRequestFailNum() + 1);
            iDataPushReceiveFailService.updateById(dto);
        });
    }
}

```

- kafka消息发送异步处理类

```java
package com.yinhai.push.producer;

import com.yinhai.push.service.data.IDataPushReceiveFailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.support.SendResult;
import org.springframework.util.concurrent.ListenableFutureCallback;

/**
 * kafka消息发送异步处理类
 */
@Slf4j
public class DataPushListenableFutureCallback implements ListenableFutureCallback<SendResult<String, String>> {
    private String message;
    private IDataPushReceiveFailService iDataPushReceiveFailService;

    DataPushListenableFutureCallback(String message, IDataPushReceiveFailService iDataPushReceiveFailService){
        this.message = message;
        this.iDataPushReceiveFailService = iDataPushReceiveFailService;
    }

    @Override
    public void onFailure(Throwable throwable) {
        log.error("kafka服务器接收消息失败!", throwable);
        iDataPushReceiveFailService.addDataPushReceiveFail(message);
    }

    @Override
    public void onSuccess(SendResult<String, String> stringStringSendResult) {
        log.info("kafka服务器接收消息成功!");
    }
}

```

#### 消费者
```java
package com.yinhai.push.consume;

import com.yinhai.push.service.data.IDataPushService;
import com.yinhai.push.thread.DataPushThread;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.TopicPartition;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.List;

@Component
@Slf4j
public class DataPushConsumer {
    @Resource
    private ThreadPoolTaskExecutor threadPoolTaskExecutor;
    @Resource
    private IDataPushService iDataPushService;

    /**
     * 推送数据消费
     * @param records 记录s
     */
    @KafkaListener(id = "dataPush0", topicPartitions = {@TopicPartition(topic = "push-data-service-handle", partitions = {"0"})}, groupId = "dataPush", errorHandler = "consumerAwareErrorHandler")
    public void dataPushSuccessHandle0(List<ConsumerRecord<String,String>> records){
        log.info("---批量数据推送0 push-data-service-handle");
        records.forEach(record -> {
            threadPoolTaskExecutor.execute(new DataPushThread(record.value(), iDataPushService));
        });
    }

    /**
     * 推送数据消费
     * @param records 记录s
     */
    @KafkaListener(id = "dataPush1", topicPartitions = {@TopicPartition(topic = "push-data-service-handle", partitions = {"1"})}, groupId = "dataPush", errorHandler = "consumerAwareErrorHandler")
    public void dataPushSuccessHandle1(List<ConsumerRecord<String,String>> records){
        log.info("---批量数据推送1 push-data-service-handle");
        records.forEach(record -> {
            threadPoolTaskExecutor.execute(new DataPushThread(record.value(), iDataPushService));
        });
    }

    /**
     * 推送数据消费
     * @param records 记录s
     */
    @KafkaListener(id = "dataPush2", topicPartitions = {@TopicPartition(topic = "push-data-service-handle", partitions = {"2"})}, groupId = "dataPush", errorHandler = "consumerAwareErrorHandler")
    public void dataPushSuccessHandle2(List<ConsumerRecord<String,String>> records){
        log.info("---批量数据推送2 push-data-service-handle");
        records.forEach(record -> {
            threadPoolTaskExecutor.execute(new DataPushThread(record.value(), iDataPushService));
        });
    }

    /**
     * 推送数据消费
     * @param records 记录s
     */
    @KafkaListener(id = "dataPush3", topicPartitions = {@TopicPartition(topic = "push-data-service-handle", partitions = {"3"})}, groupId = "dataPush", errorHandler = "consumerAwareErrorHandler")
    public void dataPushSuccessHandle3(List<ConsumerRecord<String,String>> records){
        log.info("---批量数据推送3 push-data-service-handle");
        records.forEach(record -> {
            threadPoolTaskExecutor.execute(new DataPushThread(record.value(), iDataPushService));
        });
    }
}
```

## Kafka 事务配置

```java
@Bean
public KafkaTransactionManager<String, String> kafkaTransactionManager() {
    return new KafkaTransactionManager<>(producerFactory());
}
```

## 参考文章

https://www.cnblogs.com/liyong888/p/16151399.html
