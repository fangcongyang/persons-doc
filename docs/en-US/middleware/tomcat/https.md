# https

## 准备安全证书

获得安全证书有两种方式：一种方式是到权威机构申购CA证书，还有一种方式是创建自我签名的证书。本文以自签名证书为例，使用SUN公司提供的证书制作工具keytool制作自签证书，JDK版本为1.8。首先打开cmd命令行，使用如下命令创建密钥库和密钥条目：

```sh
keytool -genkeypair -alias www.bo.org -keyalg RSA -keystore d:\keystore\bo.keystore -storetype pkcs12
 
输入密钥库口令:
再次输入新口令:
您的名字与姓氏是什么?
  [Unknown]:  www.bo.org
您的组织单位名称是什么?
  [Unknown]:  xinwei
您的组织名称是什么?
  [Unknown]:  xinwei
您所在的城市或区域名称是什么?
  [Unknown]:  bj
您所在的省/市/自治区名称是什么?
  [Unknown]:  bj
该单位的双字母国家/地区代码是什么?
  [Unknown]:  cn
CN=www.bo.org, OU=xinwei, O=xinwei, L=bj, ST=bj, C=cn是否正确?
  [否]:  y
```

参数说明：

-genkeypair：生成一对非对称密钥并将公钥包装到X.509 v3自签名证书中；

-alias：指定密钥条目的别名，该别名是公开的；

-keyalg：指定加密算法，本例中的采用通用的RSA加密算法；

-keystore：指定密钥库的路径及名称，若密钥库不存在则创建。若不指定则默认在操作系统的用户目录下生成一个".keystore"的文件；

-storetype：指定密钥库的类型，如果不指定，默认是JKS。如果创建默认类型密钥库，命令行会提示转化为pkcs12类型，所以这里在创建时指定；

注：

1、执行上面命令后需要输入密钥库的口令，该口令需要配置在tomcat中，切记。

2、密钥库的密码至少必须6个字符，可以是纯数字或者字母或者数字和字母的组合等

3、"名字与姓氏"应该是输入域名，而不是我们的个人姓名，其他的可以不填

以上命令将在操作系统的指定目录："D:\keystore\"下生成名为“bo.keystore”的密钥库文件，使用如下命令查看密钥库信息：

```sh
keytool -list -v -keystore D:\keystore\bo.keystore
 
输入密钥库口令:
密钥库类型: JKS
密钥库提供方: SUN
 
您的密钥库包含 1 个条目
 
别名: www.bo.org
创建日期: 2019-2-17
条目类型: PrivateKeyEntry
证书链长度: 1
证书[1]:
所有者: CN=www.bo.org, OU=www.bo.org, O=xinwei, L=xinwei, ST=bj, C=bj
发布者: CN=www.bo.org, OU=www.bo.org, O=xinwei, L=xinwei, ST=bj, C=bj
序列号: 53e1769
有效期为 Sun Feb 17 21:42:31 CST 2019 至 Sat May 18 21:42:31 CST 2019
证书指纹:
         MD5:  D3:4B:91:FE:0D:08:77:D2:AC:8D:65:10:F1:26:30:2F
         SHA1: CB:43:4E:B5:03:5B:FC:60:FA:DC:BF:EC:02:E1:FA:C8:9C:53:D4:FE
         SHA256: 5D:44:89:D4:FF:1A:70:45:67:2D:3D:14:11:72:61:1D:D3:9A:EA:01:4B:
43:FD:38:F6:A9:38:B8:78:7D:53:3E
签名算法名称: SHA256withRSA
主体公共密钥算法: 2048 位 RSA 密钥
版本: 3
 
扩展:
 
#1: ObjectId: 2.5.29.14 Criticality=false
SubjectKeyIdentifier [
KeyIdentifier [
0000: C6 AB A5 21 DC 68 97 79   91 5C D1 0D A3 3A C4 DA  ...!.h.y.\...:..
0010: 64 F7 73 3A                                        d.s:
]
]
 
 
 
*******************************************
*******************************************
```
根据查询结果可知，生成的密钥库中包含一个名为"www.bo.org"的条目，该条目下包含一个私钥和一个封装公钥的自签证书。

