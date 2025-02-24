package org.jumpmind.pos.core.ui;

import lombok.Data;
import org.jumpmind.pos.core.model.MessageType;
import org.jumpmind.pos.server.model.Action;
import org.jumpmind.pos.util.model.Message;

@Data
public class UIMessage extends Message {
    private static final long serialVersionUID = 1L;
    private String screenType;
    private String id;
    private Integer sessionTimeoutMillis;
    private Action sessionTimeoutAction;
    private boolean allowRestoreFromFailover;
    private boolean showStatusBar = true;

    public UIMessage(String screenType, String id) {
        this();
        this.screenType = screenType;
        this.id = id;
    }

    public UIMessage() {
        setWillUnblock(true);
        setType(MessageType.Screen);
    }

    public boolean isDialog() {
        String type = getType();
        return type != null && type.equals(MessageType.Dialog);
    }

    /**
     * Allows this screen content to be displayed in a Dialog on the client
     * side.
     */
    public UIMessage asDialog() {
        return this.asDialog(null);
    }

    /**
     * Allows this screen content to be displayed in a Dialog on the client
     * side.
     *
     * @param dialogProperties Additional properties that can control dialog behavior and
     *                         rendering on the server side.
     */
    public UIMessage asDialog(DialogProperties dialogProperties) {
        this.setType(MessageType.Dialog);
        if (dialogProperties != null) {
            this.setDialogProperties(dialogProperties);
        }
        return this;
    }

    public void setDialogProperties(DialogProperties dialogProperties) {
        this.put("dialogProperties", dialogProperties);
    }

    public void addMessagePart(String messagePartName, Object messagePart) {
        this.put(messagePartName, messagePart);
    }
}
