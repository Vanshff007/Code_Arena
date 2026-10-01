import { useEffect, useState } from 'react';
import { getHealth } from '../../features/health/healthService';
import { APP_VERSION } from '../version';

function Footer() {
  const [serverVersion, setServerVersion] = useState(null);

  // Client and server always ship the same version (docs/contributing.md).
  // A mismatch here means a half-finished deploy, so it is shown.
  useEffect(() => {
    getHealth()
      .then((res) => setServerVersion(res.version))
      .catch(() => setServerVersion(null));
  }, []);

  return (
    <footer className="mt-20 border-t border-rule">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-muted sm:px-6">
        <span>CodeArena. Two players, one problem.</span>
        <span className="num">
          Version {APP_VERSION}
          {serverVersion && serverVersion !== APP_VERSION && (
            <span className="ml-2 text-p2">Server is on {serverVersion}</span>
          )}
        </span>
      </div>
    </footer>
  );
}

export default Footer;
