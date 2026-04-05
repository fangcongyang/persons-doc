---
sidebar_position: 4
tags: [java, mybatis]
---

# MyBatis

MyBatis 是一款优秀的持久层框架，它支持自定义 SQL、存储过程以及高级映射。MyBatis 免除了几乎所有的 JDBC 代码以及设置参数和获取结果集的工作。MyBatis 可以通过简单的 XML 或注解来配置和映射原始类型、接口和 Java POJO（Plain Old Java Objects，普通老式 Java 对象）为数据库中的记录。

## 常见用法

### choose
有时候，我们不想使用所有的条件，而只是想从多个条件中选择一个使用。针对这种情况，MyBatis 提供了 choose 元素，它有点像 Java 中的 switch 语句。

还是上面的例子，但是策略变为：传入了 "title" 就按 "title" 查找，传入了 "author" 就按 "author" 查找的情形。若两者都没有传入，就返回标记为 featured 的 BLOG（这可能是管理员认为，与其返回大量的无意义随机 Blog，还不如返回一些由管理员精选的 Blog）。

```xml
<select id="findActiveBlogLike"
     resultType="Blog">
  SELECT * FROM BLOG WHERE state = 'ACTIVE'
  <choose>
    <when test="title != null">
      AND title like #{title}
    </when>
    <when test="author != null and author.name != null">
      AND author_name like #{author.name}
    </when>
    <otherwise>
      AND featured = 1
    </otherwise>
  </choose>
</select>
```

### foreach

> 示例

```xml title="批量保存"
<insert id="mergeCheckOut">
    insert into business.check_out(
        id,
        registration_id
    ) VALUES
    <foreach collection="list" index="index" item="checkOut" open="" close="" separator=",">
        (#{checkOut.id},
        #{checkOut.registrationId})
    </foreach>
    ON CONFLICT(detail_serial_num, serial_num, project_code, registration_id)
    DO UPDATE SET is_valid = EXCLUDED.is_valid, update_time = CURRENT_TIMESTAMP
</insert>
```

```xml title="批量删除"
<delete id="deleteBatchTestTaskByIdList">
    DELETE FROM public.test_task where id IN
    <foreach item="item" index="index" collection="idList"
                open="(" separator="," close=")">
        #{item}
    </foreach>
</delete>
```

:::tip

注意：`url`上加`&allowMultiQueries=true`属性才能执行，否则会报错
如果使用阿里`druid`数据源需要去掉`wall`配置，否则会报错

:::

```xml title="批量更新"
<update id="updateBatch" parameterType="java.util.List">
  <foreach collection="list" item="item" index="index" open="" close="" separator=";">
    update tableName
    <set>
      name=${item.name},
      name2=${item.name2}
    </set>
    where id = ${item.id}
  </foreach>
</update>
```

### if

> 字符串判断相等

- 方法一
```xml
<if test="delFlag == '2'.toString()">
    a.del_flag = #{delFlag}
</if>
```

- 方法二
```xml
<if test=' delFlag == "2" '>
    a.del_flag = #{delFlag}
</if>
```

:::tip

注意：test 后面跟的是双引号（ " " ）还是单引号（ ' ' ）

:::

- 方法三

```xml
<if test=' delFlag.equals("2") '>
    a.del_flag = #{delFlag}
</if>
```

- 错误使用

```xml
<if test=" delFlag == '2' ">
    a.del_flag = #{delFlag}
</if>
```

:::tip

使用上面示例中 "delFlag =='2' " ， Mybatis会将 "2" 解析为字符（java 强类型语言， '2' char 类型 ），而非字符串，不能做到判断的效果。 要在Mybatis中判断字符串是否相等，请使用 方法一 或 方法二。

:::

> 集合或者数组判断是否为空

```xml
<!-- 数组判断 -->
<if test="object!=null and object.length>0">
  <yourSql>
</if>

<!-- 集合判断 -->
<if test="object!=null and object.size()>0">
  <yourSql>
</if>
```

### bind

`bind` 元素允许你在 OGNL 表达式以外创建一个变量，并将其绑定到当前的上下文。比如：

```xml
<select id="selectBlogsLike" resultType="Blog">
  <bind name="pattern" value="'%' + _parameter.getTitle() + '%'" />
  SELECT * FROM BLOG
  WHERE title LIKE #{pattern}
</select>
```

### 多数据库支持

如果配置了 databaseIdProvider，你就可以在动态代码中使用名为 "_databaseId" 的变量来为不同的数据库构建特定的语句。比如下面的例子：

```xml
<insert id="insert">
  <selectKey keyProperty="id" resultType="int" order="BEFORE">
    <if test="_databaseId == 'oracle'">
      select seq_users.nextval from dual
    </if>
    <if test="_databaseId == 'db2'">
      select nextval for seq_users from sysibm.sysdummy1
    </if>
  </selectKey>
  insert into users values (#{id}, #{name})
</insert>
```
