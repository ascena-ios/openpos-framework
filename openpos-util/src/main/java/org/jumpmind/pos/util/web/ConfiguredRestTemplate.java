package org.jumpmind.pos.util.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.ssl.TrustStrategy;
import org.jumpmind.pos.util.DefaultObjectMapper;
import org.jumpmind.pos.util.model.ErrorResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.http.client.*;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.DefaultResponseErrorHandler;
import org.springframework.web.client.RestTemplate;

import javax.net.ssl.SSLContext;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.security.cert.X509Certificate;
import java.util.*;

@Slf4j
public class ConfiguredRestTemplate extends RestTemplate {

    ObjectMapper mapper;

    private Map<String, String> additionalHeaders;

    static BufferingClientHttpRequestFactory build(int timeout, int connectTimeout) {
        HttpComponentsClientHttpRequestFactory httpRequestFactory = new HttpComponentsClientHttpRequestFactory();
        httpRequestFactory.setConnectionRequestTimeout(timeout * 1000);
        httpRequestFactory.setConnectTimeout(connectTimeout * 1000);
        httpRequestFactory.setReadTimeout(timeout * 1000);

        try {
            TrustStrategy acceptingTrustStrategy = (X509Certificate[] chain, String authType) -> true;
            SSLContext sslContext = org.apache.http.ssl.SSLContexts.custom()
                    .loadTrustMaterial(acceptingTrustStrategy)
                    .build();
            SSLConnectionSocketFactory csf = new SSLConnectionSocketFactory(sslContext);
            CloseableHttpClient httpClient = HttpClients.custom()
                    .setSSLSocketFactory(csf)
                    .build();
            httpRequestFactory.setHttpClient(httpClient);
        } catch (Exception ex) {
            log.warn("Failed to configure accepting trust store", ex);
        }
        return new BufferingClientHttpRequestFactory(httpRequestFactory);
    }

    public ConfiguredRestTemplate() {
        this(30);
    }

    public ConfiguredRestTemplate(int timeout) {
        this(timeout, timeout);
    }

    public ConfiguredRestTemplate(int timeout, int connectTimeout) {
        super(build(timeout, connectTimeout));
        this.mapper = DefaultObjectMapper.build();
        getMessageConverters().add(0, new MappingJackson2HttpMessageConverter(this.mapper) {

            @Override
            public boolean canRead(java.lang.Class<?> clazz,
                                   org.springframework.http.MediaType mediaType) {
                return super.canRead(mediaType);
            }
            @Override
            public boolean canRead(java.lang.reflect.Type type,
                                   java.lang.Class<?> contextClass,
                                   org.springframework.http.MediaType mediaType) {
                return super.canRead(mediaType);
            }
        });
        List<ClientHttpRequestInterceptor> interceptors = new ArrayList<>();
        interceptors.add(new LoggingRequestInterceptor());
        setInterceptors(interceptors);
        setErrorHandler(new DefaultResponseErrorHandler() {
            @Override
            public void handleError(ClientHttpResponse response) throws IOException {
                if (response.getStatusCode().series() == HttpStatus.Series.SERVER_ERROR) {
                    ErrorResult result = mapper.readValue(response.getBody(), ErrorResult.class);
                    Throwable serverError = result.getThrowable();
                    String serverMessage = result.getMessage();
                    if (serverError != null && serverError instanceof RuntimeException) {
                        throw (RuntimeException) serverError;
                    } else if (serverMessage != null) {
                        throw new ServerException(serverMessage, serverError);
                    } else {
                        super.handleError(response);
                    }
                } else if (response.getStatusCode().series() == HttpStatus.Series.CLIENT_ERROR) {

                    if (response.getStatusCode() == HttpStatus.NOT_FOUND) {
                        throw new NotFoundException();
                    } else {
                        super.handleError(response);
                    }

                }
            }
        });

    }

    public void addHeader(String name, String value){
        if( additionalHeaders == null){
            additionalHeaders = new HashMap<>();
        }
        additionalHeaders.put(name, value);
    }

    public void execute(String url, Object request, HttpMethod method, Object... args) {
        execute(url, buildRequestEntity(request), Void.class, method, args);
    }

    public void execute(String url, Object request, HttpMethod method, HttpHeaders headers, Object... args) {
        execute(url, buildRequestEntity(request), Void.class, method, headers, args);
    }

    public <T> T execute(String url, Object request, Class<T> responseClass, HttpMethod method, Object... args) {
        return exchange(url, method, buildRequestEntity(request), responseClass, args).getBody();
    }

    public <T> T execute(String url, Object request, Class<T> responseClass, HttpMethod method, HttpHeaders headers, Object... args) {
        return exchange(url, method, buildRequestEntity(request, headers), responseClass, args).getBody();
    }

    public <T> HttpEntity<T> buildRequestEntity(T request) {
        return new HttpEntity<T>(request, buildHeaders());
    }

    public <T> HttpEntity<T> buildRequestEntity(T request, HttpHeaders headers) {
        headers.addAll(buildHeaders());
        return new HttpEntity<T>(request, headers);
    }

    public HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Accept", MediaType.APPLICATION_JSON_VALUE);

        if( additionalHeaders != null){
            additionalHeaders.forEach(headers::set);
        }

        return headers;
    }

    public ObjectMapper getMapper() {
        return mapper;
    }

}

class LoggingRequestInterceptor implements ClientHttpRequestInterceptor {

    private static final Logger log = LoggerFactory.getLogger(LoggingRequestInterceptor.class.getPackage().getName() + ".REST");
    private static final List<MediaType> imageContentTypes =Arrays.asList(MediaType.IMAGE_PNG, MediaType.IMAGE_GIF, MediaType.IMAGE_JPEG);

    @Override
    public ClientHttpResponse intercept(HttpRequest request, byte[] body, ClientHttpRequestExecution execution) throws IOException {
        traceRequest(request, body);
        ClientHttpResponse response = execution.execute(request, body);
        traceResponse(response);
        return response;
    }

    private void traceRequest(HttpRequest request, byte[] body) throws IOException {
        log.info("===========================request begin================================================");
        log.info("URI         : {}", request.getURI());
        log.info("Method      : {}", request.getMethod());
        log.info("Headers     : {}", request.getHeaders());
        if (!request.getURI().getPath().contains("/logs/upload")) {
            log.info("Request body: {}", new String(body, "UTF-8"));
        }
        log.info("==========================request end================================================");
    }

    private void traceResponse(ClientHttpResponse response) throws IOException {
        StringBuilder inputStringBuilder = new StringBuilder();
        if (imageContentTypes.contains(response.getHeaders().getContentType())) {
            inputStringBuilder.append("Response body logging skipped due to it being an image.");
        } else {
            BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(response.getBody(), StandardCharsets.UTF_8));
            String line = bufferedReader.readLine();
            while (line != null) {
                inputStringBuilder.append(line);
                inputStringBuilder.append('\n');
                line = bufferedReader.readLine();
            }
        }
        log.info("============================response begin==========================================");
        log.info("Status code  : {}", response.getStatusCode());
        log.info("Status text  : {}", response.getStatusText());
        log.info("Headers      : {}", response.getHeaders());
        log.info("Response body: {}", inputStringBuilder);
        log.info("=======================response end=================================================");
    }

}
