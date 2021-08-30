export enum Sender {
  React,
  Content,
}

export interface ChromeMessage {
  from: Sender
  message: any
}

export interface Window {
  TurndownService: any
}
