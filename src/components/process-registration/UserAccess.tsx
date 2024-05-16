"use client";
import React, { useRef } from "react";

export default function UserAccess() {
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const positionInputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);
  const usernameInputRef = useRef<HTMLInputElement | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  const reenterpasswordInputRef = useRef<HTMLInputElement | null>(null);
  const statusInputRef = useRef<HTMLInputElement | null>(null);
  const roleInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input type="text" ref={nameInputRef} />
      </label>
      <label>
        Position in Company:
        <input type="text" ref={positionInputRef} />
      </label>
      <label>
        Email:
        <input type="email" ref={emailInputRef} />
      </label>
      <label>
        Mobile:
        <input type="number" ref={mobileInputRef} />
      </label>

      <label>
        Username:
        <input type="text" ref={usernameInputRef} />
      </label>

      <label>
        Password:
        <input type="number" ref={passwordInputRef} />
      </label>

      <label>
        Re-enter Password:
        <input type="number" ref={reenterpasswordInputRef} />
      </label>

      <label>
        Status:
        <input type="radio" ref={statusInputRef} />
      </label>

      <button type="submit">Submit</button>
    </form>
  );
}
