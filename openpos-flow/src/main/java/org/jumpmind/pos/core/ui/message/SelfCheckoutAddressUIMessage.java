package org.jumpmind.pos.core.ui.message;

import java.util.List;

import org.jumpmind.pos.core.ui.IHasAutoCompleteAddress;

public class SelfCheckoutAddressUIMessage extends SelfCheckoutFormUIMessage implements IHasAutoCompleteAddress {

    private static final long serialVersionUID = 1L;

    private String streetAddressPlaceholder = "key:common:label.address.streetAddress";
    private String addressLine2Placeholder = "key:common:label.address.addressLine2";
    private String localityPlaceholder = "key:common:label.address.locality";
    private String statePlaceholder = "key:common:label.address.state";
    private String postalCodePlaceholder = "key:common:label.address.postalCode";
    private String countryPlaceholder = "key:common:label.address.country";

    private boolean autoComplete = true;

    public SelfCheckoutAddressUIMessage() {
        super();
    }

    public void addDefaultAddressFields() {
        this.getForm().addTextField("streetAddress", streetAddressPlaceholder, "", true);
        this.getForm().addTextField("addressLine2", addressLine2Placeholder, "", false);
        this.getForm().addTextField("locality", localityPlaceholder, "", true);
        this.getForm().addTextField("state", statePlaceholder, "", true);
        this.getForm().addTextField("postalCode", postalCodePlaceholder, "", true);
        this.getForm().addTextField("country", countryPlaceholder, "", true);
    }

    public void addAddressFieldsWithComboState(List<String> states) {
        this.getForm().addTextField("streetAddress", streetAddressPlaceholder, "", true);
        this.getForm().addTextField("addressLine2", addressLine2Placeholder, "", false);
        this.getForm().addTextField("locality", localityPlaceholder, "", true);
        this.getForm().addComboBox("state", statePlaceholder, states, true);
        this.getForm().addTextField("postalCode", postalCodePlaceholder, "", true);
        this.getForm().addTextField("country", countryPlaceholder, "", true);
    }

    public void setPlaceholders(String streetAddressPlaceholder, String addressLine2Placeholder, String localityPlaceholder,
            String statePlaceholder, String postalCodePlaceholder, String countryPlaceholder) {
        this.streetAddressPlaceholder = streetAddressPlaceholder;
        this.addressLine2Placeholder = addressLine2Placeholder;
        this.localityPlaceholder = localityPlaceholder;
        this.statePlaceholder = statePlaceholder;
        this.postalCodePlaceholder = postalCodePlaceholder;
        this.countryPlaceholder = countryPlaceholder;
    }

    public boolean isAutoComplete() {
        return autoComplete;
    }

    public void setAutoComplete(boolean autoComplete) {
        this.autoComplete = autoComplete;
    }

}
