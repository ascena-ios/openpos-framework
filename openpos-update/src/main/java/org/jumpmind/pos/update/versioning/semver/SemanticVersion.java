package org.jumpmind.pos.update.versioning.semver;

import lombok.Getter;
import org.jumpmind.pos.update.versioning.Version;

import java.util.Arrays;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Getter
public class SemanticVersion extends Version {
    private final int major;
    private final int minor;
    private final int patch;
    private final String[] buildMetadata;
    private final String[] preReleaseTags;

    private static final Pattern SEMANTIC_VERSION_PATTERN = Pattern.compile("^(?<major>\\d+)(\\.(?<minor>\\d+)(\\.(?<patch>\\d+))?)?(-+(?<pre>[\\w-]+[\\w-.]+))?(\\+(?<build>[\\w-]+[\\w-.]+))?$");
    private static final Pattern SIMPLE_DOT_SEPARATED_IDENTIFIER = Pattern.compile("^[\\w-]+[\\w-.]*$");

    public static Optional<SemanticVersion> tryParse(String version) {
        final Matcher match = SEMANTIC_VERSION_PATTERN.matcher(version);

        if (match.find()) {
            final String parsedMajor = match.group("major");
            final String parsedMinor = match.group("minor");
            final String parsedPatch = match.group("patch");
            final String preRelease = match.group("pre");
            final String buildMeta = match.group("build");

            final int major = Integer.parseInt(parsedMajor);
            final int minor;
            final int patch;

            if (parsedMinor != null) {
                minor = Integer.parseInt(parsedMinor);
            } else {
                minor = 0;
            }

            if (parsedPatch != null) {
                patch = Integer.parseInt(parsedPatch);
            } else {
                patch = 0;
            }

            return Optional.of(new SemanticVersion(major, minor, patch, preRelease, buildMeta));
        }

        return Optional.empty();
    }

    public SemanticVersion(int major)
            throws IllegalArgumentException {
        this(major, 0, 0);
    }

    public SemanticVersion(int major, int minor)
            throws IllegalArgumentException {
        this(major, minor, 0);
    }

    public SemanticVersion(int major, int minor, int patch)
            throws IllegalArgumentException {
        this(major, minor, patch, null, null);
    }

    public SemanticVersion(int major, int minor, int patch, String preRelease, String buildMetadata)
            throws IllegalArgumentException {
        this.major = assertNonNegativeArgument(major, "major");
        this.minor = assertNonNegativeArgument(minor, "minor");
        this.patch = assertNonNegativeArgument(patch, "patch");

        if (preRelease != null) {
            this.preReleaseTags = assertDotSeperatedIdentifier(preRelease, "preRelease")
                    .split("\\.");
        } else {
            this.preReleaseTags = new String[] {};
        }

        if (buildMetadata != null) {
            this.buildMetadata = assertDotSeperatedIdentifier(buildMetadata, "buildMetadata")
                    .split("\\.");
        } else {
            this.buildMetadata = new String[] {};
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SemanticVersion)) return false;

        return equals((SemanticVersion) o);
    }

    @Override
    public int hashCode() {
        int result = major;
        result = 31 * result + minor;
        result = 31 * result + patch;
        result = 31 * result + Arrays.hashCode(buildMetadata);
        result = 31 * result + Arrays.hashCode(preReleaseTags);
        return result;
    }

    public boolean equals(SemanticVersion other) {
        if (preReleaseTags.length != other.preReleaseTags.length) {
            return false;
        }

        if (buildMetadata.length != other.buildMetadata.length) {
            return false;
        }

        for (int i = 0; i < preReleaseTags.length; i++) {
            if (!preReleaseTags[i].equals(other.preReleaseTags[i])) {
                return false;
            }
        }

        for (int i = 0; i < buildMetadata.length; i++) {
            if (!buildMetadata[i].equals(other.buildMetadata[i])) {
                return false;
            }
        }

        return major == other.major
                && minor == other.minor
                && patch == other.patch;
    }

    @Override
    public String getVersionString() {
        final StringBuilder buffer = new StringBuilder();

        buffer.append(major);
        buffer.append('.');
        buffer.append(minor);
        buffer.append('.');
        buffer.append(patch);

        if (preReleaseTags.length > 0) {
            buffer.append('-');

            boolean isFirst = true;
            for (String tag: preReleaseTags) {
                if (!isFirst) {
                    buffer.append('.');
                }

                buffer.append(tag);
                isFirst = false;
            }
        }

        if (buildMetadata.length > 0) {
            buffer.append('+');

            boolean isFirst = true;
            for (String meta: buildMetadata) {
                if (!isFirst) {
                    buffer.append('.');
                }

                buffer.append(meta);
                isFirst = false;
            }
        }

        return buffer.toString();
    }

    @Override
    public boolean versionEquals(Version other) {
        if (other instanceof SemanticVersion) {
            return equals((SemanticVersion) other);
        }

        return false;
    }

    public int compareToSemanticVersion(SemanticVersion o) {
        // compare base version
        int result = symCompare(
                major,
                o.major,
                () -> symCompare(
                        minor,
                        o.minor,
                        () -> symCompare(
                                patch,
                                o.patch,
                                null
                        )
                )
        );

        // Compare pre-release versions
        if (result == 0) {
            // version without pre-release information has higher precedence.
            if (preReleaseTags.length > 0 && o.preReleaseTags.length == 0) {
                return -1;
            }

            if (preReleaseTags.length == 0 && o.preReleaseTags.length > 0) {
                return 1;
            }

            final int compareLength = Math.min(preReleaseTags.length, o.preReleaseTags.length);

            for (int i = 0; i < compareLength; i++) {
                final String left = preReleaseTags[i];
                final String right = o.preReleaseTags[i];

                final Integer leftAsNumber = tryParseInt(left);
                final Integer rightAsNumber = tryParseInt(right);

                if (leftAsNumber != null && rightAsNumber != null) {
                    int nr = leftAsNumber.compareTo(rightAsNumber);
                    if (nr == 0) {
                        continue;
                    }

                    return nr;
                }

                if (leftAsNumber != null) {
                    return -1;
                }

                if (rightAsNumber != null) {
                    return 1;
                }

                int nr = left.compareTo(right);
                if (nr != 0) {
                    return nr;
                }
            }
        }

        // build metadata is not considered during comparison

        return result;
    }

    private static int assertNonNegativeArgument(int value, String argument) throws IllegalArgumentException {
        if (value < 0) {
            throw new IllegalArgumentException("'" + argument + "' must be a non-negative value.");
        }

        return value;
    }

    private static String assertDotSeperatedIdentifier(String value, String argument) throws IllegalArgumentException {
        final Matcher preReleaseMatcher = SIMPLE_DOT_SEPARATED_IDENTIFIER.matcher(value);

        if (!preReleaseMatcher.find()) {
            throw new IllegalArgumentException("'" + argument + "' argument is invalid. Must be a string containing only letters, numbers, and hyphens.");
        }

        return value;
    }

    @Override
    public int compareTo(Version o) {
        if (!(o instanceof SemanticVersion)) {
            throw new IllegalArgumentException("cannot compare against non-SemanticVersion types");
        }

        return this.compareToSemanticVersion((SemanticVersion) o);
    }

    private interface CompareFn {
        int compare();
    }

    private static int symCompare(int left, int right, CompareFn cont) {
        int result = Integer.compare(left, right);

        if (result == 0 && cont != null) {
            return cont.compare();
        }

        return result;
    }

    private static Integer tryParseInt(String value) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException ignored) {
        }

        return null;
    }
}
