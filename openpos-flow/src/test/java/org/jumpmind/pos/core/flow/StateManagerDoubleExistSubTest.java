package org.jumpmind.pos.core.flow;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.*;

import org.jumpmind.pos.server.model.Action;
import org.jumpmind.pos.server.service.IMessageService;
import org.jumpmind.pos.util.model.Message;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class StateManagerDoubleExistSubTest {
    
    @InjectMocks
    Injector injector;

    @Mock
    IMessageService messageService;

    @Test
    public void testDoubleSubTransitionExit() throws Exception {
        StateManager stateManager = StateManagerTestUtils.buildStateManager(injector, "testflows");
        
        assertEquals(OrderDetailsState.class, stateManager.getCurrentState().getClass());

        StateManagerTestUtils.doAction(stateManager, "BagPromptRequired");
        
        assertEquals(BagScanState.class, stateManager.getCurrentState().getClass());

        StateManagerTestUtils.doAction(stateManager, "BagNotFound");
        
        assertEquals(BagNotFoundState.class, stateManager.getCurrentState().getClass());

        StateManagerTestUtils.doAction(stateManager, "NoBagsAdded");
        
        assertEquals(OrderDetailsState.class, stateManager.getCurrentState().getClass());
    }
    
    public static class OrderDetailsState  {
        @OnArrive
        public void arrive(Action action) {
        }
        
        @ActionHandler
        public void onNoBagsAdded(Action action) {
            
        }
    }

    public static class BagScanState  {
        @OnArrive
        public void arrive(Action action) {
        }
    }

    public static class BagNotFoundState  {
        @OnArrive
        public void arrive(Action action) {
        }
    }    
     
    
    
}
