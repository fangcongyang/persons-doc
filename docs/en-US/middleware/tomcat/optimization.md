# 调优
## 调优选项
### 禁用AJP连接器

:::tip
使用前提：以Nginx+Tomcat进行架构
修改conf下的server.xml文件，将AJP服务禁用掉即可。
:::

```xml
<!-- 禁用AJP连接 -->
<!-- <Connector port="8009" protocol="AJP/1.3" redirectPort="8443" /> -->
```
重启tomcat，查看效果。可以看到AJP服务已经不存在了。
![](./image/optimization/tomcat1.png)

### 执行器（线程池）
在tomcat中每一个用户请求都是一个线程，所以可以使用线程池提高性能。
修改server.xml文件：

```xml
<!--将注释打开-->
<Executor name="tomcatThreadPool" namePrefix="catalina-exec-"
        maxThreads="500" minSpareThreads="50" prestartminSpareThreads="true" maxQueueSize="100"/>

<!--
参数说明：
maxThreads：最大并发数，默认设置 200，一般建议在 500 ~ 1000，根据硬件设施和业务来判断
minSpareThreads：Tomcat 初始化时创建的线程数，默认设置 25
prestartminSpareThreads： 在 Tomcat 初始化的时候就初始化 minSpareThreads 的参数值，如果不等于 true，minSpareThreads 的值就没啥效果了
maxQueueSize，最大的等待队列数，超过则拒绝请求
-->

<!--在Connector中设置executor属性指向上面的执行器-->
<Connector executor="tomcatThreadPool" port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443" />
```
保存退出，重启tomcat，查看效果。

![](./image/optimization/tomcat2.png)

在页面中显示最大线程数为-1，这个是正常的，仅仅是显示的问题，实际使用的是指定的值。如果配置了一个Executor，则该属性的任何值将被正确记录，但是它将被显示为-1

### 1.3 3种运行模式
tomcat的运行模式有3种：

bio
性能非常低下，没有经过任何优化处理和支持

nio
nio(new I/O)，是Java SE 1.4及后续版本提供的一种新的I/O操作方式(即java.nio包及其子包)。Java nio是一个基于缓冲区、并能提供非阻塞I/O操作的Java API，因此nio也被看成是non-blocking I/O的缩写。它拥有比传统I/O操作(bio)更好的并发运行性能。Tomcat8默认使用nio运行模式。

apr
安装起来最困难，但是从操作系统级别来解决异步的IO问题，大幅度的提高性能

