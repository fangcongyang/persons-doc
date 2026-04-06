
# 位运算

位运算是直接对二进制位进行操作的运算，Java 提供了丰富的位操作符，用于高效地操作整数类型数据。位运算在性能优化、底层开发、算法实现等方面有着广泛的应用。

## 左移运算（&lt;&lt;）

左移运算是一种将一个数的各二进制位全部左移若干位的操作，左边的二进制位丢弃，右边补0。例如，如果 a = 1010 1110，那么 a &lt;&lt; 2 的结果是 1011 1000。左移运算的效果相当于将一个数乘以 2 的指数幂。例如，a &lt;&lt; 2 相当于 a * 2^2 = a * 4。

### 左移运算的用途

- **快速计算一个数的倍数。例如，如果要计算 a 的 8 倍，只需要将 a 左移 3 位即可，即 a &lt;&lt; 3。
- **快速设置一个数的某些位为1。例如，如果要将 a 的低4位设置为1，只需要将 a 与一个低4位为1，其余位为0的数进行按位或运算即可，即 a | (1 &lt;&lt; 4) - 1。
- **快速交换两个数的高低位。例如，如果要将一个16位的数 b 的高8位和低8位互换，只需要将 b 的高8位右移8位，低8位左移8位，然后进行按位或运算即可，即 (b &gt;&gt; 8) | (b &lt;&lt; 8)。

### 左移运算示例代码

```java
// 使用 &lt;&lt; 位运算计算一个数的倍数
public class BitMultiply {
    public static void main(String[] args) {
        int a = 35; // a = 0010 0011
        int b = a &lt;&lt; 3; // b = a * 8 = 0001 0110 0000
        System.out.println(b); // 输出 b = 280
    }
}
```

```java
// 使用 &lt;&lt; 位运算设置一个数的某些位为1
public class BitSet {
    public static void main(String[] args) {
        int a = 35; // a = 0010 0011
        int b = a | (1 &lt;&lt; 4) - 1; // b = a | (0001 0000 - 0000 0001) = a | (0000 1111) = 0010 1111
        System.out.println(b); // 输出 b = 47
    }
}
```

```java
// 使用 &lt;&lt; 位运算交换两个数的高低位
public class BitSwap {
    public static void main(String[] args) {
        int a = -12345; // a = 11110011 11001001
        int b = (a &gt;&gt; 8) | (a &lt;&lt; 8); // b = (11110011 | 11001001) | (11001001 | 11110011) = (11001001 | 11110011)
        System.out.println(b); // 输出 b = -31488
    }
}
```

## 右移运算（&gt;&gt;）

右移运算是将一个数的各二进制位全部右移若干位，正数左边补0，负数左边补1（符号位保持不变），右边的二进制位丢弃。右移运算的效果相当于将一个数除以 2 的指数幂。例如，a &gt;&gt; 2 相当于 a / 2^2 = a / 4。

### 右移运算示例

```java
public class RightShiftExample {
    public static void main(String[] args) {
        // 正数右移
        int positiveNum = 20; // 二进制: 0001 0100
        int result1 = positiveNum &gt;&gt; 2; // 右移2位: 0000 0101 = 5
        System.out.println("正数右移: " + result1); // 输出: 5
        
        // 负数右移
        int negativeNum = -20; // 二进制: 1110 1100
        int result2 = negativeNum &gt;&gt; 2; // 右移2位: 1111 1011 = -5
        System.out.println("负数右移: " + result2); // 输出: -5
    }
}
```

## 无符号右移运算（&gt;&gt;&gt;）

无符号右移运算与右移运算类似，但无论正数和负数左边都补0，不考虑符号位。对于正数，&gt;&gt;&gt; 和 &gt;&gt; 的结果相同；对于负数，&gt;&gt;&gt; 会把符号位也当作普通位处理。

### 无符号右移示例

