package org.jumpmind.pos.util.event;

import org.jumpmind.pos.util.model.DeviceStatus;

/**
 * A marker interface to indicate that an event should not be persisted to track
 * the current state of a Device.  This can be used to tag events such as
 * a device heartbeat or a customer's request for assistance where those events
 * aren't related to the state of a transaction, but are related to a particular device. 
 */
public interface ITransientEvent {

    default void updateDeviceStatus(DeviceStatus deviceStatus) {};
}
