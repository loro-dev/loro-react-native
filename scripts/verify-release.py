#!/usr/bin/env python3
"""Reject a release tarball missing either platform's native libraries."""

import json
from pathlib import Path
import sys
import tarfile
import tomllib


def main():
    tarball, tag = sys.argv[1:]
    with tarfile.open(tarball, "r:gz") as archive:
        names = set(archive.getnames())
        package = json.load(archive.extractfile("package/package.json"))
        assert tag == "v" + package["version"], "tag and package version differ"
        required = {
            "package/build/LoroFfiFramework.xcframework/Info.plist",
            "package/android/src/main/jniLibs/arm64-v8a/libloro_rs.a",
            "package/android/src/main/jniLibs/armeabi-v7a/libloro_rs.a",
            "package/cpp/generated/loro.cpp",
            "package/cpp/generated/loro.hpp",
            "package/src/generated/loro.ts",
            "package/LoroReactNative.podspec",
            "package/" + package["main"].removeprefix("./"),
            "package/" + package["types"].removeprefix("./"),
        }
        missing = required - names
        assert not missing, "missing release files: " + ", ".join(sorted(missing))
        bindings = archive.extractfile("package/src/generated/loro.ts").read()
        assert b"exportPendingUpdates(" in bindings, "pending-update API missing"
    lock = tomllib.loads(Path("loro-rs/Cargo.lock").read_text())
    for name in ("loro", "loro-ffi", "loro-internal"):
        versions = {p["version"] for p in lock["package"] if p["name"] == name}
        assert versions == {package["version"]}, f"unexpected {name} versions: {versions}"
    print(f"Verified {package['name']} {package['version']} with iOS and Android libraries.")


if __name__ == "__main__":
    main()
