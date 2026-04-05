# Spring MVC

## 常见问题与解决方案

### 1. 静态资源访问

在 Spring Boot 中处理静态资源访问有两种方式，需要注意它们的区别：

#### 1.1 实现 WebMvcConfigurer 接口

实现 `org.springframework.web.servlet.config.annotation.WebMvcConfigurer` 接口，可以保留 Spring Boot 的拦截器默认配置，访问资源不用做任何处理。

#### 1.2 继承 WebMvcConfigurationSupport 类

继承 `org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport` 类，重写相关方法的时候会覆盖掉 Spring Boot 默认配置。典型问题：没有做如下配置时，classpath 下面的资源文件不能直接访问。

```java
@Override
protected void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry.addResourceHandler("/**")
            .addResourceLocations("classpath:/META-INF/resources/")
            .addResourceLocations("classpath:/static/");
}
```

---

### 2. 配置多个模板引擎访问

在一些老的项目上进行拓展时需要用到多个模板引擎。

#### 配置示例

```yaml
spring:
    mvc:
        view:
        prefix: /WEB-INF/
        suffix: .jsp
        #以view/开头的资源访问以thymeleaf解析
        view-names: view/*
    thymeleaf:
        prefix: /WEB-INF/
        #以pages/开头的资源访问以thymeleaf解析
        view-names: pages/*
        suffix: .html
        mode: HTML5
        servlet:
            content-type: text/html
        #设置模板解析排序
        template-resolver-order: 0
```

---

### 3. 跨域问题处理

#### 3.1 实现 Filter 接口

:::tip
这个处理效果最好，未遇到不生效的情况
:::

```java
package com.cp.oa.common.filter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsUtils;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;


/**
 * @Description ：跨域处理
 * @Author ： fcy
 * @Date ： 2018/01/02 15:40
 */
@Order(-1000)
@Component
public class CorsFilter implements Filter {
    /**
     * 这里为支持的请求头，如果有自定义的header字段请自己添加（不知道为什么不能使用*）
     */
    private static final String ALLOWED_HEADERS = "x-requested-with, authorization, Content-Type, Authorization, credential, X-XSRF-TOKEN,token,username,client";
    private static final String ALLOWED_METHODS = "*";
    private static final String ALLOWED_EXPOSE = "*";
    private static final String MAX_AGE = "18000L";
    @Value("${filter.allowedOrigin}")
    private String allowedOrigin;

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        if (CorsUtils.isCorsRequest(request)) {
            HttpServletResponse response = (HttpServletResponse) res;
            response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
            response.setHeader("Access-Control-Allow-Methods", ALLOWED_METHODS);
            response.setHeader("Access-Control-Max-Age", MAX_AGE);
            response.setHeader("Access-Control-Allow-Headers", ALLOWED_HEADERS);
            response.setHeader("Access-Control-Expose-Headers", ALLOWED_EXPOSE);
            response.setHeader("Access-Control-Allow-Credentials", "true");
        }
        chain.doFilter(req, res);
    }

    /**
     *
     *如果使用了注册中心（如：Eureka），进行控制则需要增加如下配置
     */
    /*@Bean
    public RouteDefinitionLocator discoveryClientRouteDefinitionLocator(DiscoveryClient discoveryClient) {
        return new DiscoveryClientRouteDefinitionLocator(discoveryClient);
    }*/
}
```

#### 3.2 继承 WebMvcConfigurationSupport

