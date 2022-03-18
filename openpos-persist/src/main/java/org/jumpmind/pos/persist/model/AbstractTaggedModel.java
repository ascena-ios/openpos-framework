package org.jumpmind.pos.persist.model;

import java.util.LinkedHashMap;
import java.util.Map;

import org.apache.commons.collections4.map.CaseInsensitiveMap;
import org.jumpmind.pos.persist.AbstractModel;

abstract public class AbstractTaggedModel extends AbstractModel implements ITaggedModel {

    @SuppressWarnings("unused")
    private static final long serialVersionUID = 1L;

    Map<String, String> tags = new CaseInsensitiveMap<String, String>();

    @Override
    public Map<String, String> getTags() {
        return new LinkedHashMap<>(tags);
    }

    @Override
    public void setTags(Map<String, String> tags) {
        if (!(tags instanceof CaseInsensitiveMap)) {
            tags = new CaseInsensitiveMap<>(tags);
        }
        this.tags = tags;
    }

    @Override
    public String getTagValue(String tagName) {
        return tags.get(tagName);
    }

    @Override
    public void setTagValue(String tagName, String tagValue) {
        tags.put(tagName, tagValue);
    }

    @Override
    public void clearTagValue(String tagName) {
        tags.remove(tagName);
    }
}
