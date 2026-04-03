# Java 实用代码

## 获取项目根路径

### 方法一：使用 System.getProperty

```java
public class ProjectPathUtil {
    
    /**
     * 获取项目根路径
     * @return 项目根路径
     */
    public static String getProjectRootPath() {
        return System.getProperty("user.dir");
    }
    
    public static void main(String[] args) {
        String projectPath = getProjectRootPath();
        System.out.println("项目根路径: " + projectPath);
    }
}
```

### 方法二：使用 ClassLoader

```java
import java.io.File;

public class ProjectPathUtil {
    
    /**
     * 通过 ClassLoader 获取项目根路径
     * @return 项目根路径
     */
    public static String getProjectRootPathByClassLoader() {
        String classPath = ProjectPathUtil.class.getProtectionDomain()
                .getCodeSource().getLocation().getPath();
        
        // 处理路径中的空格问题
        try {
            classPath = java.net.URLDecoder.decode(classPath, "UTF-8");
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        File file = new File(classPath);
        
        // 如果是 jar 包，返回 jar 包所在目录
        if (classPath.endsWith(".jar")) {
            return file.getParent();
        }
        
        // 如果是 class 文件，找到 target/classes 或 build/classes 的父目录
        while (file != null) {
            if (file.getName().equals("target") || file.getName().equals("build")) {
                return file.getParent();
            }
            file = file.getParentFile();
        }
        
        return classPath;
    }
}
```

### 方法三：Spring Boot 项目中获取

```java
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ProjectPathUtil {
    
    @Value("${project.root:${user.dir}}")
    private String projectRoot;
    
    /**
     * 获取项目根路径
     * @return 项目根路径
     */
    public String getProjectRootPath() {
        return projectRoot;
    }
}
```

## Java 执行命令

### 执行简单命令

```java
import java.io.BufferedReader;
import java.io.InputStreamReader;

public class CommandExecutor {
    
    /**
     * 执行系统命令
     * @param command 命令字符串
     * @return 命令执行结果
     */
    public static String executeCommand(String command) {
        StringBuilder output = new StringBuilder();
        
        try {
            Process process = Runtime.getRuntime().exec(command);
            
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream()));
            
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
            
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                BufferedReader errorReader = new BufferedReader(
                    new InputStreamReader(process.getErrorStream()));
                StringBuilder errorOutput = new StringBuilder();
                while ((line = errorReader.readLine()) != null) {
                    errorOutput.append(line).append("\n");
                }
                throw new RuntimeException("命令执行失败: " + errorOutput.toString());
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("执行命令时出错: " + e.getMessage());
        }
        
        return output.toString();
    }
    
    public static void main(String[] args) {
        // 示例：执行 ls 命令（Linux/Mac）或 dir 命令（Windows）
        String command = System.getProperty("os.name").toLowerCase().contains("win") 
            ? "dir" 
            : "ls -la";
        
        String result = executeCommand(command);
        System.out.println("命令执行结果:\n" + result);
    }
}
```

### 使用 ProcessBuilder

```java
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Arrays;
import java.util.List;

public class CommandExecutor {
    
    /**
     * 使用 ProcessBuilder 执行命令
     * @param commands 命令列表
     * @return 命令执行结果
     */
    public static String executeCommandWithBuilder(List<String> commands) {
        StringBuilder output = new StringBuilder();
        
        try {
            ProcessBuilder processBuilder = new ProcessBuilder(commands);
            processBuilder.redirectErrorStream(true); // 合并错误流和输出流
            
            Process process = processBuilder.start();
            
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream()));
            
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
            
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new RuntimeException("命令执行失败，退出码: " + exitCode);
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("执行命令时出错: " + e.getMessage());
        }
        
        return output.toString();
    }
    
    public static void main(String[] args) {
        // 示例：执行 ping 命令
        List<String> commands = Arrays.asList("ping", "-c", "4", "localhost");
        String result = executeCommandWithBuilder(commands);
        System.out.println("ping 结果:\n" + result);
    }
}
```

## 集合优化

### ArrayList 初始化优化

```java
import java.util.ArrayList;
import java.util.List;

public class CollectionOptimization {
    
    /**
     * 预估容量初始化 ArrayList
     * @param expectedSize 预期大小
     * @return 初始化后的 ArrayList
     */
    public static <T> List<T> createArrayListWithCapacity(int expectedSize) {
        return new ArrayList<>(expectedSize);
    }
    
    /**
     * 使用 Arrays.asList 创建列表后转为 ArrayList
     * @param elements 元素数组
     * @return ArrayList
     */
    @SafeVarargs
    public static <T> List<T> createArrayListFromElements(T... elements) {
        return new ArrayList<>(java.util.Arrays.asList(elements));
    }
}
```

### HashMap 初始化优化

