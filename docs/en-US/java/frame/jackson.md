## 引入依赖

```xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.13.0</version>
</dependency>
```

## 工具类代码

```java
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

public class FcUtil {
    private static final Logger LOGGER = LoggerFactory.getLogger(FcUtil.class);
    public static final ObjectMapper SIMPLE_OBJECT_MAPPER = new ObjectMapper();

    static {
        //允许不带引号
        SIMPLE_OBJECT_MAPPER.configure(JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
        SIMPLE_OBJECT_MAPPER.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    public static <T> T readTypeReferenceValue(String value, TypeReference<T> typeReference) {
        try {
            return SIMPLE_OBJECT_MAPPER.readValue(value, typeReference);
        } catch (IOException e) {
            throw new RuntimeException("json字符串转换指定类型数据失败", e);
        }
    }

    public static <T, R> Map<T, R> objectToMap(Object value, Class<T> keyClass, Class<R> valueClass) {
        return SIMPLE_OBJECT_MAPPER.convertValue(value,
                SIMPLE_OBJECT_MAPPER.getTypeFactory().constructParametricType(Map.class, keyClass, valueClass));
    }

    public static String writeValueAsString(Object value) {
        try {
            return SIMPLE_OBJECT_MAPPER.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("对象转换json字符串失败", e);
        }
    }

    public static <T> T readValue(String value, Class<T> innerClass) {
        try {
            return SIMPLE_OBJECT_MAPPER.readValue(value, innerClass);
        } catch (IOException e) {
            throw new RuntimeException("json字符串转换指定类型数据失败", e);
        }
    }

    public static <T> List<T> readListValue(String value, Class<T> innerClass) {
        try {
            return SIMPLE_OBJECT_MAPPER.readValue(value,
                    SIMPLE_OBJECT_MAPPER.getTypeFactory().constructParametricType(List.class, innerClass));
        } catch (IOException e) {
            throw new RuntimeException("json字符串转换集合对象数据失败", e);
        }
    }

}

```

## 常见问题

### 如何解决循环引用问题

```java
// 注解解决循环引用问题
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class User {
    private Long id;
    private String name;
    private Set<Role> roles;
}

// 配置 ObjectMapper 处理循环引用
ObjectMapper mapper = new ObjectMapper();
mapper.enable(SerializationFeature.WRITE_SELF_REFERENCES_AS_NULL);
mapper.enable(DeserializationFeature.ACCEPT_EMPTY_ARRAY_AS_NULL_OBJECT);
```