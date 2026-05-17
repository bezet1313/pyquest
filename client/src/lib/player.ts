// Simple in-memory player session (no localStorage)
let currentPlayerId: number | null = null;

export function setPlayerId(id: number) {
  currentPlayerId = id;
}

export function getPlayerId(): number | null {
  return currentPlayerId;
}

export function clearPlayer() {
  currentPlayerId = null;
}
