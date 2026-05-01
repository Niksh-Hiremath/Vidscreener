// Type declarations for ?raw imports (Vite/esbuild)
declare module "*.md?raw" {
  const content: string;
  export default content;
}