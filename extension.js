const vscode = require('vscode');

const LAST_AGENT_KEY = 'copyPathWithLines.lastAgentId';

function mergedRanges(editor) {
  const allowMultiple = vscode.workspace
    .getConfiguration('copyPathWithLines')
    .get('allowMultipleSelections', true);

  const selections = allowMultiple ? editor.selections : [editor.selection];

  const intervals = selections
    .filter((sel) => !sel.isEmpty)
    .map((sel) => [sel.start.line + 1, sel.end.line + 1])
    .sort((a, b) => a[0] - b[0]);

  const merged = [];
  for (const [start, end] of intervals) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }
  return merged;
}

function formatPath(editor) {
  let path = editor.document.uri.fsPath;
  const merged = mergedRanges(editor);
  if (merged.length > 0) {
    const suffix = merged
      .map(([start, end]) => (start === end ? `${start}` : `${start}-${end}`))
      .join(',');
    path += `:${suffix}`;
  }
  return path;
}

function configuredAgents() {
  const agents = vscode.workspace
    .getConfiguration('copyPathWithLines')
    .get('agents', []);
  return agents.filter((a) => a && a.id && a.label && a.command);
}

async function availableAgents() {
  const registered = new Set(await vscode.commands.getCommands(true));
  return configuredAgents().map((agent) => {
    const installed =
      !agent.extensionId || vscode.extensions.getExtension(agent.extensionId) !== undefined;
    return {
      ...agent,
      available: installed && registered.has(agent.command),
      installed,
    };
  });
}

async function sendToAgent(agent, editor) {
  const revealOnSend = vscode.workspace
    .getConfiguration('copyPathWithLines')
    .get('revealOnSend', true);

  if (revealOnSend && agent.revealCommand) {
    try {
      await vscode.commands.executeCommand(agent.revealCommand);
    } catch {}
  }

  const merged = mergedRanges(editor);

  if (!agent.perRangeInvocation || merged.length < 2) {
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

async function runAgentById(editor, agentId) {
  const agents = await availableAgents();
  const agent = agents.find((a) => a.id === agentId);

  if (!agent) {
    vscode.window.showWarningMessage(
      `No agent registered with id "${agentId}". Check copyPathWithLines.agents.`
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

function activate(context) {
  const copy = vscode.commands.registerCommand('copyPathWithLines.copy', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    await vscode.env.clipboard.writeText(formatPath(editor));
  });

  const send = vscode.commands.registerCommand(
    'copyPathWithLines.sendToAgent',
    async (agentId) => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const target = agentId ?? context.workspaceState.get(LAST_AGENT_KEY);

      if (target) {
        if (await runAgentById(editor, target)) {
          await context.workspaceState.update(LAST_AGENT_KEY, target);
          return;
        }
      }
      await vscode.commands.executeCommand('copyPathWithLines.pickAction');
    }
  );

  const pick = vscode.commands.registerCommand('copyPathWithLines.pickAction', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const lastAgentId = context.workspaceState.get(LAST_AGENT_KEY);
    const agents = await availableAgents();

    const items = [
      {
        label: '$(clippy) Copy to clipboard',
        description: formatPath(editor),
        agentId: null,
      },
      ...agents.map((agent) => ({
        label: `$(comment-discussion) Send to ${agent.label}`,
        description: agent.id === lastAgentId ? 'last used' : undefined,
        detail: agent.available
          ? undefined
          : agent.installed
            ? `Unavailable: command "${agent.command}" is not registered`
            : `Unavailable: extension "${agent.extensionId}" is not installed`,
        agentId: agent.id,
        available: agent.available,
      })),
    ];

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

  context.subscriptions.push(copy, send, pick);
}

function deactivate() { }

module.exports = { activate, deactivate };