## 配置tomcat服务器
打开"<tomcat安装目录>\conf\server.xml"配置文件，找到如下注释的代码行（本例为tomcat 8）：
```java
    <!--
    <Connector port="8443" protocol="org.apache.coyote.http11.Http11NioProtocol"
               maxThreads="150" SSLEnabled="true" scheme="https" secure="true"
               clientAuth="false" sslProtocol="TLS" />
    -->
```
去掉注释并改为如下配置：
```java
    <Connector port="443" protocol="org.apache.coyote.http11.Http11NioProtocol"
            maxThreads="150" SSLEnabled="true" scheme="https" secure="true"
            clientAuth="false" sslProtocol="TLS"
            keystoreFile="D:\keystore\bo.keystore"
            keystorePass="123456" />
```
其中keystoreFile填写之前用keytool生成的密钥库的文件路径，keystorePass填写密钥库口令。注意，如果protocol="HTTP/1.1"，需要将其替换为 protocol="org.apache.coyote.http11.Http11Protocol"，否则可能报错
```java
org.apache.catalina.core.StandardService initInternal
严重: Failed to initialize connector [Connector[HTTP/1.1-443]]
org.apache.catalina.LifecycleException: Failed to initialize component [Connector[HTTP/1.1-443]]
at org.apache.catalina.util.LifecycleBase.init(LifecycleBase.java:106)
at org.apache.catalina.core.StandardService.initInternal(StandardService.java:559)
at org.apache.catalina.util.LifecycleBase.init(LifecycleBase.java:102)
at org.apache.catalina.core.StandardServer.initInternal(StandardServer.java:814)
at org.apache.catalina.util.LifecycleBase.init(LifecycleBase.java:102)
at org.apache.catalina.startup.Catalina.load(Catalina.java:633)
at org.apache.catalina.startup.Catalina.load(Catalina.java:658)
at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:57)
at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
at java.lang.reflect.Method.invoke(Method.java:606)
at org.apache.catalina.startup.Bootstrap.load(Bootstrap.java:281)
at org.apache.catalina.startup.Bootstrap.main(Bootstrap.java:455)
Caused by: org.apache.catalina.LifecycleException: Protocol handler initialization failed
at org.apache.catalina.connector.Connector.initInternal(Connector.java:983)
at org.apache.catalina.util.LifecycleBase.init(LifecycleBase.java:102)
... 12 more
Caused by: java.lang.Exception: Connector attribute SSLCertificateFile must be defined when using SSL with APR
at org.apache.tomcat.util.net.AprEndpoint.bind(AprEndpoint.java:507)
at org.apache.tomcat.util.net.AbstractEndpoint.init(AbstractEndpoint.java:610)
at org.apache.coyote.AbstractProtocol.init(AbstractProtocol.java:429)
at org.apache.catalina.connector.Connector.initInternal(Connector.java:981)
... 13 more
```
对于protocol有多种配置方式，如：是否启用apr的方式，不同的方式有不同的配置，具体可以参考官方文档。这里采用Http11Protocol，它采用的是bio的方式处理网络连接请求，至于bio，nio，apr三种方式的区别不在本文讨论之列。在互联网上，http协议的默认端口是80，https的默认端口是443，这里将端口改为了443，访问https时可不用加端口号。
`<Connector>`标签相关属性说明如下表：
| 属　性 | 描　　述 | 
| -- | -- | -- |
| clientAuth | 如果设置为true，表示Tomcat要求所有的SSL客户端出示安全证书，对SSL客户端进行身份验证。 |
| keystoreFile | 指定密钥库文件的存放位置，可以指定绝对路径，也可以指定相对于`<CATALINA_HOME>` (Tomcat安装目录)环境变量的相对路径。若没有设定，默认情况下，Tomcat将从当前操作系统用户的用户目录下读取名为 “.keystore”的文件。 |
| keystorePass | 指定密钥库的密码，如果此项没有设定，在默认情况下，Tomcat将使用“changeit”作为默认密码。|
| truststoreFile | 指定信任库文件的存放位置，同keystoreFile配置。客户端信任证书将导入此库，它用来验证客户端证书。|
| truststorePass | 指定信任库的密码，如果此项没有设定，在默认情况下，Tomcat将使用“changeit”作为默认密码。|
| sslProtocol | 指定套接字（Socket）使用的加密/解密协议，默认值为TLS，用户不应该修改这个默认值。|
| ciphers | 指定套接字可用的用于加密的密码清单，多个密码间以逗号","分隔。若此项没有设定，在默认情况下，套接字可以使用任意一个可用的密码。|

