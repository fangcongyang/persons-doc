---
sidebar_position: 9
tags: [java]
---

# TrueLicense

TrueLicense是一个开源的证书管理引擎，可以用于license的生成和有效性的验证。

## 使用keytool生产密钥对

keytool是jdk里面自带的命令。我们直接用keytool命令来生成密钥对。需要执行的命令如下(命令里面的参数大家根据情况不同做相应的调整)

```java
## 1. 生成私匙库
# validity：私钥的有效期多少天
# alias：私钥别称
# keystore: 指定私钥库文件的名称(生成在当前目录)
# storepass：指定私钥库的密码(获取keystore信息所需的密码) 
# keypass：指定别名条目的密码(私钥的密码) 
keytool -genkeypair -keysize 1024 -validity 3650 -alias "privateKey" -keystore "privateKeys.keystore" -storepass "a123456" -keypass "a123456" -dname "CN=localhost, OU=localhost, O=localhost, L=SH, ST=SH, C=CN"

## 2. 把私匙库内的公匙导出到一个文件当中
# alias：私钥别称
# keystore：指定私钥库的名称(在当前目录查找)
# storepass: 指定私钥库的密码
# file：证书名称
keytool -exportcert -alias "privateKey" -keystore "privateKeys.keystore" -storepass "a123456" -file "certfile.cer"

## 3. 再把这个证书文件导入到公匙库
# alias：公钥别称
# file：证书名称
# keystore：公钥文件名称
# storepass：指定私钥库的密码
keytool -import -alias "publicCert" -file "certfile.cer" -keystore "publicCerts.keystore" -storepass "a123456"
```

在任意目录下执行完上述三个命令之后。我们会在当前目录下面得到三个文件：privateKeys.keystore、publicCerts.keystore、certfile.cer。

- **privateKeys.keystore**：私钥，这个我们自己留着，不能泄露给别人。
- **publicCerts.keystore**：公钥，这个给客人用的。在我们程序里面就是用他来解析license文件里面的信息的。
- **certfile.cer**：这个文件没啥用，可以删掉。

## TrueLicense的使用

我们已经生成好了密钥对(私钥、公钥)。接下来就是生成license文件，已经严重license是否有效了。license文件里面保存了我们需要验证的一些信息。这里没问使用TrueLicense来实现license的创建和验证。

### 项目中添加TrueLicense依赖

```xml
<!-- lisence验证 -->
<dependency>
    <groupId>de.schlichtherle.truelicense</groupId>
    <artifactId>truelicense-core</artifactId>
    <version>1.33</version>
    <scope>provided</scope>
</dependency>
```

### 代码封装

自定义KeyStoreParam类CustomKeyStoreParam类继承AbstractKeyStoreParam，实现里面一些该实现的方法。并且重写getStream()获取文件内容的方法，改成从磁盘位置读取。

```java
/**
 * 自定义KeyStoreParam，用于将公私钥存储文件存放到其他磁盘位置而不是项目中。现场使用的时候公钥大部分都不会放在项目中的
 */
public class CustomKeyStoreParam extends AbstractKeyStoreParam {

    /**
     * 公钥/私钥在磁盘上的存储路径
     */
    private String storePath;
    private String alias;
    private String storePwd;
    private String keyPwd;

    public CustomKeyStoreParam(Class clazz, String resource, String alias, String storePwd, String keyPwd) {
        super(clazz, resource);
        this.storePath = resource;
        this.alias = alias;
        this.storePwd = storePwd;
        this.keyPwd = keyPwd;
    }


    @Override
    public String getAlias() {
        return alias;
    }

    @Override
    public String getStorePwd() {
        return storePwd;
    }

    @Override
    public String getKeyPwd() {
        return keyPwd;
    }

    /**
     * AbstractKeyStoreParam里面的getStream()方法默认文件是存储的项目中。
     * 用于将公私钥存储文件存放到其他磁盘位置而不是项目中
     */
    @Override
    public InputStream getStream() throws IOException {
        return new FileInputStream(new File(storePath));
    }
}
```

