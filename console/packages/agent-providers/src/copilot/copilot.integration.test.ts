import { spawnSync } from 'node:child_process';
import { describeConformance, echoMcpServerSpec } from '../testing/index';
import { createCopilotAdapter } from './copilot-adapter';

describeConformance('copilot', {
  createAdapter: async () => createCopilotAdapter(),
  unavailableReason: async () => {
    const probe = spawnSync('copilot', ['--version'], { encoding: 'utf8' });
    return probe.error || probe.status !== 0
      ? 'the GitHub Copilot CLI binary is not available'
      : null;
  },
  mcpServers: { echo: echoMcpServerSpec() },
  ...(process.env.COPILOT_GITHUB_TOKEN
    ? { env: { COPILOT_GITHUB_TOKEN: process.env.COPILOT_GITHUB_TOKEN } }
    : process.env.GH_TOKEN
      ? { env: { GH_TOKEN: process.env.GH_TOKEN } }
      : process.env.GITHUB_TOKEN
        ? { env: { GITHUB_TOKEN: process.env.GITHUB_TOKEN } }
        : {}),
});
