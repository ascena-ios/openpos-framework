package org.jumpmind.pos.update.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GetScheduledVersionsRequest {
    String groupId;

    // or

    String businessUnitId;

    String packageName;
}
