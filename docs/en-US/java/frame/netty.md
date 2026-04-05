Util.release(msg);
            logger.info("【不支持二进制】");
            throw new UnsupportedOperationException("不支持二进制");
        }
        TextWebSocketFrame textWebSocketFrame = (TextWebSocketFrame)msg;
        //获取发来的消息
        String text = textWebSocketFrame.text();
        if ("ping".equals(text)) {
            ctx.channel().writeAndFlush(new TextWebSocketFrame("pong"));
        } else {
            try{
                RequestDto dto = JSON.parseObject(text, RequestDto.class);
                ResponseDto result = messageService.doMessage(dto, ctx.channel().id().toString());
                channelRepository.sendMessage(ctx.channel(), result);
            } catch (Exception e){
                logger.error("参数错误", e);
                ResponseDto responseDTO = new ResponseDto();
                responseDTO.setCode(1);
                responseDTO.setMsg("参数错误");
                channelRepository.sendMessage(ctx.channel(), responseDTO);
            }
        }
    }

    private static void sendHttpResponse(ChannelHandlerContext ctx, FullHttpRequest req, DefaultFullHttpResponse res) {
        // 返回应答给客户端
        if (res.status().code() != 200) {
            ByteBuf buf = Unpooled.copiedBuffer(res.status().toString(), CharsetUtil.UTF_8);
            res.content().writeBytes(buf);
            buf.release();
        }
        // 如果是非Keep-Alive，关闭连接
        ChannelFuture f = ctx.channel().writeAndFlush(res);
        if (!HttpUtil.isKeepAlive(req) || res.status().code() != 200) {
            f.addListener(ChannelFutureListener.CLOSE);
        }
    }

    @Override
    public void userEventTriggered(ChannelHandlerContext ctx, Object evt) throws Exception {
        if (evt instanceof IdleStateEvent) {
            IdleState state = ((IdleStateEvent) evt).state();
            switch (state){
                //读空闲（服务器端）
                case READER_IDLE:
                    // 在规定时间内没有收到客户端的上行数据, 主动断开连接
                    logger.info("客服端：{}，读空闲心跳检测触发，socket连接断开！",
                            channelRepository.getClientIdByChannelId(ctx.channel().id().toString()));
                    this.closeChannel(ctx.channel());
                    break;
                //写空闲（客户端）
                case WRITER_IDLE:
                    break;
                case ALL_IDLE:
                    break;
            }
        } else {
            super.userEventTriggered(ctx, evt);
        }
    }

    @Override
    public void channelInactive(ChannelHandlerContext ctx) {
        InetSocketAddress reAddr = (InetSocketAddress) ctx.channel().remoteAddress();
        String clientIP = reAddr.getAddress().getHostAddress();
        String clientPort = String.valueOf(reAddr.getPort());
        this.closeChannel(ctx.channel());
        logger.error("连接断开：{}:{}", clientIP, clientPort);
    }

    /**
     * 连接异常   需要关闭相关资源
     */
    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        ctx.close();
    }

    private void closeChannel(ChannelHandlerContext ctx){
        try{
            ctx.channel().close();
            ctx.close();
        }catch (Exception e){
            logger.error( "channel close is error",e);
        } finally {
            ctx.close();
        }
    }

    private void closeChannel(Channel channel){
        try{
            channelRepository.remove(channel);
            channel.close();
        }catch (Exception e){
            logger.error( "channel close is error",e);
        } finally {
            channel.close();
        }
    }
}
```

```java title="协议选择.java"
package com.yinhai.helper.websocket.handler;

import com.yinhai.helper.common.util.SpringContextUtil;
import com.yinhai.helper.websocket.config.PipelineAdd;
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.ByteToMessageDecoder;
import org.springframework.stereotype.Component;

import java.nio.charset.Charset;
import java.util.List;

/**
 * 协议初始化解码器.
 *
 * 用来判定实际使用什么协议.</b>
 *
 */