## 3 启动tomcat进行测试
上述配置的证书域名是"www.bo.org"，但是该域名不存在，这里为了测试效果将其映射到本机ip，配置hosts文件，添加如下内容：
```sh
127.0.0.1  www.bo.org
```
使用IE浏览器访问 https://www.bo.org 页面提示：

![](./image/https/tomcat1.png)

选择继续浏览方可打开tomcat主页，但是会提示证书有问题：

![](./image/https/tomcat2.png)

使用火狐浏览器访问 https://www.bo.org 页面提示：

![](./image/https/tomcat3.png)

选择添加例外继续浏览，出现tomcat主页：

![](./image/https/tomcat4.png)

打开火狐浏览器证书管理页面发现已经将"www.bo.org"的证书添加到例外信任证书列表：

![](./image/https/tomcat5.png)

## 导入证书到客户端

以IE浏览器为例，如果服务端的证书为非CA机构签发，这种情况下让客户端信任服务端证书，则需要将证书链中的中级证书添加到中级证书机构、将根证书添加到受信任根证书机构，因为客户端在校验服务端证书时会通过证书链逐级向上校验直到根证书，根证书是自签名证书，客户端对根证书无条件信任。本例中服务端的证书是自签名证书，证书链中只有它本身，可视作根证书，所以只需将其导入到受信任根证书机构即可通过客户端的证书校验，步骤如下：

1）导出服务端证书(链)

使用tomcat配置的密钥库文件"d:\keystore\bo.keystore"导出证书到"d:\keystore\bo.crt"，cmd命令：
```js
keytool -exportcert -alias www.bo.org -keystore d:\keystore\bo.keystore -file d:\keystore\bo.crt
 
输入密钥库口令:
存储在文件 `d:\keystore\bo.crt` 中的证书
```
2）客户端导入证书(链)
打开IE浏览器的Internet选项  ----> 内容  ----> 证书

![](./image/https/tomcat6.png)

选择"受信任的根证书颁发机构"  ----> 导入证书

![](./image/https/tomcat7.png)

将之前生成的证书导入进来，其余的步骤直接下一步即可

![](./image/https/tomcat8.png)

![](./image/https/tomcat9.png)

## 配置https双向认证

打开"<tomcat安装目录>\conf\server.xml"，将第二步中`<Connector>`标签的配置改为如下：

``````xml
<Connector port="443" protocol="org.apache.coyote.http11.Http11NioProtocol"
            maxThreads="150" SSLEnabled="true" scheme="https" secure="true"
            clientAuth="true" sslProtocol="TLS"
            keystoreFile="D:\keystore\bo.keystore" keystorePass="123456"
            truststoreFile="D:\keystore\bo.keystore" truststorePass="123456" />
```
第二步的https配置其实是单向SSL认证，即只是客户端验证服务端身份；此处将clientAuth属性设为true，意为tomcat服务端也要求验证客户端的身份，客户端在访问服务端时需要出具安全证书以证明身份合法，即SSL双向认证。truststoreFile和truststorePass属性分别设置tomcat服务端信任库文件的路径和密码，信任库文件存放各个客户端的信任证书，用来校验客户端证书合法性，为了简便这里使用keystoreFile来替代truststoreFile。

为客户端生成安全证书：
```sh
keytool -genkey -keyalg RSA -alias client -keystore D:\keystore\client.p12 -storetype pkcs12
 
输入密钥库口令:
密钥库口令太短 - 至少必须为 6 个字符
输入密钥库口令:
再次输入新口令:
您的名字与姓氏是什么?
  [Unknown]:  bo
您的组织单位名称是什么?
  [Unknown]:  xinwei
您的组织名称是什么?
  [Unknown]:  xinwei
您所在的城市或区域名称是什么?
  [Unknown]:  bj
您所在的省/市/自治区名称是什么?
  [Unknown]:  bj
该单位的双字母国家/地区代码是什么?
  [Unknown]:  cn
CN=bo, OU=xinwei, O=xinwei, L=bj, ST=bj, C=cn是否正确?
  [否]:  y
