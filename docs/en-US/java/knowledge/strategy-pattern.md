
---
sidebar_position: 3
tags: [java]
---

# 策略模式

&gt; 定义一系列的算法，把它们一个个封装起来，并且使它们可相互替换。本模式使得算法可独立于使用它的客户而变化。

策略模式：Strategy，是指，定义一组算法，并把其封装到一个对象中。然后在运行时，可以灵活的使用其中的一个算法。

## 策略模式概述

策略模式在Java标准库中应用非常广泛，我们以排序为例，看看如何通过 `Arrays.sort()` 实现忽略大小写排序：

```java
import java.util.Arrays;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        String[] array = { "apple", "Pear", "Banana", "orange" };
        Arrays.sort(array, String::compareToIgnoreCase);
        System.out.println(Arrays.toString(array));
    }
}
```

如果我们想忽略大小写排序，就传入 `String::compareToIgnoreCase`，如果我们想倒序排序，就传入 `(s1, s2) -&gt; -s1.compareTo(s2)`，这个比较两个元素大小的算法就是策略。

我们观察 `Arrays.sort(T[] a, Comparator&lt;? super T&gt; c)` 这个排序方法，它在内部实现了 TimSort 排序，但是，排序算法在比较两个元素大小的时候，需要借助我们传入的 `Comparator` 对象，才能完成比较。因此，这里的策略是指比较两个元素大小的策略，可以是忽略大小写比较，可以是倒序比较，也可以根据字符串长度比较。

因此，上述排序使用到了策略模式，它实际上指，在一个方法中，流程是确定的，但是，某些关键步骤的算法依赖调用方传入的策略，这样，传入不同的策略，即可获得不同的结果，大大增强了系统的灵活性。

如果我们自己实现策略模式的排序，用冒泡法编写如下：

```java
import java.util.*;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        String[] array = { "apple", "Pear", "Banana", "orange" };
        sort(array, String::compareToIgnoreCase);
        System.out.println(Arrays.toString(array));
    }

    static &lt;T&gt; void sort(T[] a, Comparator&lt;? super T&gt; c) {
        for (int i = 0; i &lt; a.length - 1; i++) {
            for (int j = 0; j &lt; a.length - 1 - i; j++) {
                if (c.compare(a[j], a[j + 1]) &gt; 0) { // 注意这里比较两个元素的大小依赖传入的策略
                    T temp = a[j];
                    a[j] = a[j + 1];
                    a[j + 1] = temp;
                }
            }
        }
    }
}
```

## 完整的策略模式实现

一个完整的策略模式要定义策略以及使用策略的上下文。我们以购物车结算为例，假设网站针对普通会员、Prime会员有不同的折扣，同时活动期间还有一个满100减20的活动，这些就可以作为策略实现。

### 1. 定义策略接口

先定义打折策略接口：

```java
public interface DiscountStrategy {
    // 计算折扣额度:
    BigDecimal getDiscount(BigDecimal total);
}
```

### 2. 实现具体策略

接下来，就是实现各种策略。

普通用户策略如下：

```java
public class UserDiscountStrategy implements DiscountStrategy {
    public BigDecimal getDiscount(BigDecimal total) {
        // 普通会员打九折:
        return total.multiply(new BigDecimal("0.1")).setScale(2, RoundingMode.DOWN);
    }
}
```

Prime会员策略如下：

```java
public class PrimeDiscountStrategy implements DiscountStrategy {
    public BigDecimal getDiscount(BigDecimal total) {
        // Prime会员打八折:
        return total.multiply(new BigDecimal("0.2")).setScale(2, RoundingMode.DOWN);
    }
}
```

满减策略如下：

```java
public class OverDiscountStrategy implements DiscountStrategy {
    public BigDecimal getDiscount(BigDecimal total) {
        // 满100减20优惠:
        return total.compareTo(BigDecimal.valueOf(100)) &gt;= 0 ? BigDecimal.valueOf(20) : BigDecimal.ZERO;
    }
}
```

### 3. 创建策略上下文

最后，要应用策略，我们需要一个 `DiscountContext`：

```java
public class DiscountContext {
    // 持有某个策略:
    private DiscountStrategy strategy = new UserDiscountStrategy();

    // 允许客户端设置新策略:
    public void setStrategy(DiscountStrategy strategy) {
        this.strategy = strategy;
    }

    public BigDecimal calculatePrice(BigDecimal total) {
        return total.subtract(this.strategy.getDiscount(total)).setScale(2);
    }
}
```

### 4. 使用策略模式

调用方必须首先创建一个 `DiscountContext`，并指定一个策略（或者使用默认策略），即可获得折扣后的价格：

