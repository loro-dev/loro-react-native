# loro-react-native

<p align="center">
  <a aria-label="X" href="https://x.com/loro_dev" target="_blank">
    <img alt="" src="https://img.shields.io/badge/Twitter-black?style=for-the-badge&logo=Twitter">
  </a>
  <a aria-label="Discord-Link" href="https://discord.gg/tUsBSVfqzf" target="_blank">
    <img alt="" src="https://img.shields.io/badge/Discord-black?style=for-the-badge&logo=discord">
  </a>
  <a aria-label="Gurubase" href="https://gurubase.io/g/loro" target="_blank">
    <img alt="" src="https://img.shields.io/badge/Ask%20Loro%20Guru-000000?style=for-the-badge">
  </a>
</p>

React native binding for [Loro](https://loro.dev)

## Installation

```sh
npm install loro-react-native
```

## Usage


```js
import { LoroDoc } from 'loro-react-native';

// ...

const doc = new LoroDoc();
```

You can find an editor demo [here](https://github.com/Leeeon233/loro-react-native-demo)

## Dev

### Release 1.17.1

Uses Loro core and FFI 1.17.1, including `exportPendingUpdates()` for saving
received updates waiting for dependencies. Save these bytes with a consistent
snapshot and restore the snapshot first. Clear older saved pending bytes when
the method returns `undefined`.

Version tags run `.github/workflows/release.yml`: build release libraries for
iOS and Android, regenerate bindings, check TypeScript, and verify the npm
tarball contains both platforms before publishing. npm publishing requires a
trusted publisher for that workflow or the repository's `NPM_TOKEN` secret.

Follow the [getting started](https://jhugman.github.io/uniffi-bindgen-react-native/guides/pre-installation.html) to set up the environment.

### IOS

```
yarn
yarn ubrn:ios
yarn example ios
```

### Android

```
yarn
yarn ubrn:android
yarn example android
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [uniffi-bindgen-react-native](https://github.com/jhugman/uniffi-bindgen-react-native)
