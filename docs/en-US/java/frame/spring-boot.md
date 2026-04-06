# Spring Boot

## 获取配置值

:::tip

推荐使用 `@ConfigurationProperties` 方式，配置变更会直接编译报错提示，而 `@Value` 方法不会。

`@ConfigurationProperties` 需要引入下列依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>
```

:::

### @ConfigurationProperties

#### 代码示例

```java
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties("config")
@Data
public class Config {
    private String test;
    private List<ConfigItem> configItems;

    public class ConfigItem {
        private String name;
        private String value;
    }
}
```

#### YML 文件示例

```yaml
config:
    test: 123
    # 集合配置示例
    configItems:
      - name: xxx
        value: 1
      - name: xxxxx
        value: 2
```

#### Properties 文件示例

```properties
config.configItems[0].name=xxx
config.configItems[0].value=1
config.configItems[1].name=xxxx
config.configItems[1].ykz10value8=2
```

---

### @Value

#### 代码示例

```java
@Value("${config.test}")
private String test;
```

#### YML 文件示例

```yaml
config:
    test: 123
```

---

## Nacos 禁用

:::tip

`application` 配置文件必须存在，或者以 `-Dspring.profiles.active=test` 启动，否则不生效。

```yaml title="application.yml"
spring:
  profiles:
    active: test
```

:::

:::caution

如果 Nacos 启动，且 `application` 配置文件存在。Spring Boot 会合并两个配置类，如果本地有排除自动化类操作会出现问题。

```yaml title="application.yml"
spring:
  profiles:
    active: test
```

:::

### 禁用示例配置

```yaml title="bootstrap.yml"
spring:
  cloud:
    nacos:
      discovery:
        namingClientBeatThreadCount: 4
        namingPollingThreadCount: 4
        group: ARSENAL
        server-addr: 127.0.0.1:8848
        enabled: false
      config:
        server-addr: 127.0.0.1:8848
        file-extension: yaml
        group: ARSENAL
        refresh-enabled: true
        namespace: b37cca70-1b62-4027-a2b7-50d43f2cfcc0
        enabled: false
```
