"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { login, type ActionState } from "../actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(login, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="apiKey">Admin API key</Label>
        <Input
          id="apiKey"
          name="apiKey"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.error)}
          aria-describedby={state.error ? "login-error" : undefined}
          className="h-11 bg-white"
        />
      </div>
      {state.error && (
        <p id="login-error" role="alert" className="text-[13px] text-alarm-ink">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="h-11 rounded-[10px] text-sm font-semibold">
        {pending ? "Checking…" : "Sign in"}
      </Button>
    </form>
  );
}
