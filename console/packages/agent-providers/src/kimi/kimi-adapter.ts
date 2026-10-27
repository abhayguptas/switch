import { createAcpAdapter, type AcpAdapter } from '../acp/acp-adapter';
import type { AcpAdapterOptions, AcpProviderHooks } from '../acp/hooks';
import { readiness, signInWith } from '../readiness';

export const KIMI_LOGIN = 'kimi login';

/** Kimi Code CLI running on the generic ACP adapter. */
export const kimiAcp: AcpProviderHooks = {
  provider: 'kimi',
  label: 'Kimi Code',
  defaultBinary: 'kimi',
  capabilities: {
    modelSwitchInSession: true,
    steering: false,
    resume: true,
    approvals: true,
    userInput: false,
  },
  launch: ({ binaryPath, env }) => ({ command: binaryPath, args: ['acp'], env }),
  loginCommand: KIMI_LOGIN,
  inheritEnv: ['KIMI_API_KEY', 'MOONSHOT_API_KEY'],
  checkSignIn: async ({ handshake, env }) => {
    if (env.KIMI_API_KEY?.trim() || env.MOONSHOT_API_KEY?.trim()) {
      return readiness('authenticated', 'Signs in with the Kimi API key it was given.');
    }
    try {
      const init = await handshake();
      if (init.authMethods && init.authMethods.length > 0) {
        return readiness('unauthenticated', signInWith(KIMI_LOGIN));
      }
      return readiness('authenticated', 'Signed in.');
    } catch (error) {
      if (/sign in|auth required|unauthenticated|-32000/i.test(String(error))) {
        return readiness('unauthenticated', signInWith(KIMI_LOGIN));
      }
      throw error;
    }
  },
  promptCapabilities: { image: true },
  mcpServerOf: (toolCall) => {
    const meta = toolCall._meta as
      | { is_mcp_tool_call?: boolean; mcp?: { server?: unknown } }
      | undefined;
    return meta?.is_mcp_tool_call === true && typeof meta.mcp?.server === 'string'
      ? meta.mcp.server
      : undefined;
  },
};

export function createKimiAdapter(options: AcpAdapterOptions = {}): AcpAdapter {
  return createAcpAdapter(kimiAcp, options);
}
