function delay(ms: number | string) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { delay };
