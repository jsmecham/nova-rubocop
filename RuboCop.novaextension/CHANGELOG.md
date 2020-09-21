## Version 0.5.1

- Fixed an issue where inclusion/exclusion paths were not being honored in the
  RuboCop configuration (thanks @jbeker).
- Updated deprecated extension metadata for Nova 1.0.

## Version 0.5.0

- Added notifications of RuboCop invocation errors.
- Added a listener to also run RuboCop before save.
- Added better error handling when running the `rubocop` command so that we
  don't completely blow up when there are configuration warnings and errors.

## Version 0.4.2

- Fixed invocation of bundled RuboCop by executing it in the full shell
  environment.

## Version 0.4.1

- Fixed build output for 0.4.0 and resubmitted to the Nova Extension Library.

## Version 0.4.0

- Fixed bundled RuboCop check due to a typo (thanks @evanleck).
- Added `gems.rb` as an alternative to `Gemfile` when checking for a bundled
  RuboCop in the project (thanks @evanleck).

## Version 0.3.1

- Improved the speed of executing RuboCop by caching the environment checks
  that determine which RuboCop installation to use.
- Reverted change from 0.2.2 that configured RuboCop to omit cop names from
  its output. They will be stripped manually for compatibility with older
  versions of RuboCop.

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
