"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode2 = __toESM(require("vscode"));

// src/PreviewPanel.ts
var vscode = __toESM(require("vscode"));
var path = __toESM(require("path"));

// src/fileUtils.ts
function getContentType(filePath) {
  const ext = getExt(filePath);
  switch (ext) {
    case ".md":
    case ".markdown":
      return "markdown";
    case ".puml":
    case ".plantuml":
    case ".pu":
      return "plantuml";
    case ".mmd":
    case ".mermaid":
      return "mermaid";
    case ".yaml":
    case ".yml":
    case ".json":
      return "swagger";
    default:
      return "unknown";
  }
}
function getExt(filePath) {
  const i = filePath.lastIndexOf(".");
  return i >= 0 ? filePath.slice(i).toLowerCase() : "";
}

// src/PreviewPanel.ts
var PreviewPanel = class _PreviewPanel {
  // ── Constructor ─────────────────────────────────────────────────────────────
  constructor(panel, extensionUri) {
    this._disposables = [];
    this._currentContentType = "unknown";
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._panel.webview.html = this._getHtmlForWebview();
    this._pushActiveEditor();
    this._disposables.push(
      vscode.window.onDidChangeActiveTextEditor(() => this._pushActiveEditor())
    );
    this._disposables.push(
      vscode.workspace.onDidChangeTextDocument((e) => {
        const active = vscode.window.activeTextEditor;
        if (active && e.document === active.document) {
          this._pushDocument(active.document);
        }
      })
    );
    this._panel.webview.onDidReceiveMessage(
      (msg) => this._handleMessage(msg),
      null,
      this._disposables
    );
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }
  static {
    this.viewType = "openstudio.preview";
  }
  // ── Factory ─────────────────────────────────────────────────────────────────
  static createOrShow(extensionUri) {
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : void 0;
    if (_PreviewPanel.current) {
      _PreviewPanel.current._panel.reveal(column);
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      _PreviewPanel.viewType,
      "OpenStudio Preview",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, "out", "webview"),
          vscode.Uri.joinPath(extensionUri, "media")
        ],
        retainContextWhenHidden: true
      }
    );
    _PreviewPanel.current = new _PreviewPanel(panel, extensionUri);
  }
  static triggerExport(format) {
    if (!_PreviewPanel.current) {
      vscode.window.showWarningMessage("OpenStudio: No preview panel is open.");
      return;
    }
    _PreviewPanel.current._panel.webview.postMessage({ type: "trigger-export", format });
  }
  // ── Push active file to webview ──────────────────────────────────────────────
  _pushActiveEditor() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    this._pushDocument(editor.document);
  }
  _pushDocument(doc) {
    const filePath = doc.uri.fsPath;
    const contentType = getContentType(filePath);
    if (contentType === "unknown") {
      return;
    }
    this._currentContentType = contentType;
    vscode.commands.executeCommand("setContext", "openstudio.previewActive", true);
    vscode.commands.executeCommand("setContext", "openstudio.contentType", contentType);
    this._panel.webview.postMessage({
      type: "update",
      path: filePath,
      filename: path.basename(filePath),
      contentType,
      content: doc.getText()
    });
  }
  // ── Message handler ──────────────────────────────────────────────────────────
  async _handleMessage(msg) {
    switch (msg.type) {
      case "export-svg":
        await this._saveExport(msg, "SVG files", ["svg"], msg.suggestedName ?? "diagram.svg");
        break;
      case "export-png":
        await this._saveExport(msg, "PNG files", ["png"], msg.suggestedName ?? "diagram.png", true);
        break;
      case "export-html":
        await this._saveExport(msg, "HTML files", ["html"], msg.suggestedName ?? "preview.html");
        break;
      case "export-pdf":
        this._panel.webview.postMessage({ type: "print" });
        break;
    }
  }
  async _saveExport(msg, filterLabel, extensions, defaultName, isBase64 = false) {
    if (!msg.data) {
      return;
    }
    const saveUri = await vscode.window.showSaveDialog({
      defaultUri: vscode.Uri.file(defaultName),
      filters: { [filterLabel]: extensions }
    });
    if (!saveUri) {
      return;
    }
    let buffer;
    if (isBase64) {
      const base64 = msg.data.replace(/^data:[^;]+;base64,/, "");
      buffer = Buffer.from(base64, "base64");
    } else {
      buffer = Buffer.from(msg.data, "utf-8");
    }
    await vscode.workspace.fs.writeFile(saveUri, buffer);
    vscode.window.showInformationMessage(`OpenStudio: Saved to ${saveUri.fsPath}`);
  }
  // ── HTML shell ───────────────────────────────────────────────────────────────
  _getHtmlForWebview() {
    const webview = this._panel.webview;
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "webview", "main.js")
    );
    const cssUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "webview", "main.css")
    );
    const vendorBaseUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vendor", "plantuml")
    );
    const nonce = getNonce();
    return (
      /* html */
      `<!DOCTYPE html>
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
</html>`
    );
  }
  // ── Dispose ──────────────────────────────────────────────────────────────────
  dispose() {
    _PreviewPanel.current = void 0;
    vscode.commands.executeCommand("setContext", "openstudio.previewActive", false);
    this._panel.dispose();
    this._disposables.forEach((d) => d.dispose());
    this._disposables = [];
  }
};
function getNonce() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// src/extension.ts
function activate(context) {
  const { extensionUri } = context;
  context.subscriptions.push(
    vscode2.commands.registerCommand("openstudio.openPreview", () => {
      PreviewPanel.createOrShow(extensionUri);
    })
  );
  context.subscriptions.push(
    vscode2.commands.registerCommand("openstudio.exportSVG", () => {
      PreviewPanel.triggerExport("svg");
    })
  );
  context.subscriptions.push(
    vscode2.commands.registerCommand("openstudio.exportPNG", () => {
      PreviewPanel.triggerExport("png");
    })
  );
  context.subscriptions.push(
    vscode2.commands.registerCommand("openstudio.exportHTML", () => {
      PreviewPanel.triggerExport("html");
    })
  );
  context.subscriptions.push(
    vscode2.commands.registerCommand("openstudio.exportPDF", () => {
      PreviewPanel.triggerExport("pdf");
    })
  );
}
function deactivate() {
  PreviewPanel.current?.dispose();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