```java
public class UnsignedRightShiftExample {
    public static void main(String[] args) {
        // 正数无符号右移
        int positiveNum = 20; // 二进制: 0001 0100
        int result1 = positiveNum &gt;&gt;&gt; 2; // 右移2位: 0000 0101 = 5
        System.out.println("正数无符号右移: " + result1); // 输出: 5
        
        // 负数无符号右移
        int negativeNum = -20; // 二进制: 1110 1100
        int result2 = negativeNum &gt;&gt;&gt; 2; // 右移2位: 0011 1011 = 1073741819
        System.out.println("负数无符号右移: " + result2); // 输出: 1073741819
    }
}
```

## 按位与运算（&amp;）

按位与运算将两个数的二进制位进行比较，只有当两个位都为1时，结果才为1，否则为0。

### 按位与运算的用途

- **清零**：将一个数的某些位清零，其他位保持不变
- **取指定位**：获取一个数的某些位
- **判断奇偶**：通过与1进行按位与运算判断奇偶

### 按位与运算示例

```java
public class BitwiseAndExample {
    public static void main(String[] args) {
        int a = 12; // 二进制: 1100
        int b = 10; // 二进制: 1010
        int result = a &amp; b; // 二进制: 1000 = 8
        System.out.println("按位与结果: " + result); // 输出: 8
        
        // 判断奇偶
        int evenNum = 20;
        boolean isEven = (evenNum &amp; 1) == 0;
        System.out.println("20是偶数吗? " + isEven); // 输出: true
        
        int oddNum = 21;
        boolean isOdd = (oddNum &amp; 1) == 1;
        System.out.println("21是奇数吗? " + isOdd); // 输出: true
        
        // 获取低4位
        int num = 0b10101100;
        int low4Bits = num &amp; 0b1111;
        System.out.println("低4位: " + Integer.toBinaryString(low4Bits)); // 输出: 1100
    }
}
```

## 按位或运算（|）

按位或运算将两个数的二进制位进行比较，只要有一个位为1，结果就为1，否则为0。

### 按位或运算的用途

- **设置指定位为1**
- **组合多个标志位

### 按位或运算示例

```java
public class BitwiseOrExample {
    public static void main(String[] args) {
        int a = 12; // 二进制: 1100
        int b = 10; // 二进制: 1010
        int result = a | b; // 二进制: 1110 = 14
        System.out.println("按位或结果: " + result); // 输出: 14
        
        // 设置低4位为1
        int num = 0b10100000;
        int resultWithLow4Bits = num | 0b1111;
        System.out.println("设置低4位后: " + Integer.toBinaryString(resultWithLow4Bits)); // 输出: 10101111
    }
}
```

## 按位异或运算（^）

按位异或运算将两个数的二进制位进行比较，相同为0，不同为1。

### 按位异或运算的用途

- **翻转指定位**
- **交换两个数**
- **寻找唯一出现一次的数

### 按位异或运算示例

```java
public class BitwiseXorExample {
    public static void main(String[] args) {
        int a = 12; // 二进制: 1100
        int b = 10; // 二进制: 1010
        int result = a ^ b; // 二进制: 0110 = 6
        System.out.println("按位异或结果: " + result); // 输出: 6
        
        // 交换两个数
        int x = 5, y = 7;
        System.out.println("交换前: x=" + x + ", y=" + y); // 输出: 交换前: x=5, y=7
        x = x ^ y;
        y = x ^ y;
        x = x ^ y;
        System.out.println("交换后: x=" + x + ", y=" + y); // 输出: 交换后: x=7, y=5
        
        // 翻转指定位
        int num = 0b1010;
        int flipped = num ^ 0b1100; // 翻转高2位
        System.out.println("翻转后: " + Integer.toBinaryString(flipped)); // 输出: 110
    }
}
```

## 按位取反运算（~）

按位取反运算将一个数的二进制位全部取反，0变1，1变0。

### 按位取反运算示例

```java
public class BitwiseNotExample {
    public static void main(String[] args) {
        int a = 12; // 二进制: 0000 1100
        int result = ~a; // 二进制: 1111 0011 = -13
        System.out.println("按位取反结果: " + result); // 输出: -13
    }
}
```

