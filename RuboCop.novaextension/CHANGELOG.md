## Version 0.3.0

- Added documentation describing how we attempt to locate and run RuboCop in
  the current project environment.
- Added support for detecting and executing RuboCop with Bundler.

## Version 0.2.2

- Updated error notification to direct users to the extension preferences when
  RuboCop could not be found.
- Configured RuboCop to omit cop names from returned messages (the names were
  previously being stripped manually during parsing).

## Version 0.2.1

- Fixed behavior based on the `rubocop` exit code.
- Stopped outputting the raw RuboCop JSON result to the console.

## Version 0.2.0

- Added an informative notice to the user when RuboCop could not be found.
- Restructured the project to allow for npm dependencies to be consumed.
- Added a new icon for the extension.
- Added documentation to the README.
- Simplified the formatting of the CHANGELOG.

## Version 0.1.0

- Initial release.
