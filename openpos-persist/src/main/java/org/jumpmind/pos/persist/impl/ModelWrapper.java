package org.jumpmind.pos.persist.impl;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.joda.money.CurrencyUnit;
import org.joda.money.Money;
import org.jumpmind.db.model.Column;
import org.jumpmind.db.model.Table;
import org.jumpmind.pos.persist.*;
import org.jumpmind.pos.persist.model.*;
import org.jumpmind.pos.util.ReflectUtils;
import org.jumpmind.pos.util.model.ITypeCode;
import org.springframework.util.LinkedCaseInsensitiveMap;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.*;
import java.util.Map.Entry;

@Slf4j
public class ModelWrapper {

    public static final String ENTITY_RETRIEVAL_TIME = "entity.retrieval.time";

    private ModelMetaData modelMetaData;
    private AbstractModel model;
    private AugmenterHelper augmenterHelper;
    
    private Map<String, Object> systemData;

    private LinkedCaseInsensitiveMap<Column> fieldsToColumns = new LinkedCaseInsensitiveMap<Column>();
    private LinkedCaseInsensitiveMap<Object> columnNamesToValues;
    
    @SuppressWarnings("unchecked")
    public ModelWrapper(AbstractModel model, ModelMetaData modelMetaData, AugmenterHelper augmenterHelper) {
        this.model = model;
        this.modelMetaData = modelMetaData;
        this.augmenterHelper = augmenterHelper;

        modelMetaData.getModelClassMetaData().forEach( modelClassMetaData -> {
            if(modelClassMetaData.getExtensionClazzes() != null){
                modelClassMetaData.getExtensionClazzes().forEach(extensionClazz -> {
                    if( !model.getExtensions().containsKey(extensionClazz)){
                        //initialize all the extension classes on the model
                        try {
                            this.model.addExtension(extensionClazz, extensionClazz.newInstance());
                        } catch (Exception ex) {
                            throw new PersistException("Failed to create model extension class " + extensionClazz, ex );
                        }
                    }
                });
            }
        });
        
        Field field = modelMetaData.getSystemDataField();
        try {
            if (field != null) {
                systemData = (Map<String, Object>) field.get(model);
            } else {
                systemData = new HashMap<>();
            }
        } catch (Exception ex) {
            log.debug("Failed to access hidden system field systemInfo on object: " + model, ex);
            systemData = new HashMap<>();
        } 
    }

    public void load() {
        fieldsToColumns = mapFieldsToColumns(model.getClass());
    }

    public void loadValues() {
        columnNamesToValues = mapColumnNamesToValues();
    }

    public void put(String key, Object value) {
        systemData.put(key, value);
    }
    
    public Object get(String key) {
        return systemData.get(key);
    }
    
    public Set<String> keySet() {
        return systemData.keySet();
    }
    public boolean isNew() {
        return ! systemData.containsKey(ENTITY_RETRIEVAL_TIME);
    }
    public void setRetrievalTime(Date retrievalTime) {
        systemData.put(ENTITY_RETRIEVAL_TIME, retrievalTime);
    }
    public Date getRetrievalTime() {
        return (Date) systemData.get(ENTITY_RETRIEVAL_TIME);
    }
    
    public Date getCreateTime() {
        return model.getCreateTime();
    }

    public void setCreateTime(Date createTime) {
        model.setCreateTime(createTime);
    }

    public String getCreateBy() {
        return model.getCreateBy();
    }

    public void setCreateBy(String createBy) {
        model.setCreateBy(createBy);
    }

    public Date getLastUpdateTime() {
        return model.getLastUpdateTime();
    }

    public void setLastUpdateTime(Date lastUpdateTime) {
        model.setLastUpdateTime(lastUpdateTime);
    }

    public String getLastUpdateBy() {
        return model.getLastUpdateBy();
    }

    public void setLastUpdateBy(String lastUpdateBy) {
        model.setLastUpdateBy(lastUpdateBy);
    }
    
