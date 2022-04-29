package org.jumpmind.pos.core.ui;

import org.jumpmind.pos.core.ui.message.DialogUIMessage;

import java.util.HashMap;
import java.util.Map;

/**
 * Convenience class for creating common dialogs such as a dialog with 
 * an Ok button, or a dialog with an Ok and Cancel buttons, etc.
 *
 */
public class DialogBuilder {
    public final static String OK_TYPE          = "OK";
    public final static String OK_CANCEL_TYPE   = "OK_CANCEL";

    public final static String OK_BUTTON_ACTION = "Ok";
    public final static String OK_BUTTON_LABEL = "key:common:action.ok.label";
    public final static String CANCEL_BUTTON_ACTION = "Cancel";
    public final static String CANCEL_BUTTON_LABEL = "key:common:action.ok.label";
    
    protected static final Map<String, ActionItem> DEFAULT_BUTTON_ACTIONS = new HashMap<>();
    static {
        DEFAULT_BUTTON_ACTIONS.put(OK_BUTTON_ACTION, new ActionItem(OK_BUTTON_ACTION, OK_BUTTON_LABEL));
        DEFAULT_BUTTON_ACTIONS.put(CANCEL_BUTTON_ACTION, new ActionItem(CANCEL_BUTTON_ACTION, CANCEL_BUTTON_LABEL));
        // Add new buttons here
    }
    
    private DialogProperties dialogProperties;
    private String dialogType = OK_TYPE;
    private Map<String, ActionItem> buttonActions = new HashMap<>();
    
    private String[] messages = {};
    private String title;
    
    public DialogBuilder() {
    }

    public DialogBuilder(String type, String... messages) {
        this(type, null, messages);
    }
    
    public DialogBuilder(String type, DialogProperties dialogProperties, String... messages) {
        this();
        this.dialogType = type;
        this.dialogProperties = dialogProperties;
        this.messages = messages;
    }
    
    public String getDialogType() {
        return dialogType;
    }


    public void setDialogType(String dialogType) {
        this.dialogType = dialogType;
    }

    public DialogBuilder dialogType(String dialogType) {
        this.setDialogType(dialogType);
        return this;
    }

    public DialogProperties getDialogProperties() {
        return dialogProperties;
    }


    public void setDialogProperties(DialogProperties dialogProperties) {
        this.dialogProperties = dialogProperties;
    }

    public DialogBuilder properties(DialogProperties dialogProperties) {
        this.setDialogProperties(dialogProperties);
        return this;
    }
    
    public DialogBuilder putAction(String btnKey) {
        return this.putAction(btnKey, btnKey);
    }
    
    public DialogBuilder putAction(String btnKey, String action) {
        return this.putAction(btnKey, btnKey, action);
    }
    
    public DialogBuilder putAction(String btnKey, String buttonTitle, String action) {
        return this.putAction(btnKey, new ActionItem(action, buttonTitle));
    }

    public DialogBuilder putAction(String btnKey, ActionItem action) {
        this.buttonActions.put(btnKey, action);
        return this;
    }
    
    public ActionItem getAction(String btnKey) {
        return this.buttonActions.containsKey(btnKey) ? this.buttonActions.get(btnKey) 
                : DEFAULT_BUTTON_ACTIONS.get(btnKey);
    }
    
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
    
    protected Map<String, ActionItem> getButtonActions() {
        return this.buttonActions;
    }

    public DialogBuilder title(String title) {
        this.setTitle(title);
        return this;
    }

    public String[] getMessages() {
        return messages;
    }

    public void setMessages(String... messages) {
        this.messages = messages;
    }
    
    public DialogUIMessage build() {
        DialogUIMessage screen = new DialogUIMessage();
        screen.setMessage(this.getMessages());
        screen.setTitle(this.getTitle());
        if (this.getDialogProperties() != null) {
            screen.setDialogProperties(this.getDialogProperties());
        }
        
        switch (this.getDialogType()) {
            case OK_CANCEL_TYPE:
                screen.addButton(this.getAction(OK_BUTTON_ACTION));
                screen.addButton(this.getAction(CANCEL_BUTTON_ACTION));
                break;
            case OK_TYPE:
            default:
                screen.addButton(this.getAction(OK_BUTTON_ACTION));
            
        }
        
        return screen;
    }
    

}
