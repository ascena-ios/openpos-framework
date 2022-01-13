package org.jumpmind.pos.core.ui.message;

import lombok.Data;
import org.jumpmind.pos.core.model.Form;
import org.jumpmind.pos.core.ui.ActionItem;
import org.jumpmind.pos.core.ui.UIMessage;

import java.util.List;

@Data
public class TransactionSearchUIMessage extends UIMessage {
    private ActionItem searchButton;
    private ActionItem primaryButton;
    private ActionItem changeSearchModeButton;
    private ActionItem searchAllButton;
    private ActionItem clearButton;
    private String providerKey;
    private TransactionSearchMode transactionSearchMode;
    private String transSearchModeText;
    private String transSearchModeIcon;
    private Form searchAllParamsForm;
    private String noResultsMessage;
    private String filtersLabel;
    private List<ActionItem> filters;

    public TransactionSearchUIMessage() {
        this.setScreenType(UIMessageType.TRANSACTION_SEARCH);
        this.setId("transaction");
    }
}
