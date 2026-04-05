# Spring Security

## 动态更新用户的权限

### 业务背景

管理员更改其他用户权限，正好用户在登录状态下，无法刷新管理员刚赋值的权限，只能退出登录，重新登录才能拥有新权限。

### 业务需求

管理员更改权限，其他用户不退出登录，可以拥有新权限，动态刷新 session。

### 具体实现

#### 前提条件需要拥有

```java
@Autowired
SessionRegistry sessionRegistry;
```

如果找不到 SessionRegistry bean 需要自行注册：

```java
/**
 * 注册bean sessionRegistry
 */
@Bean
public SessionRegistry sessionRegistry() {
    return new SessionRegistryImpl();
}
```

#### 配置 security http

```java
http
    ... 省略代码
            .and()
            .sessionManagement()
            // 无效session跳转
            .invalidSessionUrl(login)
            .maximumSessions(1)
            // session过期跳转
            .expiredUrl(login)
            .sessionRegistry(sessionRegistry())
   ... 省略代码 
```

#### 定义一个 UserSessionManage

```java
package com.cp.oa.common.security;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 用户存储session
 * 一个用户储存多个session 出现一个用户多个地方登录
 */
@Component
@Data
@Slf4j
@CacheConfig(cacheNames = "UserSessionManage")
public class UserSessionManage {
    /**
     * 用户存储session对象
     */
    private Map<String, List<HttpSession>> userHttpSession=new HashMap<>();

    /**
     * 获取当前在线的session
     * @param id
     * @return
     */
    @Cacheable(key = "#id")
    public List<HttpSession> getUserSession(String id) {
        List <HttpSession> httpSessions = userHttpSession.get(id);
        if(httpSessions==null){
            httpSessions=new ArrayList<>();
        }
        return httpSessions;
    }

    /**
     * 修改缓存
     * @param id 用户登录名
     * @param userSession 用户session
     */
    @CachePut(key = "#id")
    public List<HttpSession> putUserSession(String id, HttpSession userSession) {
        List<HttpSession> userSessions = userHttpSession.computeIfAbsent(id, key -> new ArrayList<>());
        userSessions.add(userSession);
        return userSessions;
    }
}
```

#### 监听鉴权成功事件

```java
package com.cp.oa.common.security.handler;

import com.alibaba.fastjson.JSON;
import com.cp.oa.common.bean.Result;
import com.cp.oa.common.bean.UserDetailsImpl;
import com.cp.oa.common.security.UserSessionManage;
import com.cp.oa.common.util.SpringContextUtil;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * @Description ：鉴权成功处理器
 * @Author ： fcy
 * @Date ： 2019/08/07 17:21
 */
public class ServerAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Authentication authentication) throws IOException {
        httpServletResponse.setContentType("application/json;charset=utf-8");
        PrintWriter out = httpServletResponse.getWriter();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        //记录每个用户的session列表
        UserSessionManage userSessionManage = SpringContextUtil.getBean(UserSessionManage.class);
        userSessionManage.putUserSession(userDetails.getUsername(), httpServletRequest.getSession());
        userDetails.setPassword(null);
        out.write(JSON.toJSONString(new Result<>(userDetails)));
        out.flush();
        out.close();
    }
}
```

#### sessionManage 中取出当前在线用户的所有session

```java
/**
 * 刷新session
 * 刷新在线用户角色
 * @param save
 */
private void refreshSession(SysUser save) {
    UserSessionManage userSessionManage = sessionManage.getUserSessionManage();
    List<HttpSession> userSession = userSessionManage.getUserSession(save.getId());
    userSession.forEach(session -> {
        this.reloadUserAuthority(session);
    });
}
```

#### 当修改角色调用刷新session中的在线用户权限

```java
/**
 * 重新加载用户的权限
 *
 * @param session
 */
public void reloadUserAuthority(HttpSession session) {
    try {
        SecurityContext securityContext = (SecurityContext) session.getAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY);
        Authentication authentication = securityContext.getAuthentication();
        Object principal1 = authentication.getPrincipal();
        if (principal1 instanceof SysUser) {
            UserDetails principal = (SysUser) principal1;
            /**
             * 重载用户对象
             */
            principal = this.loadUserByUsername(principal.getUsername());

            // 重新new一个token，因为Authentication中的权限是不可变的.
            UsernamePasswordAuthenticationToken result = new UsernamePasswordAuthenticationToken(
                    principal, authentication.getCredentials(),
                    principal.getAuthorities());
            result.setDetails(authentication.getDetails());
            securityContext.setAuthentication(result);
        }
    } catch (Exception e) {
        log.error("当前用户session有可能不存在");
    }

}
```