```java
public class StrategyPatternDemo {
    public static void main(String[] args) {
        DiscountContext ctx = new DiscountContext();

        // 默认使用普通会员折扣:
        BigDecimal pay1 = ctx.calculatePrice(BigDecimal.valueOf(105));
        System.out.println("普通会员折扣后价格: " + pay1); // 输出: 94.50

        // 使用满减折扣:
        ctx.setStrategy(new OverDiscountStrategy());
        BigDecimal pay2 = ctx.calculatePrice(BigDecimal.valueOf(105));
        System.out.println("满减折扣后价格: " + pay2); // 输出: 85.00

        // 使用Prime会员折扣:
        ctx.setStrategy(new PrimeDiscountStrategy());
        BigDecimal pay3 = ctx.calculatePrice(BigDecimal.valueOf(105));
        System.out.println("Prime会员折扣后价格: " + pay3); // 输出: 84.00
    }
}
```

## 策略模式类图

上述完整的策略模式如下图所示：

```
┌───────────────┐      ┌─────────────────┐
│DiscountContext│─ ─ ─&gt;│DiscountStrategy │
└───────────────┘      └─────────────────┘
                                ▲
                                │ ┌─────────────────────┐
                                ├─│UserDiscountStrategy │
                                │ └─────────────────────┘
                                │ ┌─────────────────────┐
                                ├─│PrimeDiscountStrategy│
                                │ └─────────────────────┘
                                │ ┌─────────────────────┐
                                └─│OverDiscountStrategy │
                                  └─────────────────────┘
```

## 策略模式的核心思想

策略模式的核心思想是在一个计算方法中把容易变化的算法抽出来作为"策略"参数传进去，从而使得新增策略不必修改原有逻辑。

## 策略模式的优点

1. **开闭原则**：可以在不修改原有代码的情况下引入新策略
2. **算法替换灵活**：运行时可以动态切换算法
3. **避免多重条件语句**：消除了大量的 if-else 或 switch-case 语句
4. **提高代码复用性**：算法可以被多个客户端复用
5. **符合单一职责原则**：每个策略类只负责一种算法

## 策略模式的缺点

1. **客户端必须了解所有策略**：客户端需要知道所有策略类的存在及其区别
2. **增加类的数量**：每个具体策略都需要一个单独的类
3. **策略过多会导致类膨胀**：如果策略过多，会增加系统复杂度

## 策略模式的适用场景

1. **多个相关的算法**：需要在多个算法中进行选择的情况
2. **需要隐藏算法实现细节**：不想让客户端知道复杂算法的具体实现
3. **避免使用多重条件语句**：当代码中出现大量 if-else 或 switch-case 时
4. **算法需要动态切换**：在运行时需要根据不同情况选择不同算法

## 策略模式的实际应用

除了前面提到的 `Arrays.sort()` 和 `Comparator`，Java 标准库中还有很多策略模式的应用：

1. **`java.util.Comparator`** - 比较策略
2. **`java.util.concurrent.ThreadPoolExecutor`** - 拒绝策略（RejectedExecutionHandler）
3. **`javax.servlet.Filter`** - 过滤策略
4. **Spring 中的 Resource 接口** - 资源访问策略
5. **MyBatis 中的 TypeHandler** - 类型转换策略

## 策略模式的最佳实践

1. **考虑使用 Lambda 表达式**：Java 8+ 可以使用 Lambda 表达式简化策略实现
2. **配合工厂模式使用**：可以使用工厂模式来创建策略对象
3. **使用枚举实现策略**：对于简单的策略，可以使用枚举来实现
4. **合理控制策略数量**：避免策略过多导致系统复杂
5. **提供默认策略**：为上下文提供一个默认的策略

### 使用 Lambda 表达式的简化版本

```java
public class DiscountContextLambda {
    private Function&lt;BigDecimal, BigDecimal&gt; discountStrategy;

    public DiscountContextLambda(Function&lt;BigDecimal, BigDecimal&gt; discountStrategy) {
        this.discountStrategy = discountStrategy;
    }

    public void setDiscountStrategy(Function&lt;BigDecimal, BigDecimal&gt; discountStrategy) {
        this.discountStrategy = discountStrategy;
    }

    public BigDecimal calculatePrice(BigDecimal total) {
        return total.subtract(discountStrategy.apply(total)).setScale(2);
    }
}

// 使用示例
public class LambdaStrategyDemo {
    public static void main(String[] args) {
        // 普通会员折扣
        DiscountContextLambda ctx = new DiscountContextLambda(
            total -&gt; total.multiply(new BigDecimal("0.1")).setScale(2, RoundingMode.DOWN)
        );
        
        System.out.println(ctx.calculatePrice(BigDecimal.valueOf(105))); // 94.50
        
        // 切换到满减折扣
        ctx.setDiscountStrategy(
            total -&gt; total.compareTo(BigDecimal.valueOf(100)) &gt;= 0 ? 
                BigDecimal.valueOf(20) : BigDecimal.ZERO
        );
        
        System.out.println(ctx.calculatePrice(BigDecimal.valueOf(105))); // 85.00
    }
}
```
