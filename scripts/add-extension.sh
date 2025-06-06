#!/bin/bash

# Replace line 29 in src/index.tsx with export statement
sed -i '' '29c\
export * from '\''./extension'\'';
' src/index.tsx
