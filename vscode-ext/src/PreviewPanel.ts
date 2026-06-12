import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getContentType, ContentType } from './fileUtils';

// ─── Types ────────────────────────────────────────────────────────────────────

type ExportFormat = 'svg' | 'png' | 'html' | 'pdf';

interface ExportMessage {
  type: 'export-svg' | 'export-png' | 'export-html' | 'export-pdf';
  data?: string;          // base64 or raw string
  suggestedName?: string;
}

// ─── PreviewPanel ─────────────────────────────────────────────────────────────

export class PreviewPanel {
  public static current: PreviewPanel | undefined;
  private static readonly viewType = 'openstudio.preview';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];
  private _currentContentType: ContentType = 'unknown';

  // ── Factory ─────────────────────────────────────────────────────────────────

  public static createOrShow(extensionUri: vscode.Uri): void {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // Toggle: if the panel is already visible, dispose it (toggle off)
    if (PreviewPanel.current) {
      PreviewPanel.current._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      PreviewPanel.viewType,
      'OpenStudio Preview',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'out', 'webview'),
          vscode.Uri.joinPath(extensionUri, 'media'),
        ],
        retainContextWhenHidden: true,
      }
    );

    PreviewPanel.current = new PreviewPanel(panel, extensionUri);
  }

  public static triggerExport(format: ExportFormat): void {
    if (!PreviewPanel.current) {
      vscode.window.showWarningMessage('OpenStudio: No preview panel is open.');
      return;
    }
    PreviewPanel.current._panel.webview.postMessage({ type: 'trigger-export', format });
  }

  // ── Constructor ─────────────────────────────────────────────────────────────

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    this._panel.webview.html = this._getHtmlForWebview();

    // Push initial content if an editor is already open
    this._pushActiveEditor();

    // Watch for active editor changes
    this._disposables.push(
      vscode.window.onDidChangeActiveTextEditor(() => this._pushActiveEditor())
    );

    // Watch for document content changes
    this._disposables.push(
      vscode.workspace.onDidChangeTextDocument(e => {
        const active = vscode.window.activeTextEditor;
        if (active && e.document === active.document) {
          this._pushDocument(active.document);
        }
      })
    );

    // Handle messages from webview
    this._panel.webview.onDidReceiveMessage(
      msg => this._handleMessage(msg),
      null,
      this._disposables
    );

    // Cleanup on panel close
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  // ── Push active file to webview ──────────────────────────────────────────────

  private _pushActiveEditor(): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { return; }
    this._pushDocument(editor.document);
  }

  private _pushDocument(doc: vscode.TextDocument): void {
    const filePath = doc.uri.fsPath;
    const contentType = getContentType(filePath);
    if (contentType === 'unknown') { return; }

    this._currentContentType = contentType;

    // Update VS Code context keys for menu visibility
    vscode.commands.executeCommand('setContext', 'openstudio.previewActive', true);
    vscode.commands.executeCommand('setContext', 'openstudio.contentType', contentType);

    this._panel.webview.postMessage({
      type: 'update',
      path: filePath,
      filename: path.basename(filePath),
      contentType,
      content: doc.getText(),
    });
  }

  // ── Message handler ──────────────────────────────────────────────────────────

  private async _handleMessage(msg: ExportMessage): Promise<void> {
    switch (msg.type) {
      case 'export-svg':
        await this._saveExport(msg, 'SVG files', ['svg'], msg.suggestedName ?? 'diagram.svg');
        break;
      case 'export-png':
        await this._saveExport(msg, 'PNG files', ['png'], msg.suggestedName ?? 'diagram.png', true);
        break;
      case 'export-html':
        await this._saveExport(msg, 'HTML files', ['html'], msg.suggestedName ?? 'preview.html');
        break;
      case 'export-pdf':
        // PDF: bounce back a print message to the webview
        this._panel.webview.postMessage({ type: 'print' });
        break;
    }
  }

  private async _saveExport(
    msg: ExportMessage,
    filterLabel: string,
    extensions: string[],
    defaultName: string,
    isBase64 = false
  ): Promise<void> {
    if (!msg.data) { return; }

    const saveUri = await vscode.window.showSaveDialog({
      defaultUri: vscode.Uri.file(defaultName),
      filters: { [filterLabel]: extensions },
    });

    if (!saveUri) { return; }

    let buffer: Uint8Array;
    if (isBase64) {
      // Strip data URL prefix if present
      const base64 = msg.data.replace(/^data:[^;]+;base64,/, '');
      buffer = Buffer.from(base64, 'base64');
    } else {
      buffer = Buffer.from(msg.data, 'utf-8');
    }

    await vscode.workspace.fs.writeFile(saveUri, buffer);
    vscode.window.showInformationMessage(`OpenStudio: Saved to ${saveUri.fsPath}`);
  }

  // ── HTML shell ───────────────────────────────────────────────────────────────

  private _getHtmlForWebview(): string {
    const webview = this._panel.webview;

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'main.js')
    );

    const cssUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'main.css')
    );

    const vendorBaseUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'vendor', 'plantuml')
    );

    const nonce = getNonce();

    return /* html */`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none';
             script-src 'nonce-${nonce}' ${webview.cspSource} 'unsafe-eval';
             style-src 'unsafe-inline' ${webview.cspSource} https://cdnjs.cloudflare.com https://fonts.googleapis.com https://unpkg.com;
             img-src ${webview.cspSource} data: blob:;
             font-src ${webview.cspSource} https://fonts.gstatic.com;
             connect-src 'none';">
  <title>OpenStudio Preview</title>
  <link rel="stylesheet" href="${cssUri}">
  <script nonce="${nonce}">
    window.__ASSETS__ = {
      vendorBase: '${vendorBaseUri}',
    };
  </script>
</head>
<body>
  <div id="os-root"></div>
  <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  // ── Dispose ──────────────────────────────────────────────────────────────────

  public dispose(): void {
    PreviewPanel.current = undefined;
    vscode.commands.executeCommand('setContext', 'openstudio.previewActive', false);
    this._panel.dispose();
    this._disposables.forEach(d => d.dispose());
    this._disposables = [];
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
