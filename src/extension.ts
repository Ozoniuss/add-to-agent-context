import * as vscode from 'vscode';
import { mergedRanges, formatPath } from './ranges';

const LAST_AGENT_KEY = 'addToAgentContext.lastAgentId';

/** An entry as written in the `addToAgentContext.agents` setting. */
interface AgentSetting {
  label?: string;
  command?: string;
  fileCommand?: string;
  extensionId?: string;
}

/** An entry from the `addToAgentContext.agents` setting. */
interface AgentConfig {
  /** The entry's key in the setting, used to remember the last agent sent to. */
  id: string;
  /** Name shown in the destination picker; the id when not set. */
  label: string;
  /** Command that adds the current editor selection to the agent's context. */
  command: string;
  /**
   * Command that adds a file or folder to the agent's context, called once per
   * item with its `vscode.Uri` as the only argument.
   */
  fileCommand?: string;
  /**
   * Publisher-qualified id of the extension providing the agent, e.g.
   * `anthropic.claude-code`. Used to report a missing extension; when omitted,
   * only `command` is checked.
   */
  extensionId?: string;
}

/** An {@link AgentConfig} resolved against the current VS Code window. */
interface Agent extends AgentConfig {
  /** `installed` and `command` is registered, so the agent can be called. */
  available: boolean;
  /** `installed` and `fileCommand` is set and registered. */
  fileAvailable: boolean;
  /** The extension named by `extensionId` is present, or none was given. */
  installed: boolean;
}

/** An entry in the `pickAction` quick pick. */
interface ActionItem extends vscode.QuickPickItem {
  /** Agent to send to, or `null` for the "Copy to clipboard" entry. */
  agentId: string | null;
  /** Mirrors {@link Agent.available}; absent for the clipboard entry. */
  available?: boolean;
}

function configuredAgents(): AgentConfig[] {
  const agents = vscode.workspace
    .getConfiguration('addToAgentContext')
    .get<Record<string, AgentSetting | null>>('agents', {});

  const result: AgentConfig[] = [];
  for (const [id, agent] of Object.entries(agents)) {
    if (!agent || !agent.command) {
      continue;
    }
    let label = id;
    if (agent.label) {
      label = agent.label;
    }
    result.push({
      id,
      label,
      command: agent.command,
      fileCommand: agent.fileCommand,
      extensionId: agent.extensionId,
    });
  }
  return result;
}

async function availableAgents(): Promise<Agent[]> {
  const registered = new Set(await vscode.commands.getCommands(true));

  const result: Agent[] = [];
  for (const agent of configuredAgents()) {
    let installed = true;
    if (agent.extensionId) {
      installed = vscode.extensions.getExtension(agent.extensionId) !== undefined;
    }
    const available = installed && registered.has(agent.command);
    let fileAvailable = false;
    if (installed && agent.fileCommand) {
      fileAvailable = registered.has(agent.fileCommand);
    }
    result.push({ ...agent, installed, available, fileAvailable });
  }
  return result;
}

async function sendToAgent(agent: Agent, editor: vscode.TextEditor): Promise<void> {
  const merged = mergedRanges(editor);

  if (merged.length === 0) {
    await vscode.commands.executeCommand(agent.command);
    return;
  }

  const original = editor.selections;
  try {
    for (const [start, end] of merged) {
      const endLine = editor.document.lineAt(end - 1);
      editor.selections = [
        new vscode.Selection(start - 1, 0, end - 1, endLine.range.end.character),
      ];
      await vscode.commands.executeCommand(agent.command);
    }
  } finally {
    editor.selections = original;
  }
}

async function runAgentById(editor: vscode.TextEditor, agentId: string): Promise<boolean> {
  const agents = await availableAgents();
  const agent = agents.find((a) => a.id === agentId);

  if (!agent) {
    vscode.window.showWarningMessage(
      `No agent registered with id "${agentId}". Check addToAgentContext.agents.`
    );
    return false;
  }
  if (!agent.available) {
    const reason = agent.installed
      ? `command "${agent.command}" is not registered`
      : `extension "${agent.extensionId}" is not installed`;
    vscode.window.showWarningMessage(`Cannot send to ${agent.label}: ${reason}.`);
    return false;
  }

  await sendToAgent(agent, editor);
  return true;
}


