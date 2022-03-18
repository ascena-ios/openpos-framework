package org.jumpmind.pos.util.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.reflections.Reflections;
import org.springframework.expression.spel.ast.TypeCode;

import java.util.*;

@Slf4j
public final class ITypeCodeRegistry {

    @Data
    @AllArgsConstructor
    public static class ITypeCodeCacheKey {
        Class<?> typeCodeClass;
        Object value;
    }

    private static Map<Class<? extends ITypeCode>,Set<? extends ITypeCode>> registry = new HashMap<>();
    private static final Object registryLock = new Object();

    private static Map<ITypeCodeCacheKey, ITypeCode> typeCodeCache = new LinkedHashMap<ITypeCodeCacheKey, ITypeCode>() {
        protected boolean removeEldestEntry(Map.Entry<ITypeCodeCacheKey, ITypeCode> eldest) {
            return size() > 5000;
        }
    };

    public static void putCacheValue(ITypeCodeCacheKey key, ITypeCode typeCode) {
        typeCodeCache.put(key, typeCode);
    }

    public static ITypeCode getCacheValue(ITypeCodeCacheKey key) {
        return typeCodeCache.get(key);
    }

    public static Set<Class<? extends ITypeCode>> types() {
        return Collections.unmodifiableSet(registry.keySet());
    }
    
    @SuppressWarnings("unchecked")
    public static <T extends ITypeCode> Set<T> values(Class<T> clazz) {
        return Collections.unmodifiableSet((Set<T>)registry.get(clazz));
    }

    public static boolean exists(Class<? extends ITypeCode> clazz, String value) {
        return values(clazz).stream().anyMatch(i -> i.value().equals(value));
    }

    /**
     * This method can be used to force initialize of all ITypeCodes hierarchically from the given list of packages. By
     * default, ITypeCode subclasses are loaded lazily when the JVM loads and initializes the ITypeCode subclass.
     * Invoking this method will force all ITypeCode subclasses in the given packages to be loaded.
     * @param typeCodePackages A list of one more more package names to scan for subclasses of ITypeCode.
     */
    public static void forceLoad(String... typeCodePackages) {
        Reflections reflections = new Reflections(typeCodePackages);
        Set<Class<? extends ITypeCode>> typeCodeClasses = reflections.getSubTypesOf(ITypeCode.class);
        for (Class<? extends ITypeCode> typeCodeClass : typeCodeClasses) {
            try {
                // Using this version of Class.forName intentionally to force initialization of the class so that
                // all static initializers are run upon loading
                Class.forName(typeCodeClass.getName(), true, typeCodeClass.getClassLoader());
                log.debug("Loaded ITypeCode subclass: {}", typeCodeClass.getName());
            } catch (ClassNotFoundException ex) {
                log.error(String.format("ITypeCode subclass %s could not be found in order to force its initialization", typeCodeClass.getName()), ex);
            }
        }
    }

    static boolean isRegistered(ITypeCode c) {
        return registry.containsKey(c.getClass()) && registry.get(c.getClass()).contains(c);
    }

    static boolean isNotRegistered(ITypeCode c) {
        return ! isRegistered(c);
    }

    public static Class<? extends ITypeCode> getCompatibleDeserializationClass(String clazz) {
        Class<? extends ITypeCode> typeCodeClass = registry.entrySet().stream()
                .filter(e -> e.getValue().iterator().next().isDeserializableFrom(clazz))
                .findFirst()
                .map(e -> e.getKey())
                .orElse(null);
        return typeCodeClass;
    }

    @SuppressWarnings("unchecked")
    static <T extends ITypeCode> void register(T c) {
        Set<T> s = null;
        synchronized(registryLock) {
            s = (Set<T>) registry.get(c.getClass());
            if (s == null) {
                s = new HashSet<>();
                registry.put(c.getClass(), s);
            }
            s.add(c);
        }
    }
    
}
