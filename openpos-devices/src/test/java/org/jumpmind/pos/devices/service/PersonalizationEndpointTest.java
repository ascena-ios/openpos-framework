package org.jumpmind.pos.devices.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.collections.map.HashedMap;
import org.jumpmind.pos.devices.DevicesException;
import org.jumpmind.pos.devices.TestDevicesConfig;
import org.jumpmind.pos.devices.service.model.GetDeviceResponse;
import org.jumpmind.pos.devices.service.model.PersonalizationRequest;
import org.jumpmind.pos.devices.service.model.PersonalizationResponse;
import org.jumpmind.pos.devices.service.strategy.GetBusinessUnitIdFromPersonalizationParamsStrategy;
import org.jumpmind.pos.devices.service.strategy.IDeviceBusinessUnitIdStrategy;
import org.jumpmind.pos.devices.service.strategy.ParseBusinessUnitIdFromDeviceIdStrategy;
import org.jumpmind.pos.service.utils.MockGetRequestBuilder;
import org.jumpmind.pos.service.utils.MockPostRequestBuilder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.junit.Assert.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest()
@ActiveProfiles("test")
@AutoConfigureMockMvc
@ContextConfiguration(classes = { TestDevicesConfig.class })
public class PersonalizationEndpointTest {

    ObjectMapper mapper = new ObjectMapper();

    @Autowired
    private MockMvc mvc;

    @Value("${openpos.businessunitId:undefined}")
    private String configBusinessUnitId;

    @Autowired
    PersonalizeEndpoint endpoint;

    @Autowired
    GetBusinessUnitIdFromPersonalizationParamsStrategy getFromPersonalizationParamsStrategy;

    @Autowired
    ParseBusinessUnitIdFromDeviceIdStrategy parsedFromDeviceIdStrategy;

    @Test
    public void personalizationRequestForNewDeviceShouldReturnNewAuthToken() throws Exception {
        String result = mvc.perform(
                new MockPostRequestBuilder("/devices/personalize")
                    .content(
                            PersonalizationRequest.builder()
                                    .deviceId("00100-002")
                                    .appId("pos")
                                    .build()
                    )
                    .build()
                )
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        PersonalizationResponse response = mapper.readValue(result, PersonalizationResponse.class);
        assertNotNull(response.getDeviceModel());
        assertNotNull(response.getAuthToken());

    }

    @Test
    public void personalizationRequestForDeviceWithSameDeviceIdNewAppIdShouldReturnNewAuthToken() throws Exception{
        String result = mvc.perform(
                new MockPostRequestBuilder("/devices/personalize")
                        .content(
                                PersonalizationRequest.builder()
                                        .deviceId("00145-001")
                                        .appId("customer-display")
                                        .build()
                        )
                        .build()
        )
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        PersonalizationResponse response = mapper.readValue(result, PersonalizationResponse.class);
        assertNotNull(response.getAuthToken());
        assertNotNull(response.getDeviceModel());
    }

    @Test
    public void personalizationRequestForExistingDevicesShouldSucceedIfAuthTokenMatches() throws Exception{
        String result = mvc.perform(
                new MockPostRequestBuilder("/devices/personalize")
                        .content(
                                PersonalizationRequest.builder()
                                        .deviceId("00145-001")
                                        .appId("pos")
                                        .deviceToken("123456789")
                                        .deviceType("WORKSTATION")
                                        .build()
                        )
                        .build()
        )
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        PersonalizationResponse response = mapper.readValue(result, PersonalizationResponse.class);
        assertNotNull(response.getAuthToken());
        assertNotNull(response.getDeviceModel());
    }
    @Test
    public void personalizationRequestForExistingDeviceWithSameAppIdShouldSucceedIfAuthTokenIsNull() throws Exception {
        String result = mvc.perform(
                        new MockPostRequestBuilder("/devices/personalize")
                                .content(
                                        PersonalizationRequest.builder()
                                                .deviceId("11111-111")
                                                .appId("pos")
                                                .build()
                                )
                                .build()
                )
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        PersonalizationResponse response = mapper.readValue(result, PersonalizationResponse.class);
        assertNotNull(response.getDeviceModel());
        assertNotNull(response.getAuthToken());

    }

    @Test
    public void personalizationRequestForExistingDeviceShouldFailIfAuthTokenDoesntMatch() throws Exception{
        mvc.perform(
                new MockPostRequestBuilder("/devices/personalize")
                        .content(
                                PersonalizationRequest.builder()
                                        .deviceId("00145-001")
                                        .deviceToken("foo")
                                        .appId("pos")
                                        .build()
                        )
                        .build()
        ).andExpect(status().is5xxServerError());
    }