自定义一个LicenseExtraModel类。我们可以在这里添加一些额外的验证信息(TrueLicense默认只帮我们验证了时间)，比如我们可以验证客户的机器码啥的。大家可以根据具体的需求添加具体的字段。

```java
/**
 * 自定义需要校验的License参数，可以增加一些额外需要校验的参数，比如项目信息，ip地址信息等等，待完善
 */
public class LicenseExtraModel {

    // 这里可以添加一些往外的自定义信息，比如我们可以增加项目验证，客户电脑sn码的验证等等

}
```

继承LicenseManager类，增加我们额外信息的验证(TrueLicense默认只给我们验证了时间)。大家需要根据自己的需求在validate()里面增加额外的验证。

```java
/**
 * 自定义LicenseManager，用于增加额外的信息校验(除了LicenseManager的校验，我们还可以在这个类里面添加额外的校验信息)
 */
public class CustomLicenseManager extends LicenseManager {

    private static Logger logger = LogManager.getLogger(CustomLicenseManager.class);

    public CustomLicenseManager(LicenseParam param) {
        super(param);
    }

    /**
     * 复写create方法
     */
    @Override
    protected synchronized byte[] create(LicenseContent content, LicenseNotary notary) throws Exception {
        initialize(content);
        this.validateCreate(content);
        final GenericCertificate certificate = notary.sign(content);
        return getPrivacyGuard().cert2key(certificate);
    }

    /**
     * 复写install方法，其中validate方法调用本类中的validate方法，校验IP地址、Mac地址等其他信息
     */
    @Override
    protected synchronized LicenseContent install(final byte[] key, final LicenseNotary notary) throws Exception {
        final GenericCertificate certificate = getPrivacyGuard().key2cert(key);
        notary.verify(certificate);
        final LicenseContent content = (LicenseContent) this.load(certificate.getEncoded());
        this.validate(content);
        setLicenseKey(key);
        setCertificate(certificate);

        return content;
    }

    /**
     * 复写verify方法，调用本类中的validate方法，校验IP地址、Mac地址等其他信息
     */
    @Override
    protected synchronized LicenseContent verify(final LicenseNotary notary) throws Exception {

        // Load license key from preferences,
        final byte[] key = getLicenseKey();
        if (null == key) {
            throw new NoLicenseInstalledException(getLicenseParam().getSubject());
        }

        GenericCertificate certificate = getPrivacyGuard().key2cert(key);
        notary.verify(certificate);
        final LicenseContent content = (LicenseContent) this.load(certificate.getEncoded());
        this.validate(content);
        setCertificate(certificate);

        return content;
    }

    /**
     * 校验生成证书的参数信息
     */
    protected synchronized void validateCreate(final LicenseContent content) throws LicenseContentException {
        final LicenseParam param = getLicenseParam();
        final Date now = new Date();
        final Date notBefore = content.getNotBefore();
        final Date notAfter = content.getNotAfter();
        if (null != notAfter && now.after(notAfter)) {
            throw new LicenseContentException("证书失效时间不能早于当前时间");
        }
        if (null != notBefore && null != notAfter && notAfter.before(notBefore)) {
            throw new LicenseContentException("证书生效时间不能晚于证书失效时间");
        }
        final String consumerType = content.getConsumerType();
        if (null == consumerType) {
            throw new LicenseContentException("用户类型不能为空");
        }
    }

    /**
     * 复写validate方法，用于增加我们额外的校验信息
     */
    @Override
    protected synchronized void validate(final LicenseContent content) throws LicenseContentException {
        //1. 首先调用父类的validate方法
        super.validate(content);
        //2. 然后校验自定义的License参数，去校验我们的license信息
        LicenseExtraModel expectedCheckModel = (LicenseExtraModel) content.getExtra();
        // 做我们自定义的校验
    }

    /**
     * 重写XMLDecoder解析XML
     */
    private Object load(String encoded) {
        BufferedInputStream inputStream = null;
        XMLDecoder decoder = null;
        try {
            inputStream = new BufferedInputStream(new ByteArrayInputStream(encoded.getBytes(XMLConstants.XML_CHARSET)));
            decoder = new XMLDecoder(new BufferedInputStream(inputStream, XMLConstants.DEFAULT_BUFSIZE), null, null);
            return decoder.readObject();
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        } finally {
            try {
                if (decoder != null) {
                    decoder.close();
                }
                if (inputStream != null) {
                    inputStream.close();
                }
            } catch (Exception e) {
                logger.error("XMLDecoder解析XML失败", e);
            }
        }

        return null;
    }

}
```