对于每种协议，Tomcat都提供了对应的I/O方式的实现，而且Tomcat官方还提供了在每种协议下每种I/O实现方案的差异， HTTP协议下的处理方式如下表，详情可查看[Tomcat官网](https://tomcat.apache.org/tomcat-8.5-doc/config/http.html)说明

几种模式对比
| &emsp;&emsp;&emsp;&emsp;&emsp;&emsp; | BIO | NIO | NIO2 | APR |
| -- | -- | -- | -- | -- |
| 类名 | Http11Protocol | Http11NioProtocol | Http11Nio2Protocol | Http11AprProtocol |
| 引用版本 | ≥3.0 | ≥6.0 | ≥8.0 | ≥5.5 |
| 轮询支持 | 否 | 是 | 	是 | 是 |
| 轮询队列大小 | N/A | maxConnections | maxConnections | maxConnections |
| 读请求头 | 阻塞 | 非阻塞 | 非阻塞 | 非阻塞 |
| 读请求体 | 阻塞 | 阻塞 | 阻塞 | 阻塞 |
| 写响应 | 阻塞 | 阻塞 | 阻塞 | 阻塞 |
| 等待新请求 | 阻塞 | 非阻塞 | 非阻塞 | 非阻塞 |
| SSL支持 | Java SSL | Java SSL | Java SSL | Open SSL |
| SSL握手 | 阻塞 | 非阻塞 | 非阻塞 | 阻塞 |
| 最大链接数 | maxConnections | maxConnections | maxConnections | maxConnections |

推荐使用nio，在tomcat8中有最新的nio2，速度更快，建议使用nio2
设置nio2：
```java
<Connector executor="tomcatThreadPool"  port="8080" protocol="org.apache.coyote.http11.Http11Nio2Protocol"
               connectionTimeout="20000"
               redirectPort="8443" />
```

![](./image/optimization/tomcat3.png)

可以看到已经设置为nio2了。

## 调优实践
### 执行器调优
通过设置线程池，调整线程池相关的参数进行测试tomcat的性能。有关线程池更多更详细的配置参考[Tomcat官网提供的配置详解](https://tomcat.apache.org/tomcat-8.5-doc/config/http.html)

1. 最大线程数为150，初始为4
```xml
<Executor name="tomcatThreadPool" namePrefix="catalina-exec-"
        maxThreads="150" minSpareThreads="4" prestartminSpareThreads="true"/>

<!--在Connector中设置executor属性指向上面的执行器-->
<Connector executor="tomcatThreadPool" port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443" />

```

![](./image/optimization/tomcat4.png)

经过9次测试，测试结果如下705 725 702 729 733 738 735 728 平均是724

2. 最大线程数为500，初始为50
```xml
<Executor name="tomcatThreadPool" namePrefix="catalina-exec-"
        maxThreads="500" minSpareThreads="50" prestartminSpareThreads="true"/>

<!--在Connector中设置executor属性指向上面的执行器-->
<Connector executor="tomcatThreadPool" port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443" />

```
测试结果：733 724 718 728 734 721 720 723 平均725

吞吐量为725次/秒，性能有所提升。

3. 最大线程数为1000，初始为200
```xml
<Executor name="tomcatThreadPool" namePrefix="catalina-exec-"
        maxThreads="1000" minSpareThreads="200" prestartminSpareThreads="true"/>

<!--在Connector中设置executor属性指向上面的执行器-->
<Connector executor="tomcatThreadPool" port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443" />

```
吞吐量为732，性能有所提升。

测试结果 737 729 730 738 735 726 725 740 平均732

4. 最大线程数为5000，初始为1000
是否是线程数最多，速度越快呢？ 我们来测试下。
```xml
<Executor name="tomcatThreadPool" namePrefix="catalina-exec-"
        maxThreads="5000" minSpareThreads="1000" prestartminSpareThreads="true"/>

<!--在Connector中设置executor属性指向上面的执行器-->
<Connector executor="tomcatThreadPool" port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443" />

```
测试结果 727 733 728 725 738 729 737 735 739 平均732

可以看到，虽然最大线程已经设置到5000，但是实际测试效果并不理想，并且平均的响应时间也边长了，所以单纯靠提升线程数量是不能一直得到性能提升的。

5. 设置最大等待队列数
默认情况下，请求发送到tomcat，如果tomcat正忙，那么该请求会一直等待。这样虽然可以保证每个请求都能请求到，但是请求时间就会边长。

有些时候，我们也不一定要求请求一定等待，可以设置最大等待队列大小，如果超过就不等待了。这样虽然有些请求是失败的，但是请求时间会虽短。典型的应用：12306。
```xml
<!--最大等待数为100-->
<Executor name="tomcatThreadPool" namePrefix="catalina-exec-"
        maxThreads="500" minSpareThreads="100" prestartminSpareThreads="true" maxQueueSize="100"/>

<!--在Connector中设置executor属性指向上面的执行器-->
<Connector executor="tomcatThreadPool" port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443" />

```

![](./image/optimization/tomcat5.png)

测试结果：
- 平均响应时间：0.438秒，响应时间明显缩短
- 错误率：43.07%，错误率超过40%，也可以理解，最大线程为500，测试的并发为1000
- 吞吐量：1359次/秒，吞吐量明显提升

结论：响应时间、吞吐量这2个指标需要找到平衡才能达到更好的性能。

6. 设置nio2的运行模式
将最大线程设置为500进行测试：

```xml
<Executor name="tomcatThreadPool" namePrefix="catalina-exec-"
        maxThreads="500" minSpareThreads="100" prestartminSpareThreads="true"/>

<!-- 设置nio2 -->
<Connector executor="tomcatThreadPool" port="8080" protocol="org.apache.coyote.http11.Http11Nio2Protocol"
               connectionTimeout="20000"
               redirectPort="8443" />

```
从测试结果可以看到，平均响应时间有缩短，吞吐量有提升，可以得出结论：nio2的性能要高于nio。

7. 执行器参数说明(加粗是重点)

| Attribute | Description |
| -- | -- |
| threadPriority （优先级） | (int) 执行程序中线程的线程优先级，默认值为 5（Thread.NORM_PRIORITY常量的值） |
| daemon（守护进程）| (布尔) 线程是否应该是守护程序线程，默认值为 true |
| namePrefix（名称前缀） | (String) 执行程序创建的每个线程的名称前缀。单个线程的线程名称将为namePrefix+threadNumber |
| **maxThreads**（最大线程数） | (int) 此池中活动线程的最大数量，默认为 200 |
| **minSpareThreads**（最小活跃线程数） | (int) 始终保持活动状态的最小线程数（空闲和活动），默认值为 25 |
| maxIdleTime（空闲线程等待时间） | (int) 空闲线程关闭之前的毫秒数，除非活动线程的数目小于或等于minSpareThreads。默认值为60000（1分钟） |
| **maxQueueSize**（最大的等待队里数，超过则请求拒绝） | (int) 在我们拒绝执行之前可以排队等待执行的可运行任务的最大数量。默认值为Integer.MAX_VALUE |
| **prestartminSpareThreads**（是否在启动时就生成minSpareThreads个线程 | (boolean) 在启动执行程序时是否应启动minSpareThreads，默认值为 false |
| threadRenewalDelay（重建线程的时间间隔） | (long) 如果配置了ThreadLocalLeakPreventionListener，它将通知该执行程序已停止的上下文。上下文停止后，池中的线程将更新。为避免同时更新所有线程，此选项设置了任意两个线程之间的延迟。该值以毫秒为单位，默认值为1000ms。如果值为负，则不更新线程。 |

8. 执行器最佳实践
此最佳配置仅供参考
```xml
<Executor name="tomcatThreadPool" namePrefix="catalina-exec-"
        maxThreads="800" minSpareThreads="100" maxQueueSize="100" prestartminSpareThreads="true"/>

```

### 2.2 连接器参数说明
可以看到除了这几个基本配置外并无特殊功能，所以我们需要对 Connector 进行扩展。

其中Connector 支持参数属性可以参考[Tomcat官方网站](https://tomcat.apache.org/tomcat-8.5-doc/config/http.html)，本文就只介绍些常用的。

1. 通用属性(加粗是重点)

| Attribute | Description |
| -- | -- |
| allowTrace | 如果需要服务器能够处理用户的HAED/TRACE请求，这个值应该设置为true，默认值是false |
| asyncTimeout | 默认超不时候以毫秒为单位的异步恳求。若是没有指定，该属性被设置为10000（10秒） |
| **enableLookups** | 设置为true是否要调用以 request.getRemoteHost()执行DNS查找以返回远程客户端的实际主机名。设置为false跳过DNS查找并改为以字符串形式返回IP地址（从而提高性能）。默认情况下，DNS查找被禁用。 |
| maxHeaderCount | 	容器允许的请求头字段的最大数目。请求中包含比指定的限制更多的头字段将被拒绝。值小于0表示没有限制。如果没有指定，默认设置为100。 |
| maxParameterCount | 将被容器自动解析的最大数量的参数和值对（GET加上POST）。参数值对超出此限制将被忽略。值小于0表示没有限制。如果没有指定，默认为10000。请注意， FailedRequestFilter 过滤器可以用来拒绝达到了极限值的请求。 |
| **maxPostSize** | 容器FORM URL参数解析将处理的POST的最大大小（以字节为单位）。可以通过将此属性设置为小于零的值来禁用该限制。如果未指定，则此属性设置为2097152（2兆字节）。请注意， [<font color='#FF0000'>FailedRequestFilter</font>](https://tomcat.apache.org/tomcat-8.5-doc/config/filter.html#Failed_Request_Filter) 可以使用拒绝超过此限制的请求。 |
| maxSavePostSize | 将被容器在FORM或CLIENT-CERT认证中保存/缓冲的POST的最大尺寸（以字节为单位）。对于这两种类型的身份验证，在用户身份验证之 前，POST将被保存/缓冲。对于POST CLIENT-CERT认证，处理该请求的SSL握手和缓冲清空期间，POST将被缓存。对于Form认证，POST将被保存，同时用户将被重定向到登陆 表单。POST将被一直保留直到用户成功认证或者认证请求关联的会话超时。将此属性设置为-1可以禁用此限制。将此属性设置为0，POST数据在身份验证 过程中将不被保存。如果没有指定，该属性设置为4096（4千字节）。 |
| parseBodyMethods | 以逗号分隔的HTTP方法列表，通过方法列表，等同于POST方法，request 正文将被解析成请求参数。这在RESTful应用程序要支持以POST式的语义解析PUT请求中是非常有用的。需要注意的是设置其他值（不是POST）会导致Tomcat的行为违反servlet规范的目的。在这里为了符合HTTP规范明确禁止HTTP方法TRACE。默认值是POST |
| **port** | 连接器 将在其上创建服务器套接字并等待传入连接的TCP端口号。您的操作系统将仅允许一个服务器应用程序侦听特定IP地址上的特定端口号。如果使用特殊值0（零），则Tomcat将随机选择一个空闲端口用于此连接器。这通常仅在嵌入式和测试应用程序中有用。 |
| **protocol** | 设置协议以处理传入流量。默认值为 HTTP/1.1使用自动切换机制选择基于Java NIO的连接器或基于APR / native的连接器。如果PATH（Windows）或LD_LIBRARY_PATH（在大多数Unix系统上）环境变量包含Tomcat本机库，并且AprLifecycleListener用于初始化APR的库的useAprConnector属性设置为 true，则将使用APR /本机连接器。如果找不到本机库或未配置属性，则将使用基于Java NIO的连接器。请注意，APR /本机连接器的HTTPS设置与Java连接器的设置不同。<br/> 要使用显式协议而不是依赖于上述自动切换机制，可以使用以下值：<br/> org.apache.coyote.http11.Http11NioProtocol-非阻塞Java NIO连接器 <br/> org.apache.coyote.http11.Http11Nio2Protocol-非阻塞Java NIO2连接器-APR <br/> org.apache.coyote.http11.Http11AprProtocol/本地连接器。<br/> 也可以使用自定义实现。<br/> 看看我们的连接器比较表。对于Java和Java连接器，http和https的配置相同。<br/> 有关APR连接器和特定于APR的SSL设置的更多信息，请访问APR文档 |
| proxyName | 如果这个连接正在使用的代理服务器配置，配置该属性指定的服务器的名称，可以调用request.getServerName（）返回。有关更多信息，请参见代理支持。 |
| proxyPort | 如果这个连接正在使用的代理服务器配置，配置该属性指定服务器端口，可以调用request.getServerPort（）返回。有关更多信息，请参见代理支持。 |
| redirectPort | 如果该连接器支持非SSL请求，并且接收到的请求为满足安全约束需要SSL传输， Catalina 将自动将请求重定向到指定的端口号。 |
| scheme | 将该属性设置为你想调用request.getScheme（）返回的协议的名称。例如，对于SSL连接器，你会将此属性设置为“HTTPS ”。默认值是“ HTTP ”。 |
| secure | 如果你想调用request.isSecure（）收到此连接器的请求返回true，请该该属性设置为true。您希望SSL连接器或非SSL连接器接收数据通过一个SSL加速器，像加密卡，SSL设备，甚至一个web服务器。默认值是假的。 |
| **URIEncoding** | 解决我们的乱码问题，这将指定使用的字符编码，来解码URI字符。如果没有指定，ISO-8859-1将被使用。 |
| useBodyEncodingForURI | 这指定是否应该用于URI查询参数，而不是使用URIEncoding contentType中指定的编码。此设置兼容性Tomcat 4.1.x版（该版在contentType中指定编码，或者使用request.setCharacterEncoding的方法显式设置（参数为 URL传来的值）。默认值false。 |
| useIPVHosts | 将该属性设置为true会导致Tomcat使用收到请求的IP地址，来确定将请求发送到哪个主机。默认值是假的。 |
| xpoweredBy | 将此属性设置为true会导致Tomcat支持使用Servlet规范的通知，（在规范中推荐使用头字段）。默认值是假的。 |

2. 标准实现(加粗是重点)
除了上面列出的常见的连接器属性，标准的HTTP连接器（BIO，NIO和APR/native）都支持以下属性。

| Attribute | Description |
| -- | -- |
| **acceptCount** | 当所有可能的请求处理线程都在使用时，传入连接请求的最大队列长度。当队列满时收到的任何请求将被拒绝。默认值是100。 |
| **acceptorThreadCount** | 用于接受连接的线程的数量。在一个多CPU的机器上，增加该值，虽然你可能不会真正需要超过2个。此外，有很多非保持活动连接，您可能需要增加这个值。默认值是 1。 |
| acceptorThreadPriority | 接收器线程的优先级。该线程用来接受新的连接。默认值是5（java.lang.Thread.NORM_PRIORITY常量）。更多这个优先级是什么意思的详细信息，请查看java.lang.Thread的类的JavaDoc 。 |
| address | 对于拥有多个IP地址的服务器，该属性指定哪个地址将被用于在指定端口上监听。默认情况下，该端口将被用于与服务器相关联的所有IP地址。 |
| bindOnInit | 控制连接器绑定时套接字的使用。缺省情况，当连接器被启动时套接字被绑定和当连接器被销毁时套接字解除绑定。如果设置为false，连接器启动时套接字被绑定，连接器停止时套接字解除绑定。 |
| compressableMimeType | 该值是一个被用于HTTP压缩的逗号分隔的MIME类型列表。默认值是text / html类型，为text / xml，text / plain。 |
| **compression** | 通常会在ngnix里面配置压缩 ，开启压缩GZIP 为了节省服务器带宽，连接器可以使用HTTP/1.1 GZIP压缩。可接受的参数的值是“off ”（禁用压缩），“on ”（允许压缩，这会导致文本数据被压缩），“force ”（强制在所有的情况下压缩），或者一个整数值（这是相当于为“on”，但指定了输出之前被压缩的数据最小量）。如果不知道内容长度但被设置为“on”或更积极的压缩，输出的数据也将被压缩。如果没有指定，该属性被设置为“关”。 注意：这是使用压缩（节省您的带宽）和使用sendfile功能（节省你的CPU周期）之间的权衡。如果连接器支持sendfile功能，例如NIO连接，则使用sendfile将优先于压缩。症状是48 KB的静态文件将未压缩就发送。你可以如下文所述通过设置连接器的useSendfile属性来关闭sendfile，或在默认的conf/web.xml或者你的web应用的web.xml中配置DefaultServlet来改变sendfile的使用量阈值。|
| compressionMinSize | 如果压缩被设置为“on”，那么该属性可以用于指定在输出之前被压缩的数据的最小量。如果未指定，此属性默认为“2048”。 |
| connectionLinger | 连接器的套接字被关闭时的逗留秒数。如果没有指定，将使用默认的JVM。 |
| connectionTimeout | 在将提交的请求URI行呈现之后，连接器将等待接受连接的毫秒数。使用值-1表示没有超时（即无限）。默认值是60000（60秒），但请注意，Tomcat的标准server.xml中，设置为20000（即20秒）。 |
| **connectionUploadTimeout** | 上传数据过程中，指定的以毫秒为单位超时时间。只有在设置disableUploadTimeout为false有效。 |
| **disableUploadTimeout** | 此标志允许servlet容器在数据上传时使用不同的连接超时，通常较长。如果没有指定，该属性被设置为true，禁用上传超时。 |
| **executor** | 指向Executor元素的引用。如果这个属性被设置，并且被命名的executor存在，连接器将使用这个executor，而其他所有线程相关属性将被忽略。请注意共享的executor如果没有指定到一个连接器，则该连接器将使用一个私有的，内部的executor来提供线程池。 |
| executorTerminationTimeoutMillis | 专用内部执行器在继续停止连接器的过程之前等待请求处理线程终止的时间。如果未设置，则BIO连接器的默认值为0（零），NIO和APR/native连接器的默认为5000（5秒）。 |
| keepAliveTimeout | 此连接器在关闭连接之前将等待另一个HTTP请求的毫秒数。默认值是使用已设置的connectionTimeout属性的值。使用值-1表示没有超时（即无限）。 |
| **maxConnections** | 在任何给定的时间服务器接受并处理的最大连接数。当这个数字已经达到了，服务器将不会接受任何连接，直到连接的数量降到低于此值。基于acceptCount的设置，操作系统可能仍然接受连接。默认值根据不同的连接器类型而不同。对于BIO，默认的是maxThreads的值，除非使用了Executor，在这种情况下默认值是executor的maxThreads值 。对于NIO的默认值是10000。APR /native的默认值是8192。 需要注意的是Windows系统的APR/native，所配置的值将减少到小于或等于maxConnections的1024的倍数的最大值。这样做是出于性能方面的考虑。如果设置的值-1，maxConnections功能被禁用，而且连接数将不做计算。 |
| maxExtensionSize | 限制HTTP区块请求中区块扩展的总长度。如果值为-1，则不施加任何限制。如果未指定，8192将使用默认值 |
| maxHttpHeaderSize | 请求和响应的HTTP头的（以字节为单位的）最大尺寸。如果没有指定，该属性被设置为8192（8 KB）。 |
| maxKeepAliveRequests | HTTP请求最大长连接个数。将此属性设置为1，将禁用HTTP/1.0、以及HTTP/1.1的长连接。设置为-1，不禁用。如果没有指定，该属性被设置为100。 |
| maxSwallowSize | Tomcat会为中止的上载而吞下的请求正文字节的最大数量（不包括传输编码开销）。上载中止是指Tomcat知道将忽略请求主体，但客户端仍将其发送。如果Tomcat不吞咽该主体，则客户端不太可能看到响应。如果未指定，将使用默认值2097152（2兆字节）。小于零的值表示不应强制执行任何限制。 |
| **maxThreads** | 最多同时处理的连接数，Tomcat使用线程来处理接收的每个请求。这个值表示Tomcat可创建的最大的线程数。如果没有指定，该属性被设置为200。如果使用了execute将忽略此连接器的该属性，连接器将使用execute，而不是一个内部线程池来处理请求。 |
| maxTrailerSize | 限制一个分块的HTTP请求中的最后一个块的尾随标头的总长度。如果该值是-1，没有限制的被强加。如果没有指定，默认值是8192。 |
| **minSpareThreads** | 始终保持运行最小线程数。如果没有指定，则默认为10。 |
| noCompressionUserAgents | 该值是一个正则表达式（使用java.util.regex），匹配不应该使用压缩的HTTP客户端的用户代理标头。因为这些客户端，虽然他们宣称支持压缩功能，但实现不完整。默认值是一个空字符串（正则表达式匹配禁用）。 |
| processorCache | 协议处理器缓存Processor对象以提高性能。此设置规定了这些对象有多少能得到缓存。-1意味着无限制，默认为200。如果不使用Servlet 3.0的异步处理，一个好的默认是使用maxThreads设置。如果使用Servlet 3.0的异步处理，一个好的默认是使用maxThreads和最大预期的并发请求（同步和异步）的最大值中的较大值。 |
| restrictedUserAgents | 该值是一个正则表达式（使用java.util.regex），匹配用户代理头的HTTP浏览器将不能使用HTTP/1.1或HTTP/1.0长连接，即使该浏览器宣称支持这些功能的。默认值是一个空字符串（正则表达式匹配禁用）。 |
| server | 覆盖服务器的HTTP响应头。如果设置了这个属性的值将覆盖Web应用程序设置的Tomcat的默认头和任何服务器头。如果没有设置，应用程序指定的任何值将被使用。如果应用程序没有指定一个值，那么Apache-Coyote/1.1将被使用。除非你是偏执狂，你将不再需要此功能。 |
| socketBuffer | 为套接字输出缓冲而提供的缓冲区的大小（以字节为单位）。-1可以被指定来禁止使用的缓冲区。默认情况下，一个9000个字节的缓冲区将被使用。 |
| **SSLEnabled** | 在连接器上使用此属性来启用SSL加密传输。如果要打开SSL握手/加密/解密，请设置true。默认值是false。当设置这个值为true时，为了传递正确的request.getScheme（）和 request.isSecure（）到servlets，你需要设置scheme和secure属性。更多信息请查看SSL支持。 |
| tcpNoDelay | 如果设置为true，TCP_NO_DELAY选项将被设置在服务器上的套接字上，在大多数情况下，这样可以提高性能。默认设置为true。 |
| threadPriority | 在JVM中请求处理线程的优先级。默认值是5（java.lang.Thread.NORM_PRIORITY常量值）。关于优先级的更多详细信息，请查看java.lang.Thread的类的JavaDoc |
| upgradeAsyncWriteBufferSize | 为无法在单个操作中完成的异步写入分配的缓冲区的默认大小。无法立即写入的数据将存储在此缓冲区中，直到可以写入为止。如果需要存储的数据多于缓冲区中可用的空间，则在写入期间缓冲区的大小将增加。如果未指定，将使用默认值8192。 |

## 连接器最佳实践

:::tip
此最佳配置仅供参考，以实际情况为准
:::

```xml
<Connector executor="tomcatThreadPool" port="8080" 	protocol="org.apache.coyote.http11.Http11Nio2Protocol" 
           connectionTimeout="20000" redirectPort="8443" 
           enableLookups="false" maxPostSize="10485760" URIEncoding="UTF-8" acceptCount="100" acceptorThreadCount="2" disableUploadTimeout="true" maxConnections="10000" SSLEnabled="false"/>

```
