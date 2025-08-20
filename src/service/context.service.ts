import * as vscode from "vscode";
export class ContextService {
  static _context: vscode.ExtensionContext;

  static register(context: vscode.ExtensionContext) {
    ContextService._context = context;
  }

  static getContext(): vscode.ExtensionContext {
    if (!ContextService._context) {
      throw new Error("ContextService未注册");
    }
    return ContextService._context;
  }
  static getState<T>(key: string): T | undefined {
    return ContextService._context.globalState.get<T>(key);
  }

  static async setState(key: string, value: any) {
    return ContextService._context.globalState.update(key, value);
  }
}
