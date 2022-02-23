package org.jumpmind.pos.service.filter;

import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Builder;
import lombok.Data;
import org.springframework.core.MethodParameter;

import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;

@Data
@Builder
public class RequestContext {

    ObjectMapper objectMapper;
    HttpServletRequest request;
    Method targetMethod;
    String path;
    String version;
    Class<?> inputType;
    Class<?> outputType;
    String json;
    JavaType javaType;
    MethodParameter methodParameter;
}