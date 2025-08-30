# 环境搭建

在不同系统环境搭建说明

## windows环境配置

> 创建CLASSPATH环境变量，如下

`.;%JAVA_HOME%\bin;%JAVA_HOME%\lib\dt.jar;%JAVA_HOME%\lib\tools.jar`

![CLASSPATH环境变量](./image/CLASSPATH环境变量.png)
 
> 创建JAVA_HOME环境变量，变量值：

```text
jdk安装路径，示例：C:\Program Files\Java\jdk1.8.0_92 (以实际安装为准)
```

![JAVA_HOME环境变量](./image/JAVAHOME环境变量.png)

> 在path环境变量中加入变量

```text
%JAVA_HOME%\bin;%JAVA_HOME%\jre\bin
```

![path配置](./image/path配置.png)

多版本JDK使用新建多个JAVA_HOME环境变量选着不同的jdk版本，通过JAVA_HOME+数字方式区分版本，激活那个版本则那个版本使用JAVA_HOME环境变量名

## linux环境搭建

:::tip

使用source 执行脚本或者执行脚本之后再执行一次 source /etc/profile使配置生效

:::

```bash
#!/bin/bash
# shell script tp unzip tomcat(version:apache-tomcat-8.0.32.tar.gz)
# shell script tp install jdk(version:jdk1.8.0_91)
# version 1.0
# created by fangcongyang@yunshiyou.com 
# Sat Oct 15 11:46:08 CST 2016
# Step1.Check jdk exists or not !
#wget --no-cookies --no-check-certificate --header "Cookie: gpw_e24=http%3A%2F%2Fwww.oracle.com%2F; oraclelicense=accept-securebackup-cookie" "http://download.oracle.com/otn-pub/java/jdk/8u141-b15/336fa29ff2bb4ef291e347e091f7f4a7/jdk-8u141-linux-x64.tar.gz"

if [ -n "$(rpm -qa | grep jdk)" ];
	then
	for i in $(rpm -qa | grep jdk)
	do
		echo "-->[`date +"%Y-%m-%d %H:%M.%S"`] Deleting "$i
		sudo yum -y remove $i
	done
	else
		echo "-->[`date +"%Y-%m-%d %H:%M.%S"`] Deleting is not defind"
fi

# Step2.Feedback if jdk was uninstalled or not !

if [ -n "$(rpm -qa | grep jdk)" ];
	then
	echo "-->[`date +"%Y-%m-%d %H:%M.%S"`] Failed to delete the " $i
	exit 1
fi

# Step3.unzip jdk
if [ -e /home/software/jdk-8u141-linux-x64.tar.gz ];
	then
	cd /home/software/
	tar -zxf jdk-8u141-linux-x64.tar.gz -C /home
	cd ..
	mv jdk1.8.0_141 jdk18
	if [ $? -eq 0 ];
	then
		echo "-->[`date +"%Y-%m-%d %H:%M.%S"`] Successfully unzip jdk-8u141-linux-x64.tar.gz"
	fi
else 
	echo "-->[`date +"%Y-%m-%d %H:%M:%S"`] the /home/website/jdk-8u141-linux-x64.tar.gz is not defind!!!"
	exit 1
fi

# Step4.Config jdk-envrionment 

cp /etc/profile /etc/profile.beforeInstallJDKenv.bak

echo "# For jdk8 start" >> /etc/profile
echo "JAVA_HOME=/home/jdk18" >> /etc/profile
echo "PATH=\$JAVA_HOME/bin:\$PATH" >> /etc/profile
echo "CLASSPATH=.:\$JAVA_HOME/lib/dt.jar:\$JAVA_HOME/lib/tools.jar" >> /etc/profile

echo "export JAVA_HOME" >> /etc/profile
echo "export PATH" >> /etc/profile
echo "export CLASSPATH" >> /etc/profile
echo "# For jdk8 end " >> /etc/profile

source /etc/profile
echo "-->[`date +"%Y-%m-%d %H:%M.%S"`] JDK environment has been successed set in /etc/profile."
echo "-->[`date +"%Y-%m-%d %H:%M.%S"`] java -version"
java -version

source /etc/profile

# Step5.Do a test
javac
```