## 位运算实用工具类

```java
public class BitwiseUtils {
    
    /**
     * 判断一个数是否为2的幂
     */
    public static boolean isPowerOfTwo(int n) {
        return n &gt; 0 &amp;&amp; (n &amp; (n - 1)) == 0;
    }
    
    /**
     * 计算一个数的二进制中1的个数
     */
    public static int countSetBits(int n) {
        int count = 0;
        while (n != 0) {
            count += n &amp; 1;
            n &gt;&gt;&gt;= 1;
        }
        return count;
    }
    
    /**
     * 交换两个数
     */
    public static void swap(int[] arr, int i, int j) {
        if (i != j) {
            arr[i] ^= arr[j];
            arr[j] ^= arr[i];
            arr[i] ^= arr[j];
        }
    }
    
    /**
     * 获取一个数的绝对值
     */
    public static int abs(int x) {
        int mask = x &gt;&gt; 31;
        return (x ^ mask) - mask;
    }
    
    /**
     * 获取两个数的最大值
     */
    public static int max(int a, int b) {
        return a - ((a - b) &amp; ((a - b) &gt;&gt; 31));
    }
    
    /**
     * 获取两个数的最小值
     */
    public static int min(int a, int b) {
        return b + ((a - b) &amp; ((a - b) &gt;&gt; 31));
    }
    
    /**
     * 判断奇偶
     */
    public static boolean isEven(int n) {
        return (n &amp; 1) == 0;
    }
    
    public static boolean isOdd(int n) {
        return (n &amp; 1) == 1;
    }
    
    /**
     * 获取指定位的值
     */
    public static int getBit(int num, int position) {
        return (num &gt;&gt; position) &amp; 1;
    }
    
    /**
     * 设置指定位为1
     */
    public static int setBit(int num, int position) {
        return num | (1 &lt;&lt; position);
    }
    
    /**
     * 清除指定位（设为0）
     */
    public static int clearBit(int num, int position) {
        return num &amp; ~(1 &lt;&lt; position);
    }
    
    /**
     * 翻转指定位
     */
    public static int toggleBit(int num, int position) {
        return num ^ (1 &lt;&lt; position);
    }
    
    public static void main(String[] args) {
        // 测试工具方法
        System.out.println("16是2的幂吗? " + isPowerOfTwo(16)); // true
        System.out.println("15是2的幂吗? " + isPowerOfTwo(15)); // false
        System.out.println("15的二进制中1的个数: " + countSetBits(15)); // 4
        System.out.println("-5的绝对值: " + abs(-5)); // 5
        System.out.println("10和20的最大值: " + max(10, 20)); // 20
        System.out.println("10和20的最小值: " + min(10, 20)); // 10
        System.out.println("15是偶数吗? " + isEven(15)); // false
        System.out.println("16是偶数吗? " + isEven(16)); // true
        
        int num = 0b1010;
        System.out.println("num的第1位: " + getBit(num, 1)); // 1
        System.out.println("设置第3位后: " + Integer.toBinaryString(setBit(num, 3))); // 11010
        System.out.println("清除第1位后: " + Integer.toBinaryString(clearBit(num, 1))); // 1000
        System.out.println("翻转第2位后: " + Integer.toBinaryString(toggleBit(num, 2))); // 1110
    }
}
```

## 位运算的应用场景

1. **性能优化**：位运算比算术运算和乘除法快得多
2. **底层开发**：如驱动程序、嵌入式系统
3. **算法实现**：如位图算法、哈希算法
4. **数据压缩**：如编码解码
5. **加密算法**：如DES、AES等
6. **游戏开发**：如碰撞检测、状态管理
7. **网络编程**：如IP地址处理、协议解析

## 位运算最佳实践

1. **注释清楚**：位运算代码较难理解，务必添加清晰注释
2. **避免过度使用**：只在确实需要性能优化时使用
3. **考虑可读性优先**：除非必要，优先使用普通算术运算
4. **测试充分**：位运算容易出错，务必充分测试