### license生成

生成证书需要的参数类。LicenseCreatorParam

```java
/**
 * License生成类需要的参数
 */
public class LicenseCreatorParam implements Serializable {

    private static final long serialVersionUID = -7793154252684580872L;
    /**
     * 证书subject
     */
    private String subject;

    /**
     * 私钥别称
     */
    private String privateAlias;

    /**
     * 私钥密码（需要妥善保管，不能让使用者知道）
     */
    private String keyPass;

    /**
     * 访问私钥库的密码
     */
    private String storePass;

    /**
     * 证书生成路径
     */
    private String licensePath;

    /**
     * 私钥库存储路径
     */
    private String privateKeysStorePath;

    /**
     * 证书生效时间
     */
    private Date issuedTime = new Date();

    /**
     * 证书失效时间
     */
    private Date expiryTime;

    /**
     * 用户类型
     */
    private String consumerType = "user";

    /**
     * 用户数量
     */
    private Integer consumerAmount = 1;

    /**
     * 描述信息
     */
    private String description = "";

    /**
     * 额外的服务器硬件校验信息
     */
    private LicenseExtraModel licenseExtraModel;

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getPrivateAlias() {
        return privateAlias;
    }

    public void setPrivateAlias(String privateAlias) {
        this.privateAlias = privateAlias;
    }

    public String getKeyPass() {
        return keyPass;
    }

    public void setKeyPass(String keyPass) {
        this.keyPass = keyPass;
    }

    public String getStorePass() {
        return storePass;
    }

    public void setStorePass(String storePass) {
        this.storePass = storePass;
    }

    public String getLicensePath() {
        return licensePath;
    }

    public void setLicensePath(String licensePath) {
        this.licensePath = licensePath;
    }

    public String getPrivateKeysStorePath() {
        return privateKeysStorePath;
    }

    public void setPrivateKeysStorePath(String privateKeysStorePath) {
        this.privateKeysStorePath = privateKeysStorePath;
    }

    public Date getIssuedTime() {
        return issuedTime;
    }

    public void setIssuedTime(Date issuedTime) {
        this.issuedTime = issuedTime;
    }

    public Date getExpiryTime() {
        return expiryTime;
    }

    public void setExpiryTime(Date expiryTime) {
        this.expiryTime = expiryTime;
    }

    public String getConsumerType() {
        return consumerType;
    }

    public void setConsumerType(String consumerType) {
        this.consumerType = consumerType;
    }

    public Integer getConsumerAmount() {
        return consumerAmount;
    }

    public void setConsumerAmount(Integer consumerAmount) {
        this.consumerAmount = consumerAmount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LicenseExtraModel getLicenseExtraModel() {
        return licenseExtraModel;
    }

    public void setLicenseExtraModel(LicenseExtraModel licenseExtraModel) {
        this.licenseExtraModel = licenseExtraModel;
    }

}
```

生成license的逻辑实现。

