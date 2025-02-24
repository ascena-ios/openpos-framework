package org.jumpmind.pos.devices.service;

import org.jumpmind.pos.devices.model.DevicesRepository;
import org.jumpmind.pos.devices.service.model.SetAppIdRequest;
import org.jumpmind.pos.devices.service.model.SetAppIdResponse;
import org.jumpmind.pos.service.Endpoint;
import org.springframework.beans.factory.annotation.Autowired;

import static org.jumpmind.pos.util.RestApiSupport.REST_API_CONTEXT_PATH;

@Endpoint(path = REST_API_CONTEXT_PATH + "/devices/setAppId")
public class SetAppIdEndpoint {

    @Autowired
    DevicesRepository devicesRepository;

    public SetAppIdResponse setAppId(SetAppIdRequest request) {
        devicesRepository.setAppId(request.getDeviceId(), request.getNewAppId());
        return SetAppIdResponse.builder()
                .device(devicesRepository.getDevice(request.getDeviceId()))
                .build();
    }
}
