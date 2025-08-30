---
title: excel
page: false
---

# excel

## 依赖

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>easyexcel</artifactId>
    <version>2.2.6</version>
</dependency>
```

## 普通导入excel示例

- 文件编码检测依赖

用于csv文件编码检测，避免用户上传的文件编码错误导致乱码问题，如果是其他文件类型，可忽略此依赖

```xml
<dependency>
    <groupId>com.github.albfernandez</groupId>
    <artifactId>juniversalchardet</artifactId>
    <version>2.4.0</version>
</dependency>
```

- 检测文件编码

```java
import org.mozilla.universalchardet.UniversalDetector;

import java.io.IOException;
import java.io.InputStream;

public class FileEncodingDetector {
    public static String detectEncoding(InputStream inputStream) throws IOException {
        UniversalDetector detector = new UniversalDetector(null);
        byte[] buf = new byte[4096];
        int nread;
        while ((nread = inputStream.read(buf)) > 0 && !detector.isDone()) {
            detector.handleData(buf, 0, nread);
        }
        detector.dataEnd();
        String encoding = detector.getDetectedCharset();
        detector.reset();
        return encoding == null ? "UTF-8" : encoding;
    }
}
```

- 导入示例伪代码

```java
import com.alibaba.excel.EasyExcelFactory;
import com.alibaba.excel.ExcelReader;
import com.alibaba.excel.metadata.Sheet;
import com.alibaba.excel.read.metadata.ReadSheet;
import com.alibaba.excel.support.ExcelTypeEnum;
import com.alibaba.excel.util.StringUtils;
import com.yinhai.dmas.fc.base.core.FileEncodingDetector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

public class ExcelImport {
    private static final Logger LOGGER = LoggerFactory.getLogger(ExcelImport.class);

    public void importFileData(MultipartFile file, String userId) {
        int batchSaveSize = 200;
        List<xxx> templateList = new java.util.ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        String uploadDataBatchNumber = UUIDUtils.getUUID();
        try {
            String encoding = FcUtil.detectEncoding(file.getInputStream());
            EasyExcelFactory.read(file.getInputStream(), xxx.class, new ReadListener<xxx>() {
                @Override
                public void invoke(xxx template, AnalysisContext analysisContext) {
                    xxx po = new xxx();
                    templateList.add(po);
                    if (templateList.size() >= batchSaveSize) {
                        this.save();
                    }
                }

                @Override
                public void doAfterAllAnalysed(AnalysisContext analysisContext) {
                    if (!templateList.isEmpty()) {
                        this.save();
                    }
                }

                private synchronized void save() {
                    fcSpecialHilistConfMapper.batchInsert(templateList);
                    templateList.clear();
                }
            }).charset(Charset.forName(encoding)).excelType(ExcelTypeEnum.CSV).sheet().doRead();
        } catch (Exception e) {
            log.error("导入文件失败", e);
            throw new AppException("导入文件失败");
        }
    }
}
```

## 普通导出excel示例

```java
import com.alibaba.excel.EasyExcelFactory;
import com.alibaba.excel.ExcelWriter;
import com.alibaba.excel.write.metadata.WriteSheet;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

public class ExcelExport {
    /**
     * 使用com.alibaba.excel工具进行导出excel数据
     *
     * @param response
     * @param fileName  文件名称
     * @param sheetName  excel的sheet页名称
     * @param head   数据表头
     * @param data   数据列表
     **/
    public static void exportWriteExcel(HttpServletResponse response, String fileName,
                                        String sheetName, Class<?> head, Collection<?> data,
                                        List<String> excludeColumnFieldNames){
        try (OutputStream out = response.getOutputStream()){
            // 设置输出流的请求头
            response.setContentType("application/force-download");
            response.addHeader("Content-Disposition", String.format("attachment; filename=\"%s\"", URLEncoder.encode(fileName, "utf-8")));
            response.setHeader("Content-Disposition", "attachment;filename=" + fileName + ";filename*=utf-8''" + URLEncoder.encode(fileName, "UTF-8"));
            response.flushBuffer();
            // 导出方法
            EasyExcelFactory.write(out, head).excelType(ExcelTypeEnum.CSV)
                    .excludeColumnFieldNames(excludeColumnFieldNames)
                    .sheet(sheetName).doWrite(data);
            out.flush();
        } catch (Exception e) {
            LOGGER.error("", e);
            throw new RuntimeException(e.getMessage());
        }
    }
}
```

## 流式导出excel示例

### 数据库流式查询

- 可关闭游标接口

```java
import java.util.Iterator;

