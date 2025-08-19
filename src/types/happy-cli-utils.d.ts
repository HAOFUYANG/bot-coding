declare module "@happy.cli/utils" {
  export function getLatestVersion(npmName: string): Promise<string>;
  // 根据实际使用情况添加其他导出类型
}
