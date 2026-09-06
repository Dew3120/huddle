import dns from 'node:dns';

const retryableDnsErrors = new Set([
  'EAI_AGAIN',
  'ECONNREFUSED',
  'ENODATA',
  'ENOTFOUND',
  'ESERVFAIL',
  'ETIMEOUT',
]);

export function createMongoLookup(servers) {
  if (servers.length === 0) {
    return undefined;
  }

  const resolver = new dns.Resolver();
  resolver.setServers(servers);

  return (hostname, options, callback) => {
    dns.lookup(hostname, options, (error, address, family) => {
      if (!error || !retryableDnsErrors.has(error.code)) {
        callback(error, address, family);
        return;
      }

      const normalizedOptions =
        typeof options === 'number' ? { family: options } : (options ?? {});
      const fallbackFamily = normalizedOptions.family === 6 ? 6 : 4;
      const resolve =
        fallbackFamily === 6
          ? resolver.resolve6.bind(resolver)
          : resolver.resolve4.bind(resolver);

      resolve(hostname, (fallbackError, addresses) => {
        if (fallbackError || addresses.length === 0) {
          callback(error, address, family);
          return;
        }

        if (normalizedOptions.all) {
          callback(
            null,
            addresses.map((fallbackAddress) => ({
              address: fallbackAddress,
              family: fallbackFamily,
            })),
          );
          return;
        }

        callback(null, addresses[0], fallbackFamily);
      });
    });
  };
}