@Component
public class SocketChooseHandler extends ByteToMessageDecoder {
    /** 默认暗号长度为23 */
    private static final int MAX_LENGTH = 23;
    /** WebSocket握手的协议前缀 */
    private static final String WEBSOCKET_PREFIX = "GET /websocket";

    @Override
    protected void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) {
        String protocol = getBufStart(in);
        if (protocol.startsWith(WEBSOCKET_PREFIX)) {
            SpringContextUtil.getBean(PipelineAdd.class).websocketAdd(ctx);

        } else {
            SpringContextUtil.getBean(PipelineAdd.class).socketAdd(ctx);
        }

        ctx.pipeline().remove(this.getClass());
    }

    private String getBufStart(ByteBuf in){
        int length = in.readableBytes();
        if (length > MAX_LENGTH) {
            length = MAX_LENGTH;
        }

        // 标记读位置
        in.markReaderIndex();
        byte[] content = new byte[length];
        in.readBytes(content);
        in.resetReaderIndex();
        return new String(content, Charset.defaultCharset());
    }
}
```

```java title="服务.java"
package com.yinhai.helper.websocket.service;


import com.yinhai.helper.websocket.entity.RequestDto;
import com.yinhai.helper.websocket.entity.ResponseDto;

/**
 * @Description ：
 * @Author ： fangcy
 * @Date ： 2018/10/11 16:09
 */
public interface IMessageService {

    ResponseDto doMessage(RequestDto dto, String channelId);

    void sendBigScreenRealTimeLegalDoubtsDataToClients();

    void sendBigScreenRealTimeReasonableDoubtsDataToClients();

    void sendBigScreenRealTimeBusinessDataToClients();
}
```

```java title="服务实现.java"
package com.yinhai.helper.websocket.service.impl;

import com.yinhai.helper.common.enums.EResultCode;
import com.yinhai.helper.entity.bo.BigScreenRealTimeQueryBo;
import com.yinhai.helper.entity.vo.BigScreenRealTimeBusinessDataVo;
import com.yinhai.helper.entity.vo.BigScreenRealTimeDoubtsVo;
import com.yinhai.helper.service.his.IBusinessDataSummaryByTypeService;
import com.yinhai.helper.service.rule.ILegalEngineDoubtsService;
import com.yinhai.helper.service.rule.ISupervisionRuleService;
import com.yinhai.helper.service.sys.ICommonService;
import com.yinhai.helper.websocket.entity.RequestDto;
import com.yinhai.helper.websocket.entity.ResponseDto;
import com.yinhai.helper.websocket.handler.ChannelRepository;
import com.yinhai.helper.websocket.service.IMessageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;

/**
 * @Description ：
 * @Author ： fangcy
 * @Date ： 2018/10/11 16:11
 */
@Service
@Slf4j
public class MessageServiceImpl implements IMessageService {
    private ChannelRepository channelRepository = ChannelRepository.getInstance();
    @Resource
    private ILegalEngineDoubtsService legalEngineDoubtsService;
    @Resource
    private ISupervisionRuleService supervisionRuleService;
    @Resource
    private IBusinessDataSummaryByTypeService businessDataSummaryByTypeService;
    @Resource
    private ICommonService iCommonService;

