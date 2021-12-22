package org.jumpmind.pos.devices.model;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.apache.commons.collections4.map.CaseInsensitiveMap;
import org.apache.commons.lang3.StringUtils;
import org.jumpmind.pos.persist.*;
import org.jumpmind.pos.persist.model.ITaggedModel;
import org.jumpmind.pos.util.model.IDeviceAttributes;
import org.jumpmind.util.AppUtils;
import org.springframework.core.env.AbstractEnvironment;
import org.springframework.core.env.EnumerablePropertySource;
import org.springframework.core.env.MutablePropertySources;

@Tagged(includeTagsInPrimaryKey = false)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@TableDef(name = "device", description = "A device used to transaction commerce for a Business Unit",
        primaryKey = {"deviceId", "appId"})
public class DeviceModel extends AbstractModel implements ITaggedModel, IDeviceAttributes {

    @ToString.Include
    @EqualsAndHashCode.Include
    @ColumnDef(description = "A unique identifier for this Device")
    private String deviceId;

    @ToString.Include
    @EqualsAndHashCode.Include
    @ColumnDef
    private String appId;

    @ColumnDef(description = "The type of the Device.  Store/DC workstation or handheld, Customer handheld, website, etc.")
    private String deviceType; // STORE/DC/WORKSTATION/HANDELD/CUSTOMER
    // HANDHELD/WEBSITE, etc.

    @ColumnDef(size = "10", description = "The locale under which this Device currently operates")
    String locale;

    @ColumnDef(description = "The timezone offset under which this Device currently operates")
    String timezoneOffset = AppUtils.getTimezoneOffset();

    @ColumnDef(description = "The Business Unit under which this Device currently operates")
    String businessUnitId;

    @ColumnDef(size = "255", description = "A user defined name for the Device")
    private String description;

    @ToString.Include
    @Builder.Default
    private String deviceMode = DEVICE_MODE_DEFAULT;

    private List<DeviceParamModel> deviceParamModels;

    public static final String DEVICE_MODE_DEFAULT  = "default";
    public static final String DEVICE_MODE_TRAINING = "training";

    public DeviceModel(String deviceId, String appId, String locale, String timezoneOffset, String businessUnitId, String description, String deviceMode, Map<String, String> tags, List<DeviceParamModel> deviceParamModels) {
        this.deviceId = deviceId;
        this.appId = appId;
        this.locale = locale;
        this.timezoneOffset = timezoneOffset;
        this.businessUnitId = businessUnitId;
        this.description = description;
        this.deviceMode = (StringUtils.isEmpty(deviceMode) ? DEVICE_MODE_DEFAULT : deviceMode);
        this.tags = new CaseInsensitiveMap<>(tags != null ? tags : new HashMap<>());
        this.deviceParamModels = deviceParamModels;
    }

    public DeviceModel(String deviceId, String appId, String locale, String timezoneOffset, String businessUnitId, String description, Map<String, String> tags, List<DeviceParamModel> deviceParamModels) {
        this(deviceId, appId, locale, timezoneOffset, businessUnitId, description, DEVICE_MODE_DEFAULT, tags, deviceParamModels);
    }


    private Map<String, String> tags = new CaseInsensitiveMap<>();

    @Override
    public String getTagValue(String tagName) {
        return tags.get(tagName.toUpperCase());
    }

    @Override
    public void setTagValue(String tagName, String tagValue) {
        tags.put(tagName.toUpperCase(), tagValue);
    }

    @Override
    public void setTags(Map<String, String> tags) {
        this.tags.clear();
        this.tags.putAll(tags);
    }

    @Override
    public void clearTagValue(String tagName) {
        tags.remove(tagName);
    }

    @Override
    public Map<String, String> getTags() {
        return tags != null ? new CaseInsensitiveMap<>(tags) : new CaseInsensitiveMap<>();
    }

    public void updateTags(AbstractEnvironment env) {
        MutablePropertySources propSrcs = env.getPropertySources();
        StreamSupport.stream(propSrcs.spliterator(), false)
                .filter(ps -> ps instanceof EnumerablePropertySource)
                .map(ps -> ((EnumerablePropertySource<?>) ps).getPropertyNames())
                .flatMap(Arrays::stream)
                .filter(propName -> propName.startsWith("openpos.tags"))
                .forEach(propName ->
                        tags.put(propName.substring("openpos.tags".length() + 1), env.getProperty(propName) != null ? env.getProperty(propName) : "*"));

    }

    public String withOutBusinessUnitId() {
        String withOutBusinessUnitId = deviceId;
        int index = deviceId.indexOf(businessUnitId);
        if (index == 0) {
            withOutBusinessUnitId = deviceId.substring(businessUnitId.length());
            if (withOutBusinessUnitId.startsWith("-")) {
                withOutBusinessUnitId = withOutBusinessUnitId.substring(1);
            }
        }
        return withOutBusinessUnitId;
    }

    @JsonIgnore
    public boolean isDefaultDeviceMode()  {
        return (deviceMode == null ? true : deviceMode.equals(DEVICE_MODE_DEFAULT));
    }

    @JsonIgnore
    public void setDefaultDeviceMode()  {
        deviceMode = DEVICE_MODE_DEFAULT;
    }

    @JsonIgnore
    public boolean isTrainingDeviceMode()  {
        return (deviceMode == null ? false : deviceMode.equals(DEVICE_MODE_TRAINING));
    }

    @JsonIgnore
    public void setTrainingDeviceMode()  {
        deviceMode = DEVICE_MODE_TRAINING;
    }

    @JsonIgnore
    @Override
    public Map<String,String> getDeviceParamsMap() {
        if (this.deviceParamModels != null) {
            return this.deviceParamModels.stream().collect(Collectors.toMap(DeviceParamModel::getParamName, DeviceParamModel::getParamValue));
        }

        return Collections.emptyMap();
    }
}
