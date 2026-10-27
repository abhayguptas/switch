import { spawnSync } from 'node:child_process';
import { describeConformance, echoMcpServerSpec } from '../testing/index';
import { createKimiAdapter } from './kimi-adapter';

describeConformance('kimi', {
  createAdapter: async () => createKimiAdapter(),
  unavailableReason: async () => {
    let probe = spawnSync('kimi', ['--version'], { encoding: 'utf8' });
    if (probe.error || probe.status !== 0) {
      probe = spawnSync('kimi-code', ['--version'], { encoding: 'utf8' });
    }
    return probe.error || probe.status !== 0 ? 'the kimi binary is not on PATH' : null;
  },
  skip: {
    'user-input':
      'Kimi Code ACP does not expose an interactive ask-the-user question tool in ACP mode.',
  },
  mcpServers: { echo: echoMcpServerSpec() },
  ...(process.env.KIMI_API_KEY ? { env: { KIMI_API_KEY: process.env.KIMI_API_KEY } } : {}),
  ...(process.env.MOONSHOT_API_KEY
    ? { env: { MOONSHOT_API_KEY: process.env.MOONSHOT_API_KEY } }
    : {}),
});