```java
package com.cp.oa.common.config.security;

import com.cp.oa.common.filter.ApiHandlerInterceptor;
import com.cp.oa.common.util.DateUtils;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

import javax.annotation.Resource;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.TimeZone;

/**
 * @Description ：上传文件资源映射
 * @Author ： fcy
 * @Date ： 2018/01/02 15:40
 */
@Configuration
public class WebConfig extends WebMvcConfigurationSupport {
    @Value("${image.baseUrl}")
    private String imageUrl;
    @Resource
    private ApiHandlerInterceptor apiHandlerInterceptor;

    /**
     * 跨域处理
     * @param registry
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowCredentials(true)
                .allowedOrigins("*")
                .allowedHeaders("*")
                .allowedMethods("*")
                .exposedHeaders(HttpHeaders.SET_COOKIE);
    }

    /**
     * 添加上传资源映射
     * @param registry
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/static/**")
                .addResourceLocations("file:" + imageUrl);
        registry.addResourceHandler("/swagger-ui.html").addResourceLocations("classpath:/META-INF/resources/");
        registry.addResourceHandler("/webjars/**").addResourceLocations("classpath:/META-INF/resources/webjars/");
    }

    @Override
    protected void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        MappingJackson2HttpMessageConverter jackson2HttpMessageConverter = new MappingJackson2HttpMessageConverter();
        ObjectMapper objectMapper = jackson2HttpMessageConverter.getObjectMapper();

        SimpleModule simpleModule = new SimpleModule();
        simpleModule.addSerializer(Long.class, ToStringSerializer.instance);
        simpleModule.addSerializer(Long.TYPE, ToStringSerializer.instance);


        // 忽略json字符串中不识别的属性
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        // 忽略无法转换的对象 "No serializer found for class com.xxx.xxx"
        objectMapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);

        // NULL不参与序列化
//        objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        // NULL转换为""
        objectMapper.getSerializerProvider().setNullValueSerializer(new JsonSerializer<Object>() {
            @Override
            public void serialize(Object o, JsonGenerator jsonGenerator,
                                  SerializerProvider serializerProvider) throws IOException {
                jsonGenerator.writeString("");
            }
        });
        // PrettyPrinter 格式化输出
        objectMapper.configure(SerializationFeature.INDENT_OUTPUT, true);

        // 指定时区，默认 UTC，而不是 jvm 默认时区
        objectMapper.setTimeZone(TimeZone.getTimeZone("GMT+8:00"));
        // 日期类型处理
        objectMapper.setDateFormat(new SimpleDateFormat(DateUtils.DATE_FORMAT_DATETIMEMS));

        objectMapper.registerModule(simpleModule);

        jackson2HttpMessageConverter.setObjectMapper(objectMapper);
        //放到第一个
        converters.add(0, jackson2HttpMessageConverter);
    }

    /**
     * interceptor配置
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(apiHandlerInterceptor)
                //添加需要验证登录用户操作权限的请求
                .addPathPatterns("/api/*");
        //这里可以用registry.addInterceptor添加多个拦截器实例，后面加上匹配模式
        //最后将register往这里塞进去就可以了
        super.addInterceptors(registry);
    }
}
```

---

### 4. 自定义拦截器

:::tip
需通过继承 `WebMvcConfigurationSupport` 或实现接口 `WebMvcConfigurer`，重写 `addInterceptors` 才会生效。
:::

#### 4.1 拦截器配置示例

继承 WebMvcConfigurationSupport，重写示例：

```java
/**
 * interceptor配置
 */
@Override
public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(apiHandlerInterceptor)
            //添加需要验证登录用户操作权限的请求
            .addPathPatterns("/api/*");
    //这里可以用registry.addInterceptor添加多个拦截器实例，后面加上匹配模式
    //最后将register往这里塞进去就可以了
    super.addInterceptors(registry);
}
```

#### 4.2 拦截器实现示例

```java
package com.cp.oa.common.filter;

import com.alibaba.fastjson.JSON;
import com.cp.oa.common.bean.Result;
import com.cp.oa.common.enums.CodeEnum;
import com.cp.oa.common.util.RedisUtils;
import com.cp.oa.common.util.StrUtils;
import com.cp.oa.common.util.WebUtils;
import com.cp.oa.entity.dto.user.UserInfoDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @Description ：api前端拦截器
 * @Author ： fcy
 * @Date ： 2018/01/02 15:40
 */
@Configuration
public class ApiHandlerInterceptor implements HandlerInterceptor {
    @Autowired
    private RedisUtils redisUtils;

    /**
     * controller 执行之前调用
     * 只有返回true才会继续向下执行，返回false取消当前请求
     * @param request
     * @param response
     * @param handler
     * @return
     */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String requestUrl = request.getRequestURI();
        if(requestUrl.startsWith("/api") && !requestUrl.contains("/api/login") &&
                !requestUrl.startsWith("/filed") && !requestUrl.startsWith("/static") && !requestUrl.startsWith("/api/es")){
            //验证必填参数
            String tokenId = request.getParameter("tokenId");
            if(StrUtils.isEmpty(tokenId)){
                Result<String> result = new Result<>(CodeEnum.FAIL_100002);
                WebUtils.outPrint(response, JSON.toJSONString(result));
                return false;
            }

            //验证session
            UserInfoDTO userDTO = redisUtils.getApiUser(tokenId);
            if(userDTO == null){
                Result<String> result = new Result<>(CodeEnum.FAIL_2);
                WebUtils.outPrint(response, JSON.toJSONString(result));
                return false;
            }
            //修改session
            redisUtils.setApiUser(tokenId, userDTO);
        }
        return true;
    }
}
```
