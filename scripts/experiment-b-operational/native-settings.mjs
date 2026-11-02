// Prospective native CLI profile, not an API client or a fallback transport.
// The built-in `openai` ID is reserved in the pinned CLI, so retry controls
// cannot be applied by overriding it. This explicit named definition uses the
// supported provider schema, first-party auth, no API-key field, no endpoint
// override, and the same native Responses wire. It requires independent
// acceptance before dispatch; parsing these controls does not attest service.
export const NATIVE_SETTINGS=Object.freeze({
  'features.apps':false,'features.plugins':false,'features.multi_agent':false,
  'features.memories':false,'features.code_mode_host':false,'features.shell_tool':false,
  'features.browser_use':false,'web_search':'disabled','analytics.enabled':false,
  'features.browser_annotation_api':false,'features.browser_use_external':false,
  'features.browser_use_full_cdp_access':false,'features.in_app_browser':false,
  'features.image_generation':false,'features.view_image':false,'features.sleep_tool':false,
  'features.tool_suggest':false,'features.tool_call_mcp_elicitation':false,
  'features.hooks':false,'features.skill_mcp_dependency_install':false,'features.skill_search':false,
  'features.skip_host_skill_discovery':true,'features.unified_exec_tty':false,
  'features.shell_snapshot':false,'features.incremental_tools':false,
  'features.prediction_preserve_parent_tools':false,'features.multi_agent_v2':false,
  'features.mcp_connection_sharing':false,'features.mcp_oauth_refresh_coordination':false,
  'features.current_time_reminder':false,'features.token_budget':false,'features.deferred_executor':false,
  'features.request_permissions_tool':false,'features.send_message_to_user_async':false,
  'tools.update_plan.enabled':false,'tools.experimental_request_user_input.enabled':false,
  'check_for_update_on_startup':false,'forced_login_method':'chatgpt',
  'cli_auth_credentials_store':'file','model_provider':'td613_native_openai',
  'model_providers.td613_native_openai.name':'OpenAI',
  'model_providers.td613_native_openai.wire_api':'responses',
  'model_providers.td613_native_openai.requires_openai_auth':true,
  'model_providers.td613_native_openai.supports_websockets':true,
  'model_providers.td613_native_openai.supports_standalone_web_search':false,
  'model_providers.td613_native_openai.request_max_retries':0,
  'model_providers.td613_native_openai.stream_max_retries':0
});
