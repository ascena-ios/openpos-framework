package org.jumpmind.pos.persist.model;

import org.apache.commons.collections4.map.CaseInsensitiveMap;
import org.jumpmind.pos.persist.AbstractModel;

import java.util.Map;

public abstract class AbstractAugmentedModel extends AbstractModel implements IAugmentedModel {

    private static final long serialVersionUID = 1L;

    private Map<String, String> augments = new CaseInsensitiveMap<String, String>();

    @Override
    public Map<String, String> getAugments() {
        return augments;
    }

    @Override
    public void setAugments(Map<String, String> augments) {
        this.augments = augments;
    }

    public void cloneAbstractAugmentedModelFields(AbstractAugmentedModel abstractAugmentedModel) {
        CaseInsensitiveMap<String, String> newAugments = new CaseInsensitiveMap<>();
        this.getAugments().keySet().forEach(key -> {
            newAugments.put(key, this.getAugments().get(key));
        });
        abstractAugmentedModel.setAugments(newAugments);

        cloneAbstractModelFields(abstractAugmentedModel);
    }
}
