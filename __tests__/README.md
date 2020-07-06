# Tests

This project uses [Jest](https://jestjs.io/) for tests, and has some help from [Figma API Stub](https://github.com/react-figma/figma-api-stub), since the official Figma Plugins API is untestable.

## Coverage

Coverage is currently at an impressive 98%. Some artifacts, like EllipseNode, are currently not present in Figma API Stub, so 100% will probably never be reached. Important to notice: 98% is the result for all **covered** files. There are still some **uncovered** files, specially at the Flutter side. You can also inspect the coverage by clicking at the Codacy badge:
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/af3321afff1f4d078037e09111120384)](https://www.codacy.com?utm_source=github.com&utm_medium=referral&utm_content=bernaferrari/FigmaToCode&utm_campaign=Badge_Coverage)

![Coverage](../assets/coverage.png)

## Test commands

- To run the tests: `yarn test` or `yarn run test`
- To calculate the coverage: `yarn run coverage`
- To run ES Lint: `yarn run lint`
