# Swagger

## 1 使用

### 1.1 依赖

```xml
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger2</artifactId>
    <version>${springfox.version}</version>
</dependency>

<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger-ui</artifactId>
    <version>${springfox.version}</version>
</dependency>
```

### 1.2 配置

```java
package com.cp.oa.common.config.swagger;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

/**
 * Created by fcy on 2018-01-25.
 * desc:
 */
@Configuration
@EnableSwagger2
@ConfigurationProperties(prefix = "swagger")
@Data
public class SwaggerConfig {
    private boolean enable;

    @Bean
    public Docket riskDataSourceApi(){
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo())
                .enable(enable)
                .select()
                .apis(RequestHandlerSelectors.basePackage("com.cp.oa"))
                .paths(PathSelectors.any())
                .build();
    }

    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .title("API接口文档")
                .description("spring boot 单一服务项目")
                .termsOfServiceUrl("http://www.cb.com/")
                .contact(new Contact("方从扬", "", "xxxx@163.com"))
                .version("1.0")
                .build();
    }
}
```

## 2 接口使用

### 2.1 单参数

```java
//controller类注释
@Api(value = "test", tags = "测试")
public class test {
    @ApiOperation(value = "数据拉取接口",notes = "数据拉取接口")
    @ApiImplicitParam(name = "message", value = "message", required = true, dataType = "string")
    public Map<String, Object> pullData(@RequestBody Map<String, Object> message){

    }
}
```

### 2.2 多参数

```java
//controller类注释
@Api(value = "test", tags = "测试")
public class test {
    @ApiOperation(value = "数据拉取接口",notes = "数据拉取接口")
    @ApiImplicitParams({
        @ApiImplicitParam(name = "id", value = "", required = true, dataType = "string"),
        @ApiImplicitParam(name = "age", value = "", required = false, dataType = "int"),
    })
    public Map<String, Object> pullData(String id, Integer age){

    }
}
```

### 2.3 实体类

```java
package com.cp.oa.entity.dto.sys;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.cp.oa.common.bean.BaseDTO;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;

/**
 * @Description ：banner信息
 * @Author ： fangcy
 * @Date ： 2019/03/14 22:04
 */
@Data
@TableName("sys_banner_info")
@ApiModel("banner信息")
public class SysBannerDTO extends BaseDTO {
    @ApiModelProperty("名称")
    private String name;
    @ApiModelProperty("banner图片")
    private String logo;
    @ApiModelProperty("0 启动页图片 1banner图片")
    private Integer type;
    @ApiModelProperty("跳转类型：0=不跳转，1=跳内页，2=h5,3=请求后台方法，4=电话热线")
    private Integer skipType;
    @ApiModelProperty("ios跳转的路径或方法")
    private String skipUrlIos;
    @ApiModelProperty("安卓跳转的路径或方法")
    private String skipUrlAndroid;
    @ApiModelProperty("banner状态:0-未启用，1-正在使用，2-已删除")
    private Integer status;
    @ApiModelProperty("排序，倒序（值越大越靠前）")
    private Integer sort;
    @ApiModelProperty("开始时间")
    @JsonFormat(timezone = "GMT+8",pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @TableField("begin_time")
    private Date beginTime;
    @ApiModelProperty("结束时间")
    @JsonFormat(timezone = "GMT+8",pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @TableField("end_time")
    private Date endTime;
    @ApiModelProperty("操作人ID")
    @TableField("sys_user_id")
    private Long sysUserId;
    @ApiModelProperty("操作人名称")
    @TableField("sys_user_name")
    private String sysUserName;

}
```
