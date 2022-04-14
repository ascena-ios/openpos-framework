package org.jumpmind.pos.core.model;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSetter;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.jumpmind.pos.core.ui.ActionItem;
import org.jumpmind.pos.core.ui.validator.IValidatorSpec;

import java.io.Serializable;
import java.util.*;

public class FormField implements IFormElement, IField, Serializable {
    private static final long serialVersionUID = 1L;
    
    /**
     * Put properties in this map if they are optional. When not set, they don't
     * show up in the json which means less overhead.
     */
    private Map<String, Object> optionalProperties = new HashMap<String, Object>();    
    
    private FieldElementType elementType = FieldElementType.Input;
    private FieldInputType inputType = FieldInputType.AlphanumericText;
    private String label;
    private String additionalStyle;
    private String fieldId;

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    /* has to be set to a blank value by default because null values are not serialized in nu commerce and therefore aren't bound on the client side */
    private String value = "";
    private boolean required = true;
    private boolean sensitive = false;
    private String error;

    private boolean readOnly = false;

    public FormField() {
    }
    
    public FormField(String fieldId, String placeholder) {
        this.fieldId = fieldId;
        setPlaceholder(placeholder);
    }

    public FormField(String fieldId, String label, String placeholder) {
        this.fieldId = fieldId;
        this.label = label;
        setPlaceholder(placeholder);
    }

    public FormField(String fieldId, String label, String placeholder, String value) {
        this.fieldId = fieldId;
        this.label = label;
        this.value = value;
        setPlaceholder(placeholder);
    }
    
    public FormField(String fieldId, String label, FieldElementType elementType, FieldInputType inputType, String placeholder) {
        this.fieldId = fieldId;
        this.label = label;
        this.elementType = elementType;
        this.inputType = inputType;
        setPlaceholder(placeholder);
    }
    
    public FormField(String fieldId, String label, FieldElementType elementType, FieldInputType inputType, boolean required) {
        this.fieldId = fieldId;
        this.label = label;
        this.elementType = elementType;
        this.inputType = inputType;
        this.required = required;
    }
    
    public FormField(String fieldId, String label, FieldElementType elementType, FieldInputType inputType, boolean required, String value) {
        this.fieldId = fieldId;
        this.label = label;
        this.elementType = elementType;
        this.inputType = inputType;
        this.required = required;
        this.value = value;
    }   
    
    public FormField(String fieldId, String label, FieldElementType elementType, FieldInputType inputType, boolean required, String value, String iconName) {
        this.fieldId = fieldId;
        this.label = label;
        this.elementType = elementType;
        this.inputType = inputType;
        this.required = required;
        this.value = value;
        setIconName(iconName);
    } 
    
    @JsonAnyGetter
    public Map<String, Object> any() {
        return this.optionalProperties;
    }

    @JsonAnySetter
    public void put(String name, Object value) {
        this.optionalProperties.put(name, value);
    }    
    
    public FieldInputType getInputType() {
        return inputType;
    }

    public void setInputType(FieldInputType inputType) {
        this.inputType = inputType;
    }

    public FormField inputType(FieldInputType inputType) {
        this.setInputType(inputType);
        return this;
    }
    
    @Override
    public String getLabel() {
        return label;
    }

    @Override
    public void setLabel(String label) {
        this.label = label;
    }
    
    public FormField label(String label) {
        this.setLabel(label);
        return this;
    }

    public String getAdditionalStyle() {
        return additionalStyle;
    }

    public void setAdditionalStyle(String additionalStyle) {
        this.additionalStyle = additionalStyle;
    }

    public FormField additionalStyle(String additionalStyle) {
        this.setAdditionalStyle(additionalStyle);
        return this;
    }

    @Override
    public String getId() {
        return fieldId;
    }

    @Override
    public void setId(String fieldId) {
        this.fieldId = fieldId;
    }

    public String id(String fieldId) {
        this.setId(fieldId);
        return this.fieldId;
    }
    
    public FieldElementType getElementType() {
        return elementType;
    }

    public void setElementType(FieldElementType elementType) {
        this.elementType = elementType;
    }

    public FormField elementType(FieldElementType elementType) {
        this.setElementType(elementType);
        return this;
    }
    
    @Override
    public String getValue() {
        return value;
    }

    @Override
    public void setValue(String value) {
        this.value = value;
    }

    public FormField value(String value) {
        this.setValue(value);
        return this;
    }
    
    public void setPlaceholder(String placeholder) {
        this.optionalProperties.put("placeholder", placeholder);
    }

    public FormField placeholder(String placeholder) {
        this.setPlaceholder(placeholder);
        return this;
    }
    
    public void setPattern(String pattern) {
        this.put("pattern", pattern);
    }

    public FormField pattern(String pattern) {
        this.setPattern(pattern);
        return this;
    }
    
    public boolean isRequired() {
        return required;
    }

    public void setRequired(boolean required) {
        this.required = required;
    }

