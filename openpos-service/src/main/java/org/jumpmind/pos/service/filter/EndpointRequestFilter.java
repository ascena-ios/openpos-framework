package org.jumpmind.pos.service.filter;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface EndpointRequestFilter {

    String versionLessThan() default "";

    String versionGreaterThan() default "";

    String path() default "";

}