    @Test
    public void personalizationRequestShouldUpdateParameters() throws Exception {
        Map<String, String> params = new HashedMap();
        params.put("deviceType", "register");
        mvc.perform(
                new MockPostRequestBuilder("/devices/personalize")
                        .content(
                                PersonalizationRequest.builder()
                                        .deviceId("00145-001")
                                        .deviceToken("123456789")
                                        .appId("pos")
                                        .deviceType("WORKSTATION")
                                        .personalizationParameters(params)
                                        .build()
                        )
                        .build()
        ).andDo(result -> {
            String response = mvc.perform(
                    new MockGetRequestBuilder("/devices/myDevice").deviceId("00145-001").appId("pos").build()
            ).andReturn().getResponse().getContentAsString();

            assertTrue(mapper.readValue(response, GetDeviceResponse.class)
                    .getDeviceModel()
                    .getDeviceParamModels()
                    .stream()
                    .anyMatch(deviceParamModel -> "deviceType".equals(deviceParamModel.getParamName()) && "register".equals(deviceParamModel.getParamValue())));
        });
    }

    @Test
    public void businessUnitIdSetFromDefaultBusinessUnitIdStrategy() throws Exception {
        Map<String, String> params = new HashedMap();
        params.put("deviceType", "register");
        mvc.perform(
                new MockPostRequestBuilder("/devices/personalize")
                        .content(
                                PersonalizationRequest.builder()
                                        .deviceId("00145-001")
                                        .deviceToken("123456789")
                                        .appId("pos")
                                        .deviceType("WORKSTATION")
                                        .personalizationParameters(params)
                                        .build()
                        )
                        .build()
        ).andDo(result -> {
            String response = mvc.perform(
                    new MockGetRequestBuilder("/devices/myDevice").deviceId("00145-001").appId("pos").build()
            ).andReturn().getResponse().getContentAsString();

            assertEquals(configBusinessUnitId, mapper.readValue(response, GetDeviceResponse.class).getDeviceModel().getBusinessUnitId());
        });
    }

    @Test
    public void businessUnitIdSetFromParamsStrategyTest() {
        IDeviceBusinessUnitIdStrategy currentStrategy = endpoint.deviceBusinessUnitIdStrategy;
        try {
            endpoint.deviceBusinessUnitIdStrategy = getFromPersonalizationParamsStrategy;
            Map<String, String> params = new HashedMap();
            params.put("deviceType", "register");
            params.put("businessUnitId", "88888");
            PersonalizationResponse response = endpoint.personalize(PersonalizationRequest.builder()
                    .deviceId("00145-001")
                    .deviceToken("123456789")
                    .appId("pos")
                    .deviceType("WORKSTATION")
                    .personalizationParameters(params)
                    .build());

            assertEquals("88888", response.getDeviceModel().getBusinessUnitId());
        } finally {
            endpoint.deviceBusinessUnitIdStrategy = currentStrategy;
        }
    }

    @Test(expected = DevicesException.class)
    public void businessUnitIdNotInParamsStrategyTest() {
        IDeviceBusinessUnitIdStrategy currentStrategy = endpoint.deviceBusinessUnitIdStrategy;
        try {
            endpoint.deviceBusinessUnitIdStrategy = getFromPersonalizationParamsStrategy;
            Map<String, String> params = new HashedMap();
            params.put("deviceType", "register");
            // Intentionally omit businessUnitId    params.put("businessUnitId", "88888");
            PersonalizationResponse response = endpoint.personalize(PersonalizationRequest.builder()
                    .deviceId("00145-001")
                    .deviceToken("123456789")
                    .appId("pos")
                    .deviceType("WORKSTATION")
                    .personalizationParameters(params)
                    .build());

        } finally {
            endpoint.deviceBusinessUnitIdStrategy = currentStrategy;
        }
    }

    @Test
    public void businessUnitParsedFromDeviceIdStrategyTest() {
        IDeviceBusinessUnitIdStrategy currentStrategy = endpoint.deviceBusinessUnitIdStrategy;
        try {
            endpoint.deviceBusinessUnitIdStrategy = parsedFromDeviceIdStrategy;
            Map<String, String> params = new HashedMap();
            params.put("deviceType", "register");
            params.put("businessUnitId", "88888");
            PersonalizationResponse response = endpoint.personalize(PersonalizationRequest.builder()
                    .deviceId("00145-001")
                    .deviceToken("123456789")
                    .appId("pos")
                    .deviceType("WORKSTATION")
                    .personalizationParameters(params)
                    .build());

            assertEquals("00145", response.getDeviceModel().getBusinessUnitId());
        } finally {
            endpoint.deviceBusinessUnitIdStrategy = currentStrategy;
        }
    }

}