    public FormField required(boolean required) {
        this.setRequired(required);
        return this;
    }   

    public void setDisabled(boolean disabled) {
        put("disabled", disabled);
    }

    public FormField disabled(boolean disabled) {
        this.setDisabled(disabled);
        return this;
    }

    public void setMinLength(Integer minLength) {
        this.put("minLength", minLength);
    }

    public FormField minLength(Integer minLength) {
        this.setMinLength(minLength);
        return this;
    }
    
    public void setMaxLength(Integer maxLength) {
        this.put("maxLength", maxLength);
    }

    public FormField maxLength(Integer maxLength) {
        this.setMaxLength(maxLength);
        return this;
    }

    @JsonIgnore
    public Optional<Object> getMaxLength() {
        return Optional.ofNullable(optionalProperties.get("maxLength"));
    }
    
    /**
     * When this value is set, the client will call back upon the selected value changing with an action whose name is the same 
     * as the one given
     * @param action The name of an action to generate when the selected value changes.
     */
    public void setValueChangedAction(ActionItem action){
        if (action == null) {
            this.optionalProperties.remove("valueChangedAction");
        }
        else if (StringUtils.isNotEmpty(action.getAction())) {
            this.put("valueChangedAction", action);
        }
    }

    @JsonIgnore
    public void setValueChangedAction(String valueChangedAction) {
        if (StringUtils.isNotEmpty(valueChangedAction)) {
            ActionItem action = new ActionItem(valueChangedAction);
            action.setDoNotBlockForResponse(true);
            setValueChangedAction(action);
        }
    }
    
    public void setIconName(String iconName) {
    		this.put("iconName", iconName);
    }

    /**
     * Controls whether or not the text in the field should be selected on a click in the UI
     */
    public void setSelectText(boolean selectText) {
        this.put("select", selectText);
    }

    public FormField selectText(boolean selectText) {
        this.setSelectText(selectText);
        return this;
    }

    public boolean isSensitive() {
        return sensitive;
    }

    public void setSensitive(boolean sensitive) {
        this.sensitive = sensitive;
    }

    public FormField keyboardPreference(KeyboardType keyboardPreference) {
        this.setKeyboardPreference(keyboardPreference);
        return this;
    }

    public void setKeyboardPreference(KeyboardType keyboardPreference) {
        this.put("keyboardPreference", keyboardPreference);
    }

    public FormField scanEnabled(Boolean scanEnabled) {
        this.setScanEnabled(scanEnabled);
        return this;
    }

    public void setScanEnabled(Boolean scanEnabled) {
        this.put("scanEnabled", scanEnabled);
    }


    public FormField imageScanEnabled(Boolean imageScanEnabled) {
        this.setImageScanEnabled(imageScanEnabled);
        return this;
    }

    public void setImageScanEnabled(Boolean imageScanEnabled) {
        this.put("imageScanEnabled", imageScanEnabled);
    }

    /**
     * Use {@link #setValidators(List)} instead
     * @deprecated
     * @param validators
     */
    @Deprecated
    public void setValidators(Set<IValidatorSpec> validators) {
        this.setValidators(validators != null ? validators.toArray(new IValidatorSpec[]{}) : null);
    }

    public void setValidators(List<IValidatorSpec> validators) {
        this.setValidators(validators != null ? validators.toArray(new IValidatorSpec[]{}) : null);
    }
    
    @JsonSetter
    public void setValidators(IValidatorSpec[] validators) {
        // Jackson won't properly serialize the IValidatorSpecs unless they
        // are an array.  Appears to be due to a bug with having a list of 
        // child objects annotated with @JsonTypeInfo who belong to a
        // parent that is also annotated with @JsonTypeInfo
        this.put("validators", validators);
    }
    
    
    public FormField addValidators(IValidatorSpec ...validators) {
        if (validators != null && validators.length > 0) {
            if (! this.optionalProperties.containsKey("validators")) {
                this.put("validators", new IValidatorSpec[]{});
            }
            IValidatorSpec[] currentValidators = (IValidatorSpec[]) this.optionalProperties.get("validators");
            this.put("validators", ArrayUtils.addAll(currentValidators, validators));
        }
        return this;
    }

	public void setHintText(String hintText) {
		this.put("hintText", hintText);
	}
	
	public void setValidationMessages( Map<String,String> messages) {
		this.put("validationMessages", messages);
	}
	
	@SuppressWarnings("unchecked")
	public Map<String, String> getValidationMessages() {
		if(any().containsKey("validationMessages")) {
			return (Map<String, String>) any().get("validationMessages");
		}
		return null;
	}
	
    public void addValidationMessage( String validatorName, String message) {
    	if( getValidationMessages() == null) {
    		setValidationMessages(new HashMap<String, String>());
    	}
    	getValidationMessages().put(validatorName, message);
    }

    public boolean isReadOnly() {
        return readOnly;
    }

    public void setReadOnly(boolean readOnly) {
        this.readOnly = readOnly;
    }
}