```
注：为了能将证书顺利导入至IE和Firefox，因此证书格式应该是PKCS12，后缀为".p12"。

导出客户端信任证书：

```sh
keytool -exportcert -alias client -keystore D:\keystore\client.p12 -file D:\keystore\client.crt
 
输入密钥库口令:
存储在文件 <D:\keystore\client.crt> 中的证书
```

客户端信任证书导入到服务端信任库：

```sh
keytool -importcert -file D:\keystore\client.crt -keystore D:\keystore\bo.keystore
 
输入密钥库口令:
所有者: CN=bo, OU=xinwei, O=xinwei, L=bj, ST=bj, C=cn
发布者: CN=bo, OU=xinwei, O=xinwei, L=bj, ST=bj, C=cn
序列号: 1be3c916
有效期为 Tue Feb 19 23:54:52 CST 2019 至 Mon May 20 23:54:52 CST 2019
证书指纹:
         MD5:  4A:2E:1D:D2:1C:19:D0:8F:E9:40:8B:3E:A5:57:81:8C
         SHA1: 69:47:00:1A:7D:69:8B:F8:2C:5A:5F:19:D0:E7:6E:EA:A7:07:E1:77
         SHA256: E5:5B:B1:7B:A3:75:29:58:E9:BA:89:8E:24:4F:22:9C:21:34:D3:FD:98:
01:19:35:70:FA:F7:C8:EC:8D:0E:47
签名算法名称: SHA256withRSA
主体公共密钥算法: 2048 位 RSA 密钥
版本: 3
 
扩展:
 
#1: ObjectId: 2.5.29.14 Criticality=false
SubjectKeyIdentifier [
KeyIdentifier [
0000: F5 9F 5D BB 34 55 BD B2   FB FC D5 4F 89 29 47 16  ..].4U.....O.)G.
0010: 54 D5 8F 52                                        T..R
]
]
 
是否信任此证书? [否]:  y
证书已添加到密钥库中
```

:::tip
最后提示是否信任该证书，选择信任，或者在导入时添加"-trustcacerts"参数信任导入的证书。
:::

重启tomcat，浏览器访问 https://www.bo.org，页面提示：

![](./image/https/tomcat10.png)

这是因为浏览器客户端还未安装身份证书，将上面生成的"client.p12"安全证书安装到火狐浏览器，打开选项-隐私与安全-查看证书界面，选择"您的证书"并导入：

![](./image/https/tomcat11.png)

提示“请输入被用来加密此证书备份的密码”时随便输入一个即可，导入后界面如下：

![](./image/https/tomcat12.png)

再次访问https://www.bo.org恢复正常：

![](./image/https/tomcat13.png)

IE浏览器安装客户端身份证书步骤：

双击client.p12文件安装或者在IE浏览器中"Internet选项 - 内容 - 证书 - 个人" 选项卡导入，然后一路next，私钥密码随便即可：

![](./image/https/tomcat14.png)

IE地址栏输入https://www.bo.org，提示“确认证书”（可能存在多个身份证书），选择刚才导入的证书即可并确认：

![](./image/https/tomcat15.png)

正确跳转到tomcat主页面，地址栏显示小锁头安全标志： 

![](./image/https/tomcat16.png)

## 配置http自动跳转https

``````xml
<login-config>  
    <!-- Authorization setting for SSL -->  
    <auth-method>CLIENT-CERT</auth-method>  
    <realm-name>Client Cert Users-only Area</realm-name>  
</login-config>  
<security-constraint>  
    <!-- Authorization setting for SSL -->  
    <web-resource-collection >  
        <web-resource-name >SSL</web-resource-name>  
        <url-pattern>/*</url-pattern>  
    </web-resource-collection>  
    <user-data-constraint>  
        <transport-guarantee>CONFIDENTIAL</transport-guarantee>  
    </user-data-constraint>  
</security-constraint>
```
这步的目的是让非ssl的connector跳转到ssl的connector去，所以还需前往server.xml进行配置，将如下redirectPort改成ssl的connector的端口443：
```xml
<Connector port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="443" />
 
<Connector port="8009" protocol="AJP/1.3" redirectPort="443" />
```
上述配置完成后，重启tomcat便会生效，例：浏览器输入"http://www.bo.org:8080"将自动跳转到"https://www.bo.org"。