    @Override
    public ResponseDto doMessage(RequestDto dto, String channelId) {
        ResponseDto response = new ResponseDto();
        System.out.println("客服端数：" + channelRepository.getAll().size());
        String registrationId = iCommonService.getRegistrationId();
        BigScreenRealTimeQueryBo bo = new BigScreenRealTimeQueryBo();
        bo.setRegistrationId(registrationId);
        if ("getLegalDoubtsData".equals(dto.getMethod())) {   // 获取不合理数据
            channelRepository.setChannelDtoQueryByClientId(channelId, bo);
            BigScreenRealTimeDoubtsVo vo = new BigScreenRealTimeDoubtsVo();
            vo.setDoubtsSum(supervisionRuleService.queryDoubtsSum(bo));
            vo.setDoubtsDetailList(legalEngineDoubtsService.queryLegalEngineDoubtsByRegistrationId(bo));
            vo.setRulesSumList(supervisionRuleService.querySupervisionRuleByRegistrationId(bo));
            response.setData(vo);
        } else if ("getReasonableDoubtsData".equals(dto.getMethod())) { //获取不合法数据
            channelRepository.setChannelDtoQueryByClientId(channelId, bo);
            BigScreenRealTimeDoubtsVo vo = new BigScreenRealTimeDoubtsVo();
            vo.setDoubtsSum(supervisionRuleService.queryWiseDoubtsSum(bo));
            vo.setDoubtsDetailList(legalEngineDoubtsService.queryWiseLegalEngineDoubtsByRegistrationId(bo));
            vo.setRulesSumList(supervisionRuleService.queryWiseSupervisionRuleByRegistrationId(bo));
            response.setData(vo);
        } else if ("getBusinessData".equals(dto.getMethod())) { //获取业务数据总量、门诊、住院、各个业务类型的数据量
            channelRepository.setChannelDtoQueryByClientId(channelId, bo);
            BigScreenRealTimeBusinessDataVo vo = new BigScreenRealTimeBusinessDataVo();
            List<Map<String, Object>> list = businessDataSummaryByTypeService.queryTreatmentTypeByRegistrationId(bo);
            int businessData = list.stream().mapToInt(t -> Integer.parseInt(t.get("businessdata") + "")).sum();
            vo.setBusinessSum(businessData);
            vo.setTreatmentTypeSum(list);
            vo.setBusinessTypeSum(businessDataSummaryByTypeService.queryBusinessTypeByRegistrationId(bo));
            response.setData(vo);
        }
        response.setMethod(dto.getMethod());
        response.setCode(EResultCode.COMMON_SUCCESS.getCode());
        response.setMsg(EResultCode.COMMON_SUCCESS.getMsg());
        return response;
    }

    @Override
    public void sendBigScreenRealTimeLegalDoubtsDataToClients() {
        ResponseDto response = new ResponseDto();
        response.setMethod("getLegalDoubtsData");
        response.setCode(EResultCode.COMMON_SUCCESS.getCode());
        response.setMsg(EResultCode.COMMON_SUCCESS.getMsg());
        channelRepository.getAll().forEach(dto -> {
            if (dto.getBigScreenRealTimeQueryBO() != null) {
                BigScreenRealTimeDoubtsVo vo = new BigScreenRealTimeDoubtsVo();
                vo.setDoubtsSum(supervisionRuleService.queryDoubtsSum(dto.getBigScreenRealTimeQueryBO()));
                vo.setDoubtsDetailList(legalEngineDoubtsService.queryLegalEngineDoubtsByRegistrationId(dto.getBigScreenRealTimeQueryBO()));
                vo.setRulesSumList(supervisionRuleService.querySupervisionRuleByRegistrationId(dto.getBigScreenRealTimeQueryBO()));
                response.setData(vo);
                channelRepository.sendMessage(dto.getChannel(), response);
            }
        });
    }

    @Override
    public void sendBigScreenRealTimeReasonableDoubtsDataToClients() {
        ResponseDto response = new ResponseDto();
        response.setMethod("getReasonableDoubtsData");
        response.setCode(EResultCode.COMMON_SUCCESS.getCode());
        response.setMsg(EResultCode.COMMON_SUCCESS.getMsg());
        channelRepository.getAll().forEach(dto -> {
            if (dto.getBigScreenRealTimeQueryBO() != null) {
                BigScreenRealTimeDoubtsVo vo = new BigScreenRealTimeDoubtsVo();
                vo.setDoubtsSum(supervisionRuleService.queryWiseDoubtsSum(dto.getBigScreenRealTimeQueryBO()));
                vo.setDoubtsDetailList(legalEngineDoubtsService.queryWiseLegalEngineDoubtsByRegistrationId(dto.getBigScreenRealTimeQueryBO()));
                vo.setRulesSumList(supervisionRuleService.queryWiseSupervisionRuleByRegistrationId(dto.getBigScreenRealTimeQueryBO()));
                response.setData(vo);
                channelRepository.sendMessage(dto.getChannel(), response);
            }
        });
    }

