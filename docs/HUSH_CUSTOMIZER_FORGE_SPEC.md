# Hush Customizer Forge Spec

## Purpose

The Customizer Forge turns custom mask metadata into a live card preview. It keeps the existing customizer path, then adds persona story, family, use case, risk tell, transform hints, and pressure warnings.

## Required behavior

- render card-field inputs
- render a forge preview
- show missing-field warnings
- keep private text excluded by default
- update preview when metadata changes

## Review posture

The forge can save incomplete masks, but incomplete cards should carry visible warnings.
