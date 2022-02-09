package org.jumpmind.pos.core.content;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Scope;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;

@Component("classPathContentProvider")
@Slf4j
@Scope("device")
public class ClassPathContentProvider extends AbstractFileContentProvider {

    private static final String DEFAULT_LOCATION = "content/";

    @Value("${openpos.ui.content.class-path.baseContentPath:content/}")
    String baseContentPath;

    @Override
    public String getContentUrl(String deviceId, String key) {
        String classPathContent = "classpath*:/" + this.baseContentPath;
        String contentPath = getMostSpecificContent(deviceId, key, classPathContent);

        if (contentPath != null) {
            return buildContentUrlToProvider("classPathContentProvider", contentPath);
        }

        return null;
    }

    @Override
    public InputStream getContentInputStream(String contentPath) throws IOException {
        InputStream inputStream = null;
        if (isFileSupported(contentPath)) {
            inputStream = getResourceInputStream(contentPath, this.baseContentPath);

            // Fall back to the default location in openpos-server-core
            if (inputStream == null) {
                inputStream = getResourceInputStream(contentPath, DEFAULT_LOCATION);
            }
        }

        return inputStream;
    }

    private InputStream getResourceInputStream(String contentPath, String baseContentPath) throws IOException {
        StringBuilder pathBuilder = new StringBuilder("classpath*:/");
        if (!contentPath.contains(baseContentPath)) {
            pathBuilder.append(baseContentPath);
        }
        pathBuilder.append(contentPath);
        String classPathContent = pathBuilder.toString();

        ClassLoader cl = this.getClass().getClassLoader();
        ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(cl);
        Resource[] resources = resolver.getResources(classPathContent);

        if (resources != null && resources.length > 0) {
            return resources[0].getInputStream();
        }

        return null;
    }
}
