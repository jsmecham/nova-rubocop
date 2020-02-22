# Setting Up Your Environment

This extension will attempt to locate RuboCop in your local environment in the
following order:

1. If your project has a `Gemfile` at the root of the workspace, the extension
   will attempt to run `bundle exec rubocop` in the case you have your RuboCop
   installation managed by Bundler.

2. If your project is not using Bundler to manage your RuboCop installation,
   the extension will attempt to run `rubocop` for your current project's shell
   environment.

## Managing RuboCop Installation with Bundler

If you would like to manage your RuboCop installation with Bundler, please
reference the relevant section of the
[RuboCop Installation Instructions](https://github.com/rubocop-hq/rubocop#installation).

## Installing RuboCop Globally

The preferred way to run Ruby on macOS is through a version manager, such as
Rbenv or RVM. When running this extension, we will attempt to find RuboCop in
your current shell environment for the current workspace (i.e. if you have
Rbenv or RVM configured for your shell, the extension should detect it for the
currently managed Ruby version).

If you are not using a Ruby version manager, you may still install RuboCop
globally on macOS Catalina and below with `sudo gem install rubocop`.