#### 移除相关缓存

##### 无效session策略

```java
package com.cp.oa.common.security.strategy;

import com.alibaba.fastjson.JSON;
import com.cp.oa.common.bean.Result;
import com.cp.oa.common.enums.CodeEnum;
import com.cp.oa.common.security.UserSessionManage;
import com.cp.oa.common.util.SpringContextUtil;
import org.springframework.security.web.session.InvalidSessionStrategy;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.security.Principal;

/**
 * @Description ：无效session策略
 * @Author ： fcy
 * @Date ： 2018/01/02 15:40
 */
public class ServerInvalidSessionStrategy implements InvalidSessionStrategy {
    @Override
    public void onInvalidSessionDetected(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws IOException {
        httpServletResponse.setContentType("application/json;charset=utf-8");
        //移除用户session缓存
        UserSessionManage userSessionManage = SpringContextUtil.getBean(UserSessionManage.class);
        Principal principal = httpServletRequest.getUserPrincipal();
        String userName = principal.getName();
        userSessionManage.removeUserSession(userName, httpServletRequest.getSession());
        PrintWriter out = httpServletResponse.getWriter();
        out.write(JSON.toJSONString(new Result<>(CodeEnum.FAIL_2)));
        out.flush();
        out.close();
    }
}
```

##### session过期策略

```java
package com.cp.oa.common.security.strategy;

import com.alibaba.fastjson.JSON;
import com.cp.oa.common.bean.Result;
import com.cp.oa.common.bean.UserDetailsImpl;
import com.cp.oa.common.enums.CodeEnum;
import com.cp.oa.common.security.UserSessionManage;
import com.cp.oa.common.util.SpringContextUtil;
import org.springframework.security.web.session.SessionInformationExpiredEvent;
import org.springframework.security.web.session.SessionInformationExpiredStrategy;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * @Description ：session过期策略
 * @Author ： fcy
 * @Date ： 2018/01/02 15:40
 */
public class ServerSessionInformationExpiredStrategy implements SessionInformationExpiredStrategy {
    @Override
    public void onExpiredSessionDetected(SessionInformationExpiredEvent sessionInformationExpiredEvent) throws IOException {
        HttpServletResponse httpServletResponse = sessionInformationExpiredEvent.getResponse();
        httpServletResponse.setContentType("application/json;charset=utf-8");
        Object principal = sessionInformationExpiredEvent.getSessionInformation().getPrincipal();
        //移除用户session缓存
        UserSessionManage userSessionManage = SpringContextUtil.getBean(UserSessionManage.class);
        String userName;
        if (!(principal instanceof UserDetailsImpl)) {
            userName = (String) principal;
        } else {
            userName = ((UserDetailsImpl) principal).getUsername();
        }
        userSessionManage.removeUserSession(userName, sessionInformationExpiredEvent.getRequest().getSession());
        PrintWriter out = httpServletResponse.getWriter();
        out.write(JSON.toJSONString(new Result<>(CodeEnum.FAIL_2)));
        out.flush();
        out.close();
    }
}
```

##### 退出登录处理器

```java
package com.cp.oa.common.security.handler;

import com.alibaba.fastjson.JSON;
import com.cp.oa.common.bean.Result;
import com.cp.oa.common.bean.UserDetailsImpl;
import com.cp.oa.common.security.UserSessionManage;
import com.cp.oa.common.util.SpringContextUtil;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * @Description ：退出登录处理器
 * @Author ： fcy
 * @Date ： 2019/08/07 17:21
 */
public class JsonServerLoginOutSuccessHandler implements LogoutSuccessHandler {
    @Override
    public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        response.setContentType("application/json;charset=utf-8");
        response.setStatus(HttpServletResponse.SC_OK);
        //记录每个用户的session列表
        UserSessionManage userSessionManage = SpringContextUtil.getBean(UserSessionManage.class);
        //移除用户session缓存
        String userName;
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            userName = (String) authentication.getPrincipal();
        } else {
            userName = ((UserDetailsImpl) authentication.getPrincipal()).getUsername();
        }
        userSessionManage.removeUserSession(userName, request.getSession());
        PrintWriter out = response.getWriter();
        out.write(JSON.toJSONString(new Result<>()));
        out.flush();
        out.close();
    }
}
```
