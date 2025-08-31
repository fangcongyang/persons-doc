
## 常用函数式接口

### 三参数函数式接口

```java
@FunctionalInterface
public interface TriFunction<T, U, V, R> {
    R apply(T t, U u, V v);
}
```

### compose

compose 方法定义如下：

```java
default <V> Function<V, R> compose(Function<? super V, ? extends T> before) {
    return (V v) -> apply(before.apply(v));
}
```

+ T 是当前函数的输入类型。

+ R 是当前函数的输出类型。

+ V 是另一个函数（before）的输入类型。

它的作用是先执行 before 函数，然后将 before 的结果传递给当前的函数。

```java
import java.util.function.Function;

public class ComposeExample {

    public static void main(String[] args) {
        // 定义两个函数
        Function<String, Integer> toInteger = Integer::valueOf;  // 将字符串转换为整数
        Function<Integer, Integer> addOne = x -> x + 1;  // 给整数加1

        // 使用compose将函数组合：先将字符串转换为整数，再加1
        Function<String, Integer> convertAndAddOne = addOne.compose(toInteger);

        // 测试组合后的函数
        String input = "5";
        Integer result = convertAndAddOne.apply(input);  // 结果是6
        System.out.println("Result: " + result);
    }
}
```