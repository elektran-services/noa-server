const dns = require('dns');

/**
 * Node on some Windows setups fails mongodb+srv (SRV) lookups against the
 * default resolver (querySrv ECONNREFUSED). Optional comma-separated list in
 * DNS_SERVERS overrides resolvers for this process (e.g. 8.8.8.8,1.1.1.1).
 */
function configureDnsFromEnv() {
  const raw = process.env.DNS_SERVERS;
  if (!raw || !String(raw).trim()) return;
  const servers = String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (servers.length) {
    dns.setServers(servers);
  }
}

module.exports = configureDnsFromEnv;