async function selectedExplorerUris(): Promise<vscode.Uri[]> {
  const previous = await vscode.env.clipboard.readText();
  let copied: string;
  try {
    await vscode.commands.executeCommand('copyFilePath');
    copied = await vscode.env.clipboard.readText();
  } finally {
    await vscode.env.clipboard.writeText(previous);
  }

  const uris: vscode.Uri[] = [];
  for (const line of copied.split(/\r?\n/)) {
    if (line.trim() === '') {
      continue;
    }
    uris.push(vscode.Uri.file(line));
  }
  return uris;
}

async function pickFileAgent(): Promise<void> {
  const uris = await selectedExplorerUris();
  if (uris.length === 0) {
    return;
  }

  const paths: string[] = [];
  for (const uri of uris) {
    paths.push(uri.fsPath);
  }

  const items: (vscode.QuickPickItem & { fileCommand: string | null })[] = [
    {
      label: '$(clippy) Copy to clipboard',
      description: paths.join(', '),
      fileCommand: null,
    },
  ];
  for (const agent of await availableAgents()) {
    if (!agent.fileAvailable || !agent.fileCommand) {
      continue;
    }
    items.push({
      label: `$(comment-discussion) Send to ${agent.label}`,
      fileCommand: agent.fileCommand,
    });
  }

  let placeHolder = `Copy ${uris.length} paths, or add them to an agent`;
  if (uris.length === 1) {
    placeHolder = `Copy ${vscode.workspace.asRelativePath(uris[0])}, or add it to an agent`;
  }
  const choice = await vscode.window.showQuickPick(items, { placeHolder });
  if (!choice) {
    return;
  }

  if (choice.fileCommand === null) {
    await vscode.env.clipboard.writeText(paths.join('\n'));
    return;
  }
  for (const uri of uris) {
    await vscode.commands.executeCommand(choice.fileCommand, uri);
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const copy = vscode.commands.registerCommand('addToAgentContext.copy', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    await vscode.env.clipboard.writeText(formatPath(editor));
  });

  const send = vscode.commands.registerCommand(
    'addToAgentContext.sendToAgent',
    async (agentId?: string) => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const target = agentId ?? context.workspaceState.get<string>(LAST_AGENT_KEY);

      if (target) {
        if (await runAgentById(editor, target)) {
          await context.workspaceState.update(LAST_AGENT_KEY, target);
          return;
        }
      }
      await vscode.commands.executeCommand('addToAgentContext.pickAction');
    }
  );

  const pick = vscode.commands.registerCommand('addToAgentContext.pickAction', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const lastAgentId = context.workspaceState.get<string>(LAST_AGENT_KEY);
    const agents = await availableAgents();

    const items: ActionItem[] = [
      {
        label: '$(clippy) Copy to clipboard',
        description: formatPath(editor),
        agentId: null,
      },
    ];

    for (const agent of agents) {
      let description: string | undefined;
      if (agent.id === lastAgentId) {
        description = 'last used';
      }

      let detail: string | undefined;
      if (!agent.installed) {
        detail = `Unavailable: extension "${agent.extensionId}" is not installed`;
      } else if (!agent.available) {
        detail = `Unavailable: command "${agent.command}" is not registered`;
      }

      items.push({
        label: `$(comment-discussion) Send to ${agent.label}`,
        description,
        detail,
        agentId: agent.id,
        available: agent.available,
      });
    }

    const choice = await vscode.window.showQuickPick(items, {
      placeHolder: 'Copy path with line selection, or add it to an agent',
      matchOnDescription: true,
    });
    if (!choice) return;

    if (choice.agentId === null) {
      await vscode.env.clipboard.writeText(formatPath(editor));
      return;
    }
    if (choice.available === false) {
      await runAgentById(editor, choice.agentId);
      return;
    }
    if (await runAgentById(editor, choice.agentId)) {
      await context.workspaceState.update(LAST_AGENT_KEY, choice.agentId);
    }
  });

  const pickFiles = vscode.commands.registerCommand(
    'addToAgentContext.pickFileAction',
    pickFileAgent
  );

  context.subscriptions.push(copy, send, pick, pickFiles);
}

export function deactivate(): void { }
