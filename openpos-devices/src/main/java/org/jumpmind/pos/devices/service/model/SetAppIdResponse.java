package org.jumpmind.pos.devices.service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.jumpmind.pos.devices.model.DeviceModel;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SetAppIdResponse {
    private DeviceModel device;
}
