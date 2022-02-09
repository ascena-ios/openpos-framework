package org.jumpmind.pos.core.flow.config;

import lombok.extern.slf4j.Slf4j;
import org.jumpmind.pos.core.flow.FlowException;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;

import java.io.InputStream;
import java.util.*;

@Slf4j
public class YamlConfigProvider implements IFlowConfigProvider {

    private YamlFlowConfigFileLoader flowConfigLoader = new YamlFlowConfigFileLoader();
    private YamlConfigConverter flowConfigConverter;

    protected Map<String, List<FlowConfig>> loadedFlowConfigs = new LinkedHashMap<>();
    protected Map<String, List<YamlFlowConfig>> loadedYamlFlowConfigs = new HashMap<>();
    protected Map<String, String> appIdToStartFlowName = new HashMap<>();
    protected Map<String, String> appIdToFlowPath = new HashMap<>();

    private Map<String, List<TransitionStepConfig>> transitionSteps = new HashMap<>();

    public YamlConfigProvider() {
        this(null);
    }

    public YamlConfigProvider(List<String> additionalPackages) {
        flowConfigConverter = new YamlConfigConverter(additionalPackages);
    }

    @Override
    public void load(String appId, String path, String startFlowName) {
        appIdToStartFlowName.put(appId, startFlowName);
        if (!appIdToFlowPath.values().contains(path)) {
            load(path);
        }
        appIdToFlowPath.put(appId, path);
    }

    @Bean
    public List<String> loadedAppIds() {
        return new ArrayList<>(appIdToStartFlowName.keySet());
    }

    public void load(String path) {
        try {
            ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(Thread.currentThread().getContextClassLoader());

            List<Resource> resources = new ArrayList<>(Arrays.asList(resolver.getResources("classpath*:/" + path + "/*-flow-ext.yml")));
            resources.addAll(Arrays.asList(resolver.getResources("classpath*:/" + path + "/*-flow.yml")));

            List<YamlFlowConfig> yamlFlowConfigs = new ArrayList<>();

            for (int i = resources.size() - 1; i >= 0; --i) {
                Resource resource = resources.get(i);
                // first pass needs to load all raw YAML.
                yamlFlowConfigs.addAll(loadYamlResource(path, resource));
            }

            // second pass here needed to convert
            loadYamlFlowConfigs(path, yamlFlowConfigs);

            transitionSteps.put(path, flowConfigConverter.
                    convertTransitionSteps(new YamlTransitionStepProvider().
                            loadTransitionSteps(resolver, path, flowConfigLoader), yamlFlowConfigs));

        } catch (Exception ex) {
            throw new FlowException(String.format("Failed to load YML flow config for path '%s'", path), ex);
        }
    }

    public void load(String path, InputStream resource) {
        List<YamlFlowConfig> yamlFlowConfigs = new ArrayList<>();
        yamlFlowConfigs.addAll(loadYamlResource(path, resource, false));
        // second pass here needs to then convert
        loadYamlFlowConfigs(path, yamlFlowConfigs);
    }

    @Override
    public List<TransitionStepConfig> getTransitionStepConfig(String appId, String nodeId) {
        return transitionSteps.get(appIdToFlowPath.get(appId));
    }

    @Override
    public FlowConfig getConfigByName(String appId, String deviceId, String name) {
        List<FlowConfig> flowConfigs = loadedFlowConfigs.get(appIdToFlowPath.get(appId));
        if (flowConfigs != null && !flowConfigs.isEmpty()) {
            return flowConfigs.stream().filter(flowConfig -> name.equals(flowConfig.getName())).findAny().orElse(null);
        } else {
            return null;
        }
    }

    @Override
    public FlowConfig getConfig(String appId, String deviceId) {
        if (appIdToStartFlowName.containsKey(appId)) {
            return getConfigByName(appId, deviceId, appIdToStartFlowName.get(appId));
        } else {
            List<FlowConfig> flowConfigs = loadedFlowConfigs.get(appIdToFlowPath.get(appId));
            if (flowConfigs != null && !flowConfigs.isEmpty()) {
                return flowConfigs.get(0);
            } else {
                return null;
            }
        }
    }

