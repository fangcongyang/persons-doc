# JSON

## 依赖

```xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <scope>compile</scope>
</dependency>
<dependency>
    <groupId>com.fasterxml.jackson.datatype</groupId>
    <artifactId>jackson-datatype-jdk8</artifactId>
    <scope>compile</scope>
</dependency>
<dependency>
    <groupId>com.fasterxml.jackson.datatype</groupId>
    <artifactId>jackson-datatype-jsr310</artifactId>
    <scope>compile</scope>
</dependency>
```

## 代码封装

```java
import com.alibaba.excel.EasyExcelFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public class JSONUtil {
    private static final Logger LOGGER = LoggerFactory.getLogger(JSONUtil.class);
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

## FastJSON 循环引用问题

### 问题描述

在使用 `com.alibaba.fastjson` 进行 JSON 序列化时，具有相同引用的对象会被转换为 `$ref` 引用，导致前端解析出现错误。

### 问题重现

先定义一个 `People` 类：

```java
public class People {
    public Integer id;
    public String name;
    public Integer age;
    public People like;
 
    public People(Integer id, String name, Integer age, People like) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.like = like;
    }
    
    public void show() {
        System.out.println("name:" + this.name);
        System.out.println("   id:" + this.id);
        System.out.println("   age:" + this.age);
        if (this.like != null) {
            System.out.println("   like:" + this.like.name + "\n");
        } else {
            System.out.println();
        }
    }
}
```

创建一个 Map 并添加数据：

```java
public class Test {
    public static void main(String[] args) {
        People p1 = new People(1, "张三", 11, null);
        People p2 = new People(2, "李四", 12, p1);
        People p3 = new People(3, "王五", 13, p1);
        Map&lt;String, People&gt; map = new HashMap&lt;String, People&gt;(); 

        map.put(p1.name, p1);
        map.put(p2.name, p2);
        map.put(p3.name, p3);
        map.put("宋六", p3);

        map.get(p1.name).show();
        map.get(p2.name).show();
        map.get(p3.name).show();
        map.get("宋六").show();
        System.out.println(map);
        System.out.println(p2.like + " | " + p3.like);
    }
}
```

运行结果如下：

```text
name:张三
   id:1
   age:11

name:李四
   id:2
   age:12
   like:张三

name:王五
   id:3
   age:13
   like:张三

name:王五
   id:3
   age:13
   like:张三
{李四=lin.People@15db9742, 张三=lin.People@6d06d69c, 王五=lin.People@7852e922, 宋六=lin.People@7852e922}
lin.People@6d06d69c | lin.People@6d06d69c
```

**注意**：王五和宋六是相同的对象，所以他们的引用地址也是完全相同的；李四和王五的 `like` 是相同的，所以他们的 `like` 的引用地址也是完全相同的。

现在把 map 转为 JSON：

```java
String text = JSON.toJSONString(map);
JSONObject json = JSONObject.parseObject(text);
System.out.println(json);
```

运行结果如下：

```json
{
  "李四": {
    "like": {"name": "张三", "id": 1, "age": 11},
    "name": "李四",
    "id": 2,
    "age": 12
  },
  "张三": {
    "$ref": "$.李四.like"
  },
  "王五": {
    "like": {"$ref": "$.李四.like"},
    "name": "王五",
    "id": 3,
    "age": 13
  },
  "宋六": {
    "$ref": "$.王五"
  }
}
```

可以看到，具有相同引用的对象第二次出现时，会变成 `$ref` + 第一次出现的位置。

### 原因分析

出现这个问题的原因是 FastJSON 有循环引用检测机制：

- **循环引用**：当一个对象包含另一个对象时，FastJSON 会把该对象解析成引用
- **相同对象引用**：当一个对象和另一个对象完全相同时，FastJSON 同样会把该对象解析成引用

### 解决办法

#### 方法 1：禁用循环引用检测

使用 `SerializerFeature.DisableCircularReferenceDetect` 来禁止循环引用检测：

```java
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.serializer.SerializerFeature;

public class FastJsonFix {
    public static void main(String[] args) {
        People p1 = new People(1, "张三", 11, null);
        People p2 = new People(2, "李四", 12, p1);
        People p3 = new People(3, "王五", 13, p1);
        Map&lt;String, People&gt; map = new HashMap&lt;String, People&gt;(); 

        map.put(p1.name, p1);
        map.put(p2.name, p2);
        map.put(p3.name, p3);
        map.put("宋六", p3);

        // 禁用循环引用检测
        String text = JSON.toJSONString(map, SerializerFeature.DisableCircularReferenceDetect);
        System.out.println(text);
    }
}
```

#### 方法 2：深度复制对象

通过深度复制对象，打破对象引用关系：

```java
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

public class FastJsonDeepCopy {
    public static void main(String[] args) {
        People p1 = new People(1, "张三", 11, null);
        People p2 = new People(2, "李四", 12, p1);
        People p3 = new People(3, "王五", 13, p1);
        
        // 方法：先序列化为 JSON，再反序列化回来，实现深度复制
        Map&lt;String, People&gt; originalMap = new HashMap&lt;String, People&gt;();
        originalMap.put(p1.name, p1);
        originalMap.put(p2.name, p2);
        originalMap.put(p3.name, p3);
        originalMap.put("宋六", p3);
        
        // 深度复制：JSON 序列化 + 反序列化
        String tempJson = JSON.toJSONString(originalMap);
        Map&lt;String, People&gt; deepCopyMap = JSON.parseObject(tempJson, 
            new TypeReference&lt;Map&lt;String, People&gt;&gt;(){});
        
        // 现在序列化深度复制后的对象
        String result = JSON.toJSONString(deepCopyMap);
        System.out.println(result);
    }
}
```

#### 方法 3：使用 Jackson 替代 FastJSON

如果你可以更换 JSON 库，推荐使用 Jackson，它默认不会有循环引用问题：

```java
import com.fasterxml.jackson.databind.ObjectMapper;

public class JacksonAlternative {
    public static void main(String[] args) throws Exception {
        People p1 = new People(1, "张三", 11, null);
        People p2 = new People(2, "李四", 12, p1);
        People p3 = new People(3, "王五", 13, p1);
        Map&lt;String, People&gt; map = new HashMap&lt;String, People&gt;(); 

        map.put(p1.name, p1);
        map.put(p2.name, p2);
        map.put(p3.name, p3);
        map.put("宋六", p3);

        ObjectMapper objectMapper = new ObjectMapper();
        String json = objectMapper.writeValueAsString(map);
        System.out.println(json);
    }
}
```

### FastJSON 最佳实践

1. **优先考虑禁用循环引用检测**：这是最简单直接的解决方法
2. **在数据传输层处理**：在 DTO（Data Transfer Object）层处理，避免直接暴露实体对象
3. **考虑使用 Jackson**：如果项目允许，Jackson 的默认行为更符合预期
4. **明确序列化范围**：使用 `@JSONField(serialize = false)` 避免不必要的字段序列化

```