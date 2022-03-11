package org.jumpmind.pos.persist.model;

import org.apache.commons.collections4.map.CaseInsensitiveMap;

import java.util.Map;

public abstract class AbstractAugmentedEffectiveTaggedModel extends AbstractEffectiveTaggedModel implements IAugmentedModel {

    private Map<String, String> augments = new CaseInsensitiveMap<>();

    @Override
    public Map<String, String> getAugments() {
        return augments;
    }

    @Override
    public void setAugments(Map<String, String> augments) {
        this.augments = augments;
    }

    protected void cloneAbstractAugmentedEffectiveTaggedModel(AbstractAugmentedEffectiveTaggedModel model) {
        this.getAugments().keySet().forEach(key -> {
            model.getAugments().put(key, this.getAugmentValue(key));
        });

        cloneAbstractEffectiveTaggedModelFields(model);
    }
}