    protected void updateSubflowsWithParentConfigScope(FlowConfig flowConfig) {
        updateSubflowsWithParentConfigScope(flowConfig, flowConfig.getConfigScope());
    }

    protected void updateSubflowsWithParentConfigScope(FlowConfig flowConfig, Map<String, Object> inheritedConfigScope) {
        flowConfig.getStateConfigs().values().forEach(sc -> {
            updateSubflowsWithParentConfigScope(flowConfig, sc.getActionToSubStateMapping().values(), inheritedConfigScope);
        });
        updateSubflowsWithParentConfigScope(flowConfig, flowConfig.getActionToSubStateMapping().values(), inheritedConfigScope);
    }

    protected void updateSubflowsWithParentConfigScope(FlowConfig flowConfig, Collection<SubFlowConfig> configs, Map<String, Object> inheritedConfigScope) {
        configs.forEach(sf -> {
            Map<String, Object> currentScope = new HashMap<>(inheritedConfigScope);
            currentScope.putAll(sf.getSubFlowConfig().getConfigScope());
            sf.getSubFlowConfig().setConfigScope(currentScope);
            updateSubflowsWithParentConfigScope(sf.getSubFlowConfig(), currentScope);
        });
    }

    protected List<YamlFlowConfig> loadYamlResource(String path, InputStream resource, boolean isExtension) {
        List<YamlFlowConfig> yamlFlowConfigs = flowConfigLoader.loadYamlFlowConfigs(resource);
        List<YamlFlowConfig> existingYamlFlowConfigs = loadedYamlFlowConfigs.computeIfAbsent(path, k -> new ArrayList<>());

        for (YamlFlowConfig flowConfig : yamlFlowConfigs) {
            YamlFlowConfig match = existingYamlFlowConfigs.stream().filter(flowConfig1 -> flowConfig.getFlowName().equals(flowConfig1.getFlowName())).findFirst().orElse(null);
            if (isExtension) {
                handleExtensionConfig(flowConfig, match);
            } else {
                handleParentConfig(existingYamlFlowConfigs, flowConfig, match);
            }
        }

        return existingYamlFlowConfigs;
    }

    private void handleParentConfig(List<YamlFlowConfig> existingYamlFlowConfigs, YamlFlowConfig flowConfig, YamlFlowConfig match) {
        if (match == null) {
            existingYamlFlowConfigs.add(flowConfig);
        } else {
            throw new FlowException("Tried to load a parent flow, but there is one that already exists: %s", match.getFlowName());
        }
    }

    private void handleExtensionConfig(YamlFlowConfig flowConfig, YamlFlowConfig match) {
        if (match == null) {
            throw new FlowException("Tried to load an extension flow, but could not find a parent flow to extend: %s", flowConfig.getFlowName());
        } else {
            match.merge(flowConfig);
        }
    }

    protected List<YamlFlowConfig> loadYamlResource(String path, Resource resource) {
        log.info("Loading flow config from {}", resource.toString());
        try {
            boolean isExtension = resource.getFilename() != null && resource.getFilename().endsWith("-flow-ext.yml");
            return loadYamlResource(path, resource.getInputStream(), isExtension);
        } catch (Exception ex) {
            throw new FlowException(String.format("Failed while loading resource %s", resource), ex);
        }
    }

    protected void loadYamlFlowConfigs(String path, List<YamlFlowConfig> yamlFlowConfigs) {
        List<YamlFlowConfig> existingYamlFlowConfigs = loadedYamlFlowConfigs.get(path);

        List<FlowConfig> existingFlowConfigs = new ArrayList<>();
        loadedFlowConfigs.put(path, existingFlowConfigs);

        List<FlowConfig> flowConfigs = flowConfigConverter.convertFlowConfigs(existingYamlFlowConfigs, yamlFlowConfigs);
        existingFlowConfigs.addAll(flowConfigs);

        // inherit config scope down through child sub flows
        existingFlowConfigs.forEach(this::updateSubflowsWithParentConfigScope);
    }
}