    public void setAdditionalField(String fieldName, Object fieldValue) {
        model.setAdditionalField(fieldName, fieldValue);
    }    
    
    public Object getAdditionalField(String fieldName) {
        return model.getAdditionalField(fieldName);
    }
    
    public Map<String, Object> getAdditionalFields() {
        return model.getAdditionalFields();
    }    
    
    protected LinkedCaseInsensitiveMap<Column> mapFieldsToColumns(Class<?> resultClass) {

        fieldsToColumns = new LinkedCaseInsensitiveMap<Column>();
        buildFieldColumnMap(fieldsToColumns, resultClass);
        fieldsToColumns = orderColumns(fieldsToColumns);
        return fieldsToColumns;
    }

    protected void buildFieldColumnMap(LinkedCaseInsensitiveMap<Column> fieldColumnMap, Class<?> clazz) {
        for (ModelClassMetaData classMetaData : modelMetaData.getModelClassMetaData()) {
            Map<String, FieldMetaData> fieldMetaDatas = classMetaData.getEntityFieldMetaDatas();
            fieldMetaDatas.forEach((k,v)->fieldColumnMap.put(v.getField().getName(),v.getColumn()));
            if (ITaggedModel.class.isAssignableFrom(clazz)) {
                Column[] columns = classMetaData.getTable().getColumns();
                for (Column column : columns) {
                    if (column.getName().toUpperCase().startsWith(TagModel.TAG_PREFIX)) {
                        fieldColumnMap.put(column.getName(), column);
                    }
                }
            }
            if (IAugmentedModel.class.isAssignableFrom(clazz) && clazz.getAnnotation(Augmented.class) != null) {
                List<AugmenterConfig> configs = augmenterHelper.getAugmenterConfigs(clazz);
                if (CollectionUtils.isNotEmpty(configs)) {
                    for (AugmenterConfig config : configs) {
                        if (config != null && config.getPrefix() != null) {
                            Column[] columns = classMetaData.getTable().getColumns();
                            for (Column column : columns) {
                                if (column.getName().toUpperCase().startsWith(config.getPrefix())) {
                                    fieldColumnMap.put(column.getName(), column);
                                }
                            }
                        }
                        else {
                            log.debug("Missing augmenterConfig for class named " + clazz.getSimpleName());
                        }
                    }
                }
            }
        }
    }

    protected LinkedCaseInsensitiveMap<Column> orderColumns(LinkedCaseInsensitiveMap<Column> argFieldsToColumns) {
        LinkedCaseInsensitiveMap<Column> orderedFieldsToColumns = new LinkedCaseInsensitiveMap<>();
        
        // Primary keys first.
        for (Entry<String, Column> entry : argFieldsToColumns.entrySet()) {
            if (entry.getValue().isPrimaryKey()) {
                orderedFieldsToColumns.put(entry.getKey(), entry.getValue());  
            }
        }
        
        // Next regular fields
        for (Entry<String, Column> entry : argFieldsToColumns.entrySet()) {
            if (!isRowMaintenanceColumn(entry.getValue())) {
                orderedFieldsToColumns.put(entry.getKey(), entry.getValue());  
            }            
        }
        
        // Now maintenance fields.
        for (Entry<String, Column> entry : argFieldsToColumns.entrySet()) {
            if (isRowMaintenanceColumn(entry.getValue())) {
                orderedFieldsToColumns.put(entry.getKey(), entry.getValue());  
            }            
        }
        
        return orderedFieldsToColumns;
    }

