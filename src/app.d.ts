// src/app.d.ts
import type { Session, User } from "better-auth"; // adjust to actual types from your setup

declare global {
  namespace App {
    interface Locals {
      session?: Session;
      user?: User;
    }
  }
}