```java
import java.util.HashMap;
import java.util.Map;

public class CollectionOptimization {
    
    private static final float DEFAULT_LOAD_FACTOR = 0.75f;
    
    /**
     * 预估容量初始化 HashMap
     * @param expectedSize 预期大小
     * @return 初始化后的 HashMap
     */
    public static <K, V> Map<K, V> createHashMapWithCapacity(int expectedSize) {
        // 计算合适的初始容量：expectedSize / loadFactor + 1
        int initialCapacity = (int) (expectedSize / DEFAULT_LOAD_FACTOR) + 1;
        return new HashMap<>(initialCapacity);
    }
}
```

### 使用 Stream 优化集合操作

```java
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class CollectionOptimization {
    
    /**
     * 使用 Stream 过滤列表
     * @param list 原列表
     * @param predicate 过滤条件
     * @return 过滤后的列表
     */
    public static <T> List<T> filterList(List<T> list, 
                                           java.util.function.Predicate<T> predicate) {
        return list.stream()
                   .filter(predicate)
                   .collect(Collectors.toList());
    }
    
    /**
     * 使用 Stream 转换列表
     * @param list 原列表
     * @param mapper 转换函数
     * @return 转换后的列表
     */
    public static <T, R> List<R> transformList(List<T> list,
                                                 java.util.function.Function<T, R> mapper) {
        return list.stream()
                   .map(mapper)
                   .collect(Collectors.toList());
    }
    
    /**
     * 使用 Stream 将列表转为 Map
     * @param list 原列表
     * @param keyMapper Key 映射函数
     * @param valueMapper Value 映射函数
     * @return 转换后的 Map
     */
    public static <T, K, V> Map<K, V> listToMap(List<T> list,
                                                   java.util.function.Function<T, K> keyMapper,
                                                   java.util.function.Function<T, V> valueMapper) {
        return list.stream()
                   .collect(Collectors.toMap(keyMapper, valueMapper));
    }
}
```

## 函数式编程

### 使用 Optional 处理空值

```java
import java.util.Optional;

public class FunctionalProgramming {
    
    /**
     * 使用 Optional 安全获取值
     * @param value 可能为 null 的值
     * @param defaultValue 默认值
     * @return 安全的值
     */
    public static <T> T getValueOrDefault(T value, T defaultValue) {
        return Optional.ofNullable(value).orElse(defaultValue);
    }
    
    /**
     * 使用 Optional 链式调用
     * @param user 用户对象
     * @return 用户的街道地址
     */
    public static String getUserStreet(User user) {
        return Optional.ofNullable(user)
                       .map(User::getAddress)
                       .map(Address::getStreet)
                       .orElse("Unknown");
    }
    
    // 示例类
    static class User {
        private Address address;
        public Address getAddress() { return address; }
    }
    
    static class Address {
        private String street;
        public String getStreet() { return street; }
    }
}
```

### 使用 Lambda 表达式

```java
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

public class FunctionalProgramming {
    
    /**
     * 使用 Lambda 排序
     * @param list 列表
     * @param comparator 比较器
     * @return 排序后的列表
     */
    public static <T> List<T> sortList(List<T> list, Comparator<T> comparator) {
        list.sort(comparator);
        return list;
    }
    
    public static void main(String[] args) {
        List<String> names = Arrays.asList("Charlie", "Alice", "Bob");
        
        // 按字母顺序排序
        sortList(names, (a, b) -> a.compareTo(b));
        System.out.println("按字母排序: " + names);
        
        // 按长度排序
        sortList(names, (a, b) -> Integer.compare(a.length(), b.length()));
        System.out.println("按长度排序: " + names);
    }
}
```

### 使用函数接口

```java
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;

public class FunctionalProgramming {
    
    /**
     * 使用 Predicate 进行判断
     */
    public static <T> boolean testPredicate(T value, Predicate<T> predicate) {
        return predicate.test(value);
    }
    
    /**
     * 使用 Function 进行转换
     */
    public static <T, R> R applyFunction(T value, Function<T, R> function) {
        return function.apply(value);
    }
    
    /**
     * 使用 Consumer 进行消费
     */
    public static <T> void acceptConsumer(T value, Consumer<T> consumer) {
        consumer.accept(value);
    }
    
    /**
     * 使用 Supplier 进行提供
     */
    public static <T> T getFromSupplier(Supplier<T> supplier) {
        return supplier.get();
    }
    
    public static void main(String[] args) {
        // Predicate 示例
        boolean isEven = testPredicate(4, n -> n % 2 == 0);
        System.out.println("4 是偶数吗? " + isEven);
        
        // Function 示例
        String str = applyFunction(123, n -> "Number: " + n);
        System.out.println(str);
        
        // Consumer 示例
        acceptConsumer("Hello", s -> System.out.println("Message: " + s));
        
        // Supplier 示例
        double random = getFromSupplier(() -> Math.random());
        System.out.println("随机数: " + random);
    }
}
```

## 总结

本文档提供了 Java 开发中常用的实用代码片段，包括：

1. **获取项目根路径** - 多种方法适应不同场景
2. **Java 执行命令** - 简单命令和 ProcessBuilder 的使用
3. **集合优化** - ArrayList 和 HashMap 的初始化优化，Stream 操作
4. **函数式编程** - Optional、Lambda 表达式和函数接口的使用

这些代码片段可以直接在项目中使用，提高开发效率。
