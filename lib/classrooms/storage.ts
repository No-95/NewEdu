'use client';

export interface ClassroomRoom {
  roomID: string;
  title: string;
  hostName: string;
  startedAt: number;
  lastActiveAt: number;
  status: 'live' | 'ended';
}

const STORAGE_KEY = 'hdpedu-classrooms';
const LIVE_TIMEOUT_MS = 60 * 60 * 1000;

function hasWindow() {
  return typeof window !== 'undefined';
}

function parseRooms(raw: string | null): ClassroomRoom[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ClassroomRoom[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function loadRooms(): ClassroomRoom[] {
  if (!hasWindow()) return [];
  return parseRooms(window.localStorage.getItem(STORAGE_KEY));
}

export function saveRooms(rooms: ClassroomRoom[]) {
  if (!hasWindow()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
}

export function getLiveRooms(now = Date.now()): ClassroomRoom[] {
  return loadRooms()
    .filter((room) => room.status === 'live' && now - room.lastActiveAt <= LIVE_TIMEOUT_MS)
    .sort((a, b) => b.lastActiveAt - a.lastActiveAt);
}

export function upsertRoom(room: ClassroomRoom) {
  const rooms = loadRooms();
  const existingIndex = rooms.findIndex((item) => item.roomID === room.roomID);

  if (existingIndex >= 0) {
    rooms[existingIndex] = room;
  } else {
    rooms.unshift(room);
  }

  saveRooms(rooms.slice(0, 30));
}

export function touchRoom(roomID: string) {
  const rooms = loadRooms();
  const existing = rooms.find((item) => item.roomID === roomID);
  if (!existing) return;

  existing.lastActiveAt = Date.now();
  existing.status = 'live';
  saveRooms(rooms);
}

export function endRoom(roomID: string) {
  const rooms = loadRooms();
  const existing = rooms.find((item) => item.roomID === roomID);
  if (!existing) return;

  existing.status = 'ended';
  existing.lastActiveAt = Date.now();
  saveRooms(rooms);
}
