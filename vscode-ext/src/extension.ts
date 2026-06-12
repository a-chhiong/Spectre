import * as vscode from 'vscode';
import { PreviewPanel } from './PreviewPanel';

export function activate(context: vscode.ExtensionContext): void {
  const { extensionUri } = context;

  // ── Open / toggle preview panel ─────────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand('openstudio.openPreview', () => {
      PreviewPanel.createOrShow(extensionUri);
    })
  );

  // ── Export commands ─────────────────────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand('openstudio.exportSVG', () => {
      PreviewPanel.triggerExport('svg');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('openstudio.exportPNG', () => {
      PreviewPanel.triggerExport('png');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('openstudio.exportHTML', () => {
      PreviewPanel.triggerExport('html');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('openstudio.exportPDF', () => {
      PreviewPanel.triggerExport('pdf');
    })
  );
}

export function deactivate(): void {
  PreviewPanel.current?.dispose();
}
