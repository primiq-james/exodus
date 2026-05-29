// src/types/react-syntax-highlighter.d.ts

declare module "react-syntax-highlighter" {
  import { ComponentType } from "react";
  export const Prism: ComponentType<any>;
}

declare module "react-syntax-highlighter/dist/esm/styles/prism" {
  export const dracula: any;
}
