package org.jumpmind.pos.service.init;

/**
 * An enumeration of the different states that a module init state can be found in.
 */
public enum ModuleInitState {

    /**
     * Ready for use.
     */
    ready,

    /**
     * Loading in progress, not ready for use.
     */
    notReady,

    /**
     * An unrecoverable error occurred while attempting to load; will never be ready.
     */
    error
}
