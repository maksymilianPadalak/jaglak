import { WebSocket } from 'ws';

export interface Peer {
  ws: WebSocket;
  roomId: string | null;
}

// Client → Server Messages
export interface JoinRoomMessage {
  type: 'join-room';
  roomId: string;
}

export interface OfferMessage {
  type: 'offer';
  target: string;
  offer: RTCSessionDescriptionInit;
}

export interface AnswerMessage {
  type: 'answer';
  target: string;
  answer: RTCSessionDescriptionInit;
}

export interface IceCandidateMessage {
  type: 'ice-candidate';
  target: string;
  candidate: RTCIceCandidateInit;
}

export interface LeaveRoomMessage {
  type: 'leave-room';
}

export type ClientMessage = 
  | JoinRoomMessage 
  | OfferMessage 
  | AnswerMessage 
  | IceCandidateMessage 
  | LeaveRoomMessage;

// Server → Client Messages
export interface ConnectedMessage {
  type: 'connected';
  socketId: string;
}

export interface ExistingUsersMessage {
  type: 'existing-users';
  users: string[];
}

export interface UserJoinedMessage {
  type: 'user-joined';
  userId: string;
}

export interface UserLeftMessage {
  type: 'user-left';
  userId: string;
}

export interface ForwardedOfferMessage {
  type: 'offer';
  sender: string;
  offer: RTCSessionDescriptionInit;
}

export interface ForwardedAnswerMessage {
  type: 'answer';
  sender: string;
  answer: RTCSessionDescriptionInit;
}

export interface ForwardedIceCandidateMessage {
  type: 'ice-candidate';
  sender: string;
  candidate: RTCIceCandidateInit;
}

export interface ErrorMessage {
  type: 'error';
  message: string;
}

export interface StreamMessage {
  type: 'stream';
  text: string;
}

export type ServerMessage = 
  | ConnectedMessage
  | ExistingUsersMessage
  | UserJoinedMessage
  | UserLeftMessage
  | ForwardedOfferMessage
  | ForwardedAnswerMessage
  | ForwardedIceCandidateMessage
  | ErrorMessage
  | StreamMessage;

