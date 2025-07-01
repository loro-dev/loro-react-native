#!/bin/bash

# Replace line 29 in src/index.tsx with export statement
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' '29s/.*/export * from '\''\.\/extension'\'';/' src/index.tsx
else
    # Linux
    sed -i '29s/.*/export * from '\''\.\/extension'\'';/' src/index.tsx
fi
