import os from 'os';
import dns from 'dns';

/**
 * Cloud Container Network Guard
 * 
 * Context:
 * Standard cloud containers (Render, AWS ECS, Heroku, Docker) do not allocate
 * public IPv6 default gateways to containers. However, the Linux network interface
 * (eth0) often has an autoconfigured link-local IPv6 address (fe80::).
 * 
 * In Nodemailer v10, its internal DNS resolver (shared/index.js) checks os.networkInterfaces().
 * Seeing the link-local IPv6 address, it assumes full IPv6 internet capability, executes
 * dns.resolve6('smtp.gmail.com'), and randomly selects an IPv6 address (e.g., 2607:f8b0:...).
 * Because the container has no outbound IPv6 route, the TCP handshake immediately fails with:
 * `ENETUNREACH 2607:f8b0:... - Local (:::0)`.
 * 
 * This module enforces strict IPv4 routing across Node.js runtime and libraries:
 * 1. Sets dns.setDefaultResultOrder('ipv4first') for standard dns.lookup calls.
 * 2. Filters os.networkInterfaces() to report IPv4 interfaces, preventing Nodemailer from querying IPv6.
 * 3. Intercepts dns.Resolver.prototype.resolve6 to safely return ENODATA if queried.
 */

// 1. Force Node's built-in DNS lookup to prioritize IPv4
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignored on unsupported Node versions
}

// 2. Prevent Nodemailer's isFamilySupported(6) from detecting link-local container IPv6
try {
  const origNetworkInterfaces = os.networkInterfaces.bind(os);
  os.networkInterfaces = function () {
    const interfaces = origNetworkInterfaces();
    for (const key of Object.keys(interfaces)) {
      if (interfaces[key]) {
        interfaces[key] = interfaces[key]!.filter(
          (net) => net.family === 'IPv4' || (net.family as unknown) === 4
        );
      }
    }
    return interfaces;
  };
} catch {
  // Ignored if runtime restricts os overrides
}

// 3. Fallback: ensure direct resolve6 calls gracefully return ENODATA on IPv4-only hosts
try {
  const handleResolve6 = (
    _hostname: string,
    _options: any,
    callback?: (err: Error | null, addresses: string[]) => void
  ) => {
    const cb = typeof _options === 'function' ? _options : callback;
    const err: any = new Error('IPv6 outbound routing unavailable on cloud container');
    err.code = (dns as any).NODATA || 'ENODATA';
    if (typeof cb === 'function') {
      cb(err, []);
    }
  };

  (dns as any).resolve6 = handleResolve6;
  if (dns.Resolver && dns.Resolver.prototype) {
    (dns.Resolver.prototype as any).resolve6 = handleResolve6;
  }
} catch {
  // Ignored if dns is frozen
}
