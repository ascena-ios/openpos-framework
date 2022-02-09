package org.jumpmind.pos.core.flow;

import org.jumpmind.pos.core.service.ClientLocationService;
import org.jumpmind.pos.util.model.LocationData;
import org.jumpmind.pos.server.model.Action;
import org.springframework.beans.factory.annotation.Autowired;

public class LocationChangedGlobalActionHandler {

    @In(scope = ScopeType.Device)
    IStateManager stateManager;

    @Autowired
    ClientLocationService clientLocationService;

    @OnGlobalAction
    public void onLocationChanged(Action action) {
        LocationData locationData = Action.convertActionData(action.getData(), LocationData.class);
        clientLocationService.setLocationData(locationData);

        stateManager.getDeviceVariables().put("locationData", locationData != null ? locationData.toString() : null);
    }

}