    @Override
    public void sendBigScreenRealTimeBusinessDataToClients() {
        ResponseDto response = new ResponseDto();
        response.setMethod("getBusinessData");
        response.setCode(EResultCode.COMMON_SUCCESS.getCode());
        response.setMsg(EResultCode.COMMON_SUCCESS.getMsg());
        channelRepository.getAll().forEach(dto -> {
            if (dto.getBigScreenRealTimeQueryBO() != null) {
                BigScreenRealTimeBusinessDataVo vo = new BigScreenRealTimeBusinessDataVo();
                List<Map<String, Object>> list = businessDataSummaryByTypeService.queryTreatmentTypeByRegistrationId(dto.getBigScreenRealTimeQueryBO());
                int businessData = list.stream().mapToInt(t -> Integer.parseInt(t.get("businessdata") + "")).sum();
                vo.setBusinessSum(businessData);
                vo.setTreatmentTypeSum(list);
                vo.setBusinessTypeSum(businessDataSummaryByTypeService.queryBusinessTypeByRegistrationId(dto.getBigScreenRealTimeQueryBO()));
                response.setData(vo);
                channelRepository.sendMessage(dto.getChannel(), response);
            }
        });
    }

}
```

## 工具类
```java
package com.yinhai.helper.websocket.util;

import java.util.HashMap;
import java.util.Map;

/**
 * @Description ：
 * @Author ： fcy
 * @Date ： 2017/09/19 09:59
 */
public class WebUtils {

    /**
     * 获取请求地址里面的参数
     * @param msg
     * @return
     */
    public static Map<String, String> getRequestAddrParams(String msg){
        if (msg.length() == 0 || !msg.contains("&")){
            return null;
        }
        Map<String, String> params = new HashMap<>(10);
        for (String m : msg.split("&")){
            params.put(m.split("=")[0], m.split("=")[1]);
        }
        return params;
    }
}
```

## 常见问题

### 有时会遇到内存泄漏问题

:::tip
未找到根本原因，使用上影响不大。
:::

### 通讯数据不完整问题原因及处理

原因是浏览器对大数据量请求时，会自动将数据进行分片传输。数据会以ContinuationFrame的形式发送, 直到isFinalFragment为true时结束, 中间不会穿插其它的Frame。

可针对ContinuationFrame的数据进行拼接，得到完整数据后再进行业务操作。

```java
import io.netty.handler.codec.http.websocketx.ContinuationWebSocketFrame;
 
private StringBuilder frameBuffer = null;

protected void handleWebSocketFrame(ChannelHandlerContext ctx, WebSocketFrame frame) {
    if (frame instanceof TextWebSocketFrame) {
        frameBuffer = new StringBuilder();
        frameBuffer.append(((TextWebSocketFrame)frame).text());
    }
    else if (frame instanceof ContinuationWebSocketFrame) {
        if (frameBuffer != null) {
            frameBuffer.append(((ContinuationWebSocketFrame)frame).text());
        }
        else {
            logger.warn("Continuation frame received without initial frame.");
        }
    }
    else {
        throw new UnsupportedOperationException(String.format("%s frame types not supported", frame.getClass().getName()));
    }
 
    // Check if Text or Continuation Frame is final fragment and handle if needed.
    if (frame.isFinalFragment()) {
        handleMessageCompleted(ctx, frameBuffer.toString());
        frameBuffer = null;
    }
}
```
