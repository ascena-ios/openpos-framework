package org.jumpmind.pos.devices.service;

import org.jumpmind.pos.devices.model.*;
import org.jumpmind.pos.devices.service.model.PersonalizationConfigResponse;
import org.jumpmind.pos.devices.service.model.PersonalizationParameters;
import org.jumpmind.pos.service.Endpoint;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Endpoint(path="/devices/personalizationConfig")
public class GetPersonalizationConfigEndpoint {

    @Autowired(required=false)
    PersonalizationParameters personalizationParameters;
    Logger logger = LoggerFactory.getLogger(getClass());

    @Value("${openpos.businessunitId:undefined}")
    String businessUnitId;

    @Value("${openpos.installationId:'not set'}")
    String installationId;

    @Autowired
    DevicesRepository repository;

    @Autowired(required = false)
    List<String> loadedAppIds;

    public PersonalizationConfigResponse getPersonalizationConfig() {
        logger.info("Received a personalization request");

        if (personalizationParameters == null){
            throw new ResponseStatusException(HttpStatus.NO_CONTENT, "No personalization configuration, use default", null);
        }

        final List<DeviceAuthModel> disconnectedDevices = repository.getDisconnectedDevices(businessUnitId, installationId);
        final Map<String, String> availableDevices;

        if (disconnectedDevices != null && !disconnectedDevices.isEmpty()) {
            availableDevices = disconnectedDevices.stream()
                    .map(deviceStatusModel -> new DeviceAuthModel(deviceStatusModel.getDeviceId(), repository.getDeviceAuth(deviceStatusModel.getDeviceId())))
                    .collect(Collectors.toMap( DeviceAuthModel::getAuthToken, DeviceAuthModel::getDeviceId));
        } else {
            availableDevices = new HashMap<>();
        }

        return PersonalizationConfigResponse.builder()
                .devicePattern(personalizationParameters.getDevicePattern())
                .parameters(personalizationParameters.getParameters())
                .availableDevices(availableDevices)
                .loadedAppIds(loadedAppIds)
                .build();
    }
}
