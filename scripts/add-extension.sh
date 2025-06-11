#!/bin/bash

# Detect the operating system to use appropriate sed syntax
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    SED_INPLACE="sed -i ''"
else
    # Linux (including CI environments)
    SED_INPLACE="sed -i"
fi

# Replace line 29 in src/index.tsx with export statement
$SED_INPLACE '29c\
export * from '\''./extension'\'';
' src/index.tsx
