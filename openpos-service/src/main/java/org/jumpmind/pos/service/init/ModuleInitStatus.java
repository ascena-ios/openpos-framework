package org.jumpmind.pos.service.init;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * A pairing of {@link ModuleInitState} with an optional message providing additional details the current state of the
 * module.
 */
@Data
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class ModuleInitStatus {

    /**
     * The state that the module is in at the time of this object's initialization.
     */
    private ModuleInitState status;

    /**
     * An optional message to go along with the reported status. Typically, the {@link ModuleInitStatus#ready} status
     * will not contain a message and often the {@link ModuleInitStatus#error} does have a message.
     */
    private String message;

    public static ModuleInitStatus ready() {
        return new ModuleInitStatus(ModuleInitState.ready, null);
    }

    public static ModuleInitStatus notReady() {
        return notReady(null);
    }

    public static ModuleInitStatus notReady(String message) {
        return new ModuleInitStatus(ModuleInitState.notReady, message);
    }

    public static ModuleInitStatus error(String message) {
        return new ModuleInitStatus(ModuleInitState.error, message);
    }

    public static ModuleInitStatus error(Exception exception) {
        return error(exception.getMessage());
    }

    public boolean isReady() {
        return status == ModuleInitState.ready;
    }

    public boolean isNotReady() {
        return !isReady();
    }
}
