package org.jumpmind.pos.test.params;

import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.ArgumentsProvider;

import java.math.BigDecimal;
import java.util.stream.Stream;

import static org.junit.jupiter.params.provider.Arguments.arguments;

/**
 * An {@link ArgumentsProvider} which supplies {@link BigDecimalZeroSource}-annotated unit test methods with a
 * {@link BigDecimal#ZERO} argument.
 *
 * @author Jason Weiss
 */
public class BigDecimalZeroProvider implements ArgumentsProvider {
    @Override
    public Stream<? extends Arguments> provideArguments(ExtensionContext context) throws Exception {
        return Stream.of(arguments(BigDecimal.ZERO));
    }
}