/**
 * 可关闭游标
 * 实现用于提供迭代器操作的就诊数据
 * 提供关闭相关资源方法
 *
 * @author fangcy
 */
public interface ClosableIterator<T> extends Iterator<T>, AutoCloseable {
    boolean hasNext();

    T next();

    void close();
}

```

- 可关闭游标抽象类

```java
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.session.SqlSession;

import java.util.Iterator;

/**
 * 可关闭游标
 * 实现用于提供迭代器操作的就诊数据
 * 提供关闭相关资源方法
 *
 * @author fangcy
 */
@Slf4j
public abstract class AbstractClosableIterator<T> implements ClosableIterator<T> {

    @Override
    public boolean hasNext() {
        return getIterator().hasNext();
    }

    @Override
    public T next() {
        return getIterator().next();
    }

    @Override
    public void close() {
        SqlSession sqlSession = getSqlSession();
        if (sqlSession != null) {
            try {
                sqlSession.close();
            } catch (Exception e) {
                log.info("sqlSession 连接已关闭");
            }
        }
    }

    public abstract Iterator<T> getIterator();

    public abstract SqlSession getSqlSession();

}
```
- 可关闭游标实现类伪代码

```java
import com.xxx.entity.vo.XxxVo;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.cursor.Cursor;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;

import java.util.Iterator;

@Slf4j
public class FcSpecialHilistConfClosableIterator extends AbstractClosableIterator<XxxVo> {
    private final Iterator<XxxVo> xxxIterator;
    private final SqlSession sqlSession;

    public FcSpecialHilistConfClosableIterator(SqlSessionFactory sqlSessionFactory, FcSpecialHilistConfPageQuery query) {
        sqlSession = sqlSessionFactory.openSession(false);
        //打印该任务批次信息
        // 使用 selectCursor 获取游标
        Cursor<XxxVo> cursor = sqlSession.selectCursor(
                "com.xxx.mapper.xxxMapper.selectList", query);
        this.xxxIterator = cursor.iterator();
    }

    @Override
    public Iterator<XxxVo> getIterator() {
        return xxxIterator;
    }

    @Override
    public SqlSession getSqlSession() {
        return sqlSession;
    }
}

```

- 流式导出excel工具类

```java
package com.yinhai.dmas.fc.base.core;

import com.alibaba.excel.EasyExcelFactory;
import com.alibaba.excel.ExcelWriter;
import com.alibaba.excel.support.ExcelTypeEnum;
import com.alibaba.excel.write.metadata.WriteSheet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletResponse;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;

/**
 * excel 流式数据导出
 *
 * @param <T>
 */
public class ExcelClosableIteratorExport<T> {
    private static final Logger LOGGER = LoggerFactory.getLogger(ExcelClosableIteratorExport.class);
    private final int batchSize;

    private final ClosableIterator<T> closableIterator;

    public ExcelClosableIteratorExport(ClosableIterator<T> closableIterator) {
        this.closableIterator = closableIterator;
        this.batchSize = 1000;
    }

    public ExcelClosableIteratorExport(ClosableIterator<T> closableIterator, int batchSize) {
        this.closableIterator = closableIterator;
        this.batchSize = batchSize;
    }


    public void export(String fileName, String sheetName, Class<T> head, HttpServletResponse response) {
        List<T> dataList = new ArrayList<>();
        try (OutputStream out = response.getOutputStream();
             ExcelWriter excelWriter = EasyExcelFactory.write(out, head).excelType(ExcelTypeEnum.CSV).build()) {
            // 设置输出流的请求头
            response.setContentType("application/force-download");
            response.addHeader("Content-Disposition", String.format("attachment; filename=\"%s\"", URLEncoder.encode(fileName, "utf-8")));
            response.setHeader("Content-Disposition", "attachment;filename=" + fileName + ";filename*=utf-8''" + URLEncoder.encode(fileName, "UTF-8"));
            response.flushBuffer();
            WriteSheet writeSheet = EasyExcelFactory.writerSheet(sheetName.split("\\.")[0]).build();
            while (closableIterator.hasNext()) {
                dataList.add(closableIterator.next());
                if (dataList.size() >= batchSize) {
                    excelWriter.write(dataList, writeSheet);
                    dataList.clear();
                }
            }
            // 确保剩余数据被写入
            if (!dataList.isEmpty()) {
                excelWriter.write(dataList, writeSheet);
            }
        } catch (Exception e) {
            LOGGER.error("Excel 导出失败", e);
        } finally {
            closableIterator.close();
        }
    }
}
```