```java
/**
 * License生成类 -- 用于license生成
 */
public class LicenseCreator {

    private final static X500Principal DEFAULT_HOLDER_AND_ISSUER = new X500Principal("CN=localhost, OU=localhost, O=localhost, L=SH, ST=SH, C=CN");

    private static Logger logger = LogManager.getLogger(LicenseCreator.class);

    private LicenseCreatorParam param;

    public LicenseCreator(LicenseCreatorParam param) {
        this.param = param;
    }

    /**
     * 生成License证书
     */
    public boolean generateLicense() {
        try {
            LicenseManager licenseManager = new CustomLicenseManager(initLicenseParam());
            LicenseContent licenseContent = initLicenseContent();
            licenseManager.store(licenseContent, new File(param.getLicensePath()));
            return true;
        } catch (Exception e) {
            logger.error(MessageFormat.format("证书生成失败：{0}", param), e);
            return false;
        }
    }

    /**
     * 初始化证书生成参数
     */
    private LicenseParam initLicenseParam() {
        Preferences preferences = Preferences.userNodeForPackage(LicenseCreator.class);

        //设置对证书内容加密的秘钥
        CipherParam cipherParam = new DefaultCipherParam(param.getStorePass());

        KeyStoreParam privateStoreParam = new CustomKeyStoreParam(LicenseCreator.class
                , param.getPrivateKeysStorePath()
                , param.getPrivateAlias()
                , param.getStorePass()
                , param.getKeyPass());

        return new DefaultLicenseParam(param.getSubject()
                , preferences
                , privateStoreParam
                , cipherParam);
    }

    /**
     * 设置证书生成正文信息
     */
    private LicenseContent initLicenseContent() {
        LicenseContent licenseContent = new LicenseContent();
        licenseContent.setHolder(DEFAULT_HOLDER_AND_ISSUER);
        licenseContent.setIssuer(DEFAULT_HOLDER_AND_ISSUER);

        licenseContent.setSubject(param.getSubject());
        licenseContent.setIssued(param.getIssuedTime());
        licenseContent.setNotBefore(param.getIssuedTime());
        licenseContent.setNotAfter(param.getExpiryTime());
        licenseContent.setConsumerType(param.getConsumerType());
        licenseContent.setConsumerAmount(param.getConsumerAmount());
        licenseContent.setInfo(param.getDescription());

        //扩展校验，这里可以自定义一些额外的校验信息(也可以用json字符串保存)
        if (param.getLicenseExtraModel() != null) {
            licenseContent.setExtra(param.getLicenseExtraModel());
        }

        return licenseContent;
    }

}
```

这里我们简单一点直接测试代码来生成证书。最后会在我们的指定目录下面生成一个license.lic文件。

```java
    @Test
    public void licenseCreate() {
        // 生成license需要的一些参数
        LicenseCreatorParam param = new LicenseCreatorParam();
        param.setSubject("ioserver");
        param.setPrivateAlias("privateKey");
        param.setKeyPass("a123456");
        param.setStorePass("a123456");
        param.setLicensePath("D:\\licenseTest\\license.lic");
        param.setPrivateKeysStorePath("D:\\licenseTest\\privateKeys.keystore");
        Calendar issueCalendar = Calendar.getInstance();
        param.setIssuedTime(issueCalendar.getTime());
        Calendar expiryCalendar = Calendar.getInstance();
        expiryCalendar.set(2020, Calendar.DECEMBER, 31, 23, 59, 59);
        param.setExpiryTime(expiryCalendar.getTime());
        param.setConsumerType("user");
        param.setConsumerAmount(1);
        param.setDescription("测试");
        LicenseCreator licenseCreator = new LicenseCreator(param);
        // 生成license
        licenseCreator.generateLicense();
    }
```

### license验证

license验证的具体实现。

