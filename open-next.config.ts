import { defineCloudflareConfig } from '@opennextjs/cloudflare'

// Default configuration: no incremental cache binding is needed because every
// route is statically generated at build time except the unlock flow, which
// is dynamic per request anyway.
export default defineCloudflareConfig()
