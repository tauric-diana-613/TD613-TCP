from __future__ import annotations

import json
import re
from datetime import datetime
from urllib.parse import urlparse


class SchemaValidationError(AssertionError):
    pass


def _resolve_ref(root, ref):
    if not ref.startswith("#/"):
        raise SchemaValidationError(f"unsupported non-local $ref: {ref}")
    value = root
    for token in ref[2:].split("/"):
        token = token.replace("~1", "/").replace("~0", "~")
        value = value[token]
    return value


def _is_type(value, expected):
    if expected == "null":
        return value is None
    if expected == "boolean":
        return isinstance(value, bool)
    if expected == "integer":
        return isinstance(value, int) and not isinstance(value, bool)
    if expected == "number":
        return isinstance(value, (int, float)) and not isinstance(value, bool)
    if expected == "string":
        return isinstance(value, str)
    if expected == "array":
        return isinstance(value, list)
    if expected == "object":
        return isinstance(value, dict)
    raise SchemaValidationError(f"unsupported schema type: {expected}")


def _probe(instance, schema, root):
    try:
        _validate(instance, schema, root, "$")
        return True
    except SchemaValidationError:
        return False


def _validate(instance, schema, root, path):
    if isinstance(schema, bool):
        if not schema:
            raise SchemaValidationError(f"{path}: schema is false")
        return

    if "$ref" in schema:
        _validate(instance, _resolve_ref(root, schema["$ref"]), root, path)

    if "allOf" in schema:
        for index, child in enumerate(schema["allOf"]):
            _validate(instance, child, root, f"{path}<allOf:{index}>")

    if "oneOf" in schema:
        matches = sum(1 for child in schema["oneOf"] if _probe(instance, child, root))
        if matches != 1:
            raise SchemaValidationError(f"{path}: expected exactly one oneOf branch; matched {matches}")

    if "anyOf" in schema and not any(_probe(instance, child, root) for child in schema["anyOf"]):
        raise SchemaValidationError(f"{path}: did not match any anyOf branch")

    if "not" in schema and _probe(instance, schema["not"], root):
        raise SchemaValidationError(f"{path}: matched prohibited schema")

    if "if" in schema and _probe(instance, schema["if"], root):
        if "then" in schema:
            _validate(instance, schema["then"], root, f"{path}<then>")
    elif "else" in schema:
        _validate(instance, schema["else"], root, f"{path}<else>")

    if "const" in schema and instance != schema["const"]:
        raise SchemaValidationError(f"{path}: {instance!r} != const {schema['const']!r}")
    if "enum" in schema and instance not in schema["enum"]:
        raise SchemaValidationError(f"{path}: {instance!r} not in enum")

    if "type" in schema:
        allowed = schema["type"] if isinstance(schema["type"], list) else [schema["type"]]
        if not any(_is_type(instance, expected) for expected in allowed):
            raise SchemaValidationError(f"{path}: expected type {allowed}, got {type(instance).__name__}")

    if isinstance(instance, dict):
        for key in schema.get("required", []):
            if key not in instance:
                raise SchemaValidationError(f"{path}: missing required property {key!r}")
        properties = schema.get("properties", {})
        for key, child in properties.items():
            if key in instance:
                _validate(instance[key], child, root, f"{path}.{key}")
        if schema.get("additionalProperties") is False:
            extras = sorted(set(instance) - set(properties))
            if extras:
                raise SchemaValidationError(f"{path}: additional properties prohibited: {extras}")
        if "minProperties" in schema and len(instance) < schema["minProperties"]:
            raise SchemaValidationError(f"{path}: too few properties")
        if "maxProperties" in schema and len(instance) > schema["maxProperties"]:
            raise SchemaValidationError(f"{path}: too many properties")

    if isinstance(instance, list):
        if "minItems" in schema and len(instance) < schema["minItems"]:
            raise SchemaValidationError(f"{path}: expected at least {schema['minItems']} items")
        if "maxItems" in schema and len(instance) > schema["maxItems"]:
            raise SchemaValidationError(f"{path}: expected at most {schema['maxItems']} items")
        if schema.get("uniqueItems"):
            encoded = [json.dumps(item, ensure_ascii=False, sort_keys=True) for item in instance]
            if len(encoded) != len(set(encoded)):
                raise SchemaValidationError(f"{path}: duplicate array items")
        prefix = schema.get("prefixItems", [])
        for index, child in enumerate(prefix):
            if index < len(instance):
                _validate(instance[index], child, root, f"{path}[{index}]")
        if "items" in schema:
            child = schema["items"]
            for index, value in enumerate(instance[len(prefix):], len(prefix)):
                _validate(value, child, root, f"{path}[{index}]")

    if isinstance(instance, str):
        if "minLength" in schema and len(instance) < schema["minLength"]:
            raise SchemaValidationError(f"{path}: string shorter than {schema['minLength']}")
        if "maxLength" in schema and len(instance) > schema["maxLength"]:
            raise SchemaValidationError(f"{path}: string longer than {schema['maxLength']}")
        if "pattern" in schema and re.search(schema["pattern"], instance) is None:
            raise SchemaValidationError(f"{path}: string does not match {schema['pattern']!r}")
        if schema.get("format") == "date-time":
            try:
                datetime.fromisoformat(instance.replace("Z", "+00:00"))
            except ValueError as exc:
                raise SchemaValidationError(f"{path}: invalid date-time {instance!r}") from exc
        if schema.get("format") in {"uri", "uri-reference"}:
            parsed = urlparse(instance)
            if schema["format"] == "uri" and not parsed.scheme:
                raise SchemaValidationError(f"{path}: invalid URI {instance!r}")

    if isinstance(instance, (int, float)) and not isinstance(instance, bool):
        if "minimum" in schema and instance < schema["minimum"]:
            raise SchemaValidationError(f"{path}: value below minimum {schema['minimum']}")
        if "maximum" in schema and instance > schema["maximum"]:
            raise SchemaValidationError(f"{path}: value above maximum {schema['maximum']}")


def validate(instance, schema, label="instance"):
    try:
        _validate(instance, schema, schema, "$")
    except SchemaValidationError as exc:
        raise SchemaValidationError(f"{label}: {exc}") from exc