```java
/**
 * License校验类
 */
public class LicenseVerify {

    private static Logger logger = LogManager.getLogger(LicenseVerify.class);
    /**
     * 证书subject
     */
    private String subject;
    /**
     * 公钥别称
     */
    private String publicAlias;
    /**
     * 访问公钥库的密码
     */
    private String storePass;
    /**
     * 证书生成路径
     */
    private String licensePath;
    /**
     * 密钥库存储路径
     */
    private String publicKeysStorePath;
    /**
     * LicenseManager
     */
    private LicenseManager licenseManager;
    /**
     * 标识证书是否安装成功
     */
    private boolean installSuccess;

    public LicenseVerify(String subject, String publicAlias, String storePass, String licensePath, String publicKeysStorePath) {
        this.subject = subject;
        this.publicAlias = publicAlias;
        this.storePass = storePass;
        this.licensePath = licensePath;
        this.publicKeysStorePath = publicKeysStorePath;
    }

    /**
     * 安装License证书，读取证书相关的信息, 在bean加入容器的时候自动调用
     */
    public void installLicense() {
        try {
            Preferences preferences = Preferences.userNodeForPackage(LicenseVerify.class);

            CipherParam cipherParam = new DefaultCipherParam(storePass);

            KeyStoreParam publicStoreParam = new CustomKeyStoreParam(LicenseVerify.class,
                    publicKeysStorePath,
                    publicAlias,
                    storePass,
                    null);
            LicenseParam licenseParam = new DefaultLicenseParam(subject, preferences, publicStoreParam, cipherParam);

            licenseManager = new CustomLicenseManager(licenseParam);
            licenseManager.uninstall();
            LicenseContent licenseContent = licenseManager.install(new File(licensePath));
            DateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            installSuccess = true;
            logger.info("------------------------------- 证书安装成功 -------------------------------");
            logger.info(MessageFormat.format("证书有效期：{0} - {1}", format.format(licenseContent.getNotBefore()), format.format(licenseContent.getNotAfter())));
        } catch (Exception e) {
            installSuccess = false;
            logger.error("------------------------------- 证书安装失败 -------------------------------");
            logger.error(e);
        }
    }

    /**
     * 卸载证书，在bean从容器移除的时候自动调用
     */
    public void unInstallLicense() {
        if (installSuccess) {
            try {
                licenseManager.uninstall();
            } catch (Exception e) {
                // ignore
            }
        }
    }

    /**
     * 校验License证书
     */
    public boolean verify() {
        try {
            LicenseContent licenseContent = licenseManager.verify();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

}
```

把LicenseVerify类添加到Spring容器里面去。在LicenseVerify添加到spring容器的时候顺便调用LicenseVerify对象里面的installLicense()方法加载证书。

```java
@Configuration
public class LicenseConfig {

    /**
     * 证书subject
     */
    @Value("${license.subject}")
    private String subject;

    /**
     * 公钥别称
     */
    @Value("${license.publicAlias}")
    private String publicAlias;

    /**
     * 访问公钥库的密码
     */
    @Value("${license.storePass}")
    private String storePass;

    /**
     * 证书生成路径
     */
    @Value("${license.licensePath}")
    private String licensePath;

    /**
     * 密钥库存储路径
     */
    @Value("${license.publicKeysStorePath}")
    private String publicKeysStorePath;

    @Bean(initMethod = "installLicense", destroyMethod = "unInstallLicense")
    public LicenseVerify licenseVerify() {
        return new LicenseVerify(subject, publicAlias, storePass, licensePath, publicKeysStorePath);
    }

}
```

application.yml文件需要的配置

```yml
#License相关配置
license:
  subject: ioserver #主题
  publicAlias: publicCert #公钥别称
  storePass: a123456 #访问公钥的密码
  licensePath: D:\licenseTest\license.lic #license位置
  publicKeysStorePath: D:\licenseTest\publicCerts.keystore #公钥位置
```

license验证测试。

```java
@SpringBootTest
@RunWith(SpringRunner.class)
public class LicenseTest {

    private LicenseVerify licenseVerify;

    @Autowired
    public void setLicenseVerify(LicenseVerify licenseVerify) {
        this.licenseVerify = licenseVerify;
    }

    @Test
    public void licenseVerify() {
       System.out.println("licese是否有效：" + licenseVerify.verify());
    }

}
```