    protected LinkedCaseInsensitiveMap<Object> mapColumnNamesToValues() {
        try {
            LinkedCaseInsensitiveMap<Object> columnNamesToObjectValues = new LinkedCaseInsensitiveMap<Object>();
            Set<String> fieldNames = fieldsToColumns.keySet();
            List<AugmenterConfig> configs = augmenterHelper.getAugmenterConfigs(model);

            for (String fieldName : fieldNames) {
                AugmenterConfig config = getAugmentedConfigWithPrefix(configs, fieldName);
                if (fieldName.toUpperCase().startsWith(TagModel.TAG_PREFIX)) {
                    String tagValue = ((ITaggedModel) model).getTagValue(fieldName.substring(TagModel.TAG_PREFIX.length()));
                    if (StringUtils.isEmpty(tagValue)) {
                        log.warn("Tag \'" + fieldName.substring(TagModel.TAG_PREFIX.length()) + "\' in model \'" + model.getClass().getSimpleName() + "\' was set to an empty value.");
                    }
                    columnNamesToObjectValues.put(fieldName, tagValue);
                } else if (config != null) {
                    String augmentValue = ((IAugmentedModel) model).getAugmentValue(fieldName.substring(config.getPrefix().length()));
                    columnNamesToObjectValues.put(fieldName, ObjectUtils.defaultIfNull(augmentValue, augmenterHelper.getDefaultValue(fieldName, model)));
                } else {
                    Column column = fieldsToColumns.get(fieldName);
                    Object value = getFieldValue(fieldName);

                    if (value instanceof Money) {
                        handleMoneyField(columnNamesToObjectValues, fieldName, column, (Money) value);
                    } else if (value instanceof ITypeCode) {
                        columnNamesToObjectValues.put(column.getName(), value.toString());
                    } else {
                        columnNamesToObjectValues.put(column.getName(), value);
                    }
                }
            }
            return columnNamesToObjectValues;
        } catch (Exception ex) {
            throw new PersistException(
                    "Failed to getObjectValuesByColumnName on model " + model + " fieldsToColumns: " + fieldsToColumns, ex);
        }
    }

    private AugmenterConfig getAugmentedConfigWithPrefix(List<AugmenterConfig> augmenterConfigs, String fieldName) {
        for (AugmenterConfig config : augmenterConfigs) {
            if (fieldName.toUpperCase().startsWith(config.getPrefix())) {
                return config;
            }
        }
        return null;
    }

    public Object getFieldValue(String fieldName) {
        Object fieldValue=null;
        Object obj = model;

        // First we need to figure out if this field is on the model or an extension model
        FieldMetaData fieldMetaData = getFieldMetaData(fieldName);
        if( fieldMetaData  != null && model.getExtensions().containsKey(fieldMetaData.getClazz())){
            obj = model.getExtension(fieldMetaData.getClazz());
        }

        try {
            fieldValue = PropertyUtils.getProperty(obj, fieldName);
        } catch (Exception ex) {
            throw new PersistException("Failed to getFieldValue on " + obj + " fieldName " + fieldName, ex);
        }
        return fieldValue;
    }

    @SuppressWarnings("unchecked")
    public void setValue(String fieldName, Object value) {
        FieldMetaData fieldMetaData = getFieldMetaData(fieldName);

        try {            
            if (fieldMetaData.getField().getType().isAssignableFrom(Money.class)
                    && value != null) {
                Field xRefField = getXRefForField(fieldName);
                String modelCurrencyCode = (String)getFieldValue(xRefField.getName());
                if (StringUtils.isEmpty(modelCurrencyCode)) {
                    throw new PersistException("Money field " + fieldName + " cannot be loaded because crossReference= " + getXrefName(fieldName)
                    + " does not have a value. Model: " + model); 
                }
                CurrencyUnit currency = CurrencyUnit.of(modelCurrencyCode);

                BigDecimal decimalValue;
                    if(value instanceof String){
                        decimalValue = new BigDecimal((String)value);
                    } else{
                        decimalValue = (BigDecimal)value;
                    }

                decimalValue = decimalValue.setScale(currency.getDecimalPlaces());
                value = Money.of(currency, decimalValue);
            } else if (ITypeCode.class.isAssignableFrom(fieldMetaData.getField().getType())) {
                value = ITypeCode.make((Class<ITypeCode>)fieldMetaData.getField().getType(), value != null ? value.toString() : null);
            }
            setFieldValue(fieldMetaData,value);
        } catch (Exception ex) {
            if (ex instanceof PersistException) {
                throw (PersistException)ex;
            } else {                
                throw new PersistException("Failed to set " + fieldName + " to " + value + " on " + model, ex);
            }
        }
    }

