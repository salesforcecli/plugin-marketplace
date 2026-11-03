# plugin-marketplace

[![NPM](https://img.shields.io/npm/v/@salesforce/plugin-marketplace.svg?label=@salesforce/plugin-marketplace)](https://www.npmjs.com/package/@salesforce/plugin-marketplace) [![Downloads/week](https://img.shields.io/npm/dw/@salesforce/plugin-marketplace.svg)](https://npmjs.org/package/@salesforce/plugin-marketplace) [![License](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://opensource.org/license/apache-2-0)

## Add a plugin to the list

Submit a PR [here](/src/shared/plugins.ts). We require that your source code be publicly available.

## Install

```bash
sf plugins install @salesforce/plugin-marketplace@x.y.z
```

## Issues

Please report any issues at https://github.com/forcedotcom/cli/issues

## Contributing

If you're interested in contributing, take a look at the [CONTRIBUTING](CONTRIBUTING.md) guide.

### Build

To build the plugin locally, make sure to have yarn installed and run the following commands:

```bash
# Clone the repository
git clone git@github.com:salesforcecli/plugin-marketplace

# Install the dependencies and compile
yarn && yarn build
```

To use your plugin, run using the local `./bin/dev.js` or `./bin/dev.cmd` file.

```bash
# Run using local run file.
./bin/dev.js plugins discover
```

There should be no differences when running via the Salesforce CLI or using the local run file. However, it can be useful to link the plugin to do some additional testing or run your commands from anywhere on your machine.

```bash
# Link your plugin to the sf cli
sf plugins link .
# To verify
sf plugins
```

## Commands

<!-- commands -->

- [`sf plugins discover`](#sf-plugins-discover)

## `sf plugins discover`

See a list of 3rd-party sf plugins you can install.

```
USAGE
  $ sf plugins discover [--json] [--flags-dir <value>]

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

EXAMPLES
  $ sf plugins discover
```

_See code: [src/commands/plugins/discover.ts](https://github.com/salesforcecli/plugin-marketplace/blob/2.0.25/src/commands/plugins/discover.ts)_

<!-- commandsstop -->