    private void setFieldValue(FieldMetaData fieldMetaData, Object value) throws Exception {
        Class<?> clazz = fieldMetaData.getClazz();
        Object targetObject = model;

        // Is the field we are trying to set on the extension model? if so then we want to switch the target object
        // to the correct extension model
        if(model.getExtensions().containsKey(clazz)){
            targetObject = model.getExtension(clazz);
        }

        // If the field is on the top level model object then we just set it
        // otherwise we need to loop through any composite objects to find the correct one
        if (clazz.isInstance(targetObject)) {
            ReflectUtils.setProperty(fieldMetaData.getField(), targetObject, value);
        } else {
            Class<? extends Object> targetClazz = targetObject.getClass();
            while (targetClazz != Object.class) {
                Field[] fields = targetClazz.getDeclaredFields();
                for (Field field : fields) {
                    CompositeDef compositeDefAnnotation = field.getAnnotation(CompositeDef.class);
                    if (compositeDefAnnotation != null) {
                        if (field.getType() == fieldMetaData.getClazz()) {
                            Object fieldValue = getFieldValue(field.getName());
                            if (fieldValue == null) {
                                ReflectUtils.setProperty(field, targetObject, fieldMetaData.getClazz().newInstance());
                                fieldValue = getFieldValue(field.getName());
                            }
                            ReflectUtils.setProperty(fieldMetaData.getField(), fieldValue, value);
                            return;
                        }
                    }
                }
                targetClazz = targetClazz.getSuperclass();
            }
        }
    }

    protected BigDecimal handleMoneyField(LinkedCaseInsensitiveMap<Object> columnNamesToObjectValues,
            String fieldName, Column moneyDecimalColumn, Money value) {
        if (value != null) {
            String isoCurrencyCode = value.getCurrencyUnit().getCode();
            BigDecimal decimal = value.getAmount();
            
            Field xRefField = getXRefForField(fieldName);
            
            try {
                ColumnDef xRefColumnDef = xRefField.getDeclaredAnnotation(ColumnDef.class);
                String modelCurrencyCode = (String)getFieldValue(xRefField.getName());
                if (StringUtils.isEmpty(modelCurrencyCode)) {
                    try {
                        xRefField.set(model, isoCurrencyCode);
                    } catch(Exception ex) {
                    }
                } else if (!StringUtils.equals(isoCurrencyCode, modelCurrencyCode)) {
                    throw new PersistException("Money field " + fieldName + " has a crossReference= " + getXrefName(fieldName)
                            + " currency field, but the currency code does not match. Currency code on Money: " 
                            + isoCurrencyCode + " currency code on model " + modelCurrencyCode + ". Model: " + model);                
                }
                columnNamesToObjectValues.put(moneyDecimalColumn.getName(), decimal);
                columnNamesToObjectValues.put(xRefColumnDef.name() != null ? xRefColumnDef.name() : 
                    DatabaseSchema.camelToSnakeCase(xRefField.getName()), isoCurrencyCode);
            } catch (Exception ex) {
                throw new PersistException("Failed to set money field " + fieldName  
                        + " on model " + model, ex);
            }
            return decimal;
        } else {
            return null;
        }
    }
    
    protected String getXrefName(String fieldName) {
        Field field = getField(fieldName);
        ColumnDef mainColumnDef = field.getDeclaredAnnotation(ColumnDef.class);
        String crossReference = mainColumnDef.crossReference();
        return crossReference;
    }
    
    protected Field getXRefForField(String fieldName) {
        String crossReference = getXrefName(fieldName);
        if (StringUtils.isEmpty(crossReference)) {
            throw new PersistException("Field " + fieldName + " must define a crossReference to a field, "
                    + " such as: @ColumnDef(crossReference=\"isoCurrencyCode\"). model: " + model);
        }
        Field xRefField = getField(crossReference);
        if (xRefField == null) {
            throw new PersistException("Field " + fieldName + " has a crossReference= " + crossReference
                    + " but we could not find a field with that name on this model. Model: " + model);
        }
        xRefField.setAccessible(true);
        return xRefField;
    }
    
    public Field getField(String fieldName) {
        Field field = null;
        for (ModelClassMetaData classMetaData : modelMetaData.getModelClassMetaData()) {
            FieldMetaData fieldMetadata = classMetaData.getFieldMetaData(fieldName);
            if (fieldMetadata != null) {
                field = classMetaData.getFieldMetaData(fieldName).getField();
                if (field != null) {
                    break;
                }
            }
        }
        
        if (field != null) {
            return field;
        }  else {
            throw new PersistException("Could not find field named " + fieldName + " on model " + modelMetaData);
        }
    }

    public FieldMetaData getFieldMetaData(String fieldName) {
        FieldMetaData fieldMetaData = null;
        for (ModelClassMetaData classMetaData : modelMetaData.getModelClassMetaData()) {
            fieldMetaData = classMetaData.getFieldMetaData(fieldName);
            if (fieldMetaData != null) {
                break;
            }
        }
         return fieldMetaData;
    }

    public List<Column> getPrimaryKeyColumns() {
        return modelMetaData.getModelClassMetaData().get(0).getPrimaryKeyColumns();
    }
    
    public boolean[] getNullKeys() {
        boolean[] nullKeyValues = new boolean[getPrimaryKeyColumns().size()];
        int i = 0;
        for (Column column : getPrimaryKeyColumns()) {
            nullKeyValues[i++] = columnNamesToValues.get(column.getName()) == null;
        }        
        return nullKeyValues;
    }
    
    protected boolean isRowMaintenanceColumn(Column column) {
        String name = column.getName().toUpperCase();
        return name.equals("CREATE_BY") 
                || name.equals("CREATE_TIME")
                || name.equals("UPDATE_BY")
                || name.equals("UPDATE_TIME");
    }

    public AbstractModel getModel() {
        return model;
    }

    public void setModel(AbstractModel model) {
        this.model = model;
    }
    
    public LinkedCaseInsensitiveMap<Object> getColumnNamesToValues() {
        return columnNamesToValues;
    }

    public int[] getColumnTypes(Table table) {
        Column[] columns = getColumns(table);
        int types[] = new int[columns.length];
        for (int i = 0; i < columns.length; i++) {
            types[i] = columns[i].getMappedTypeCode();
        }
        return types;
    }

    public Column[] getColumns(Table table) {
        List<Column> columns = new ArrayList<>();
        for (Column modelColumn : fieldsToColumns.values()) {
            for (Column tableColumn : table.getColumns()) {                
                if (isCompatible(modelColumn, tableColumn)) {
                    columns.add(tableColumn);
                    break;
                }
            }
        }
        return columns.toArray(new Column[columns.size()]);
    }

    private boolean isCompatible(Column col1, Column col2) {
        boolean equals = col1.equals(col2);
        if (!equals) {
            if (col1.getName().equalsIgnoreCase(col2.getName())) {
                equals |= col1.isOfBinaryType() && col2.isOfBinaryType();
                equals |= col1.isOfTextType() && col2.isOfTextType();
                equals |= col2.isOfNumericType() && col2.isOfNumericType();
            }
        }
        return equals;
    }

    public ModelMetaData getModelMetaData() {
        return modelMetaData;
    }

    public List<Field> getPrimaryKeyFields() {
        ModelClassMetaData classMetaData = modelMetaData.getModelClassMetaData().get(modelMetaData.getModelClassMetaData().size()-1);

        Set<String> pkFieldNames = classMetaData.getPrimaryKeyFieldNames();

        List<Field> pkFields = new ArrayList<>();

        for (String pkFieldName : pkFieldNames) {
            pkFields.add(classMetaData.getFieldMetaData(pkFieldName).getField());
        }

        return pkFields;
    }
}