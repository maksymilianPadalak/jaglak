'use client';

import { useEffect, useRef, useState } from 'react';
import type { ServerMessage, ClientMessage } from '@jaglak/shared-types';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState('room1');
  const [status, setStatus] = useState('Not connected');
  const [joined, setJoined] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const mySocketIdRef = useRef<string | null>(null);

  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    connectWebSocket();
    getLocalStream();

    return () => {
      cleanup();
    };
  }, []);

  const connectWebSocket = () => {
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000';
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('Connecting to server...');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as ServerMessage;
      handleServerMessage(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStatus('Connection error');
    };

    ws.onclose = () => {
      setStatus('Disconnected from server');
      setIsConnected(false);
    };
  };

  const handleServerMessage = (data: ServerMessage) => {
    switch (data.type) {
      case 'connected':
        mySocketIdRef.current = data.socketId;
        setStatus('Connected to server');
        setIsConnected(true);
        break;

      case 'existing-users':
        data.users.forEach(userId => {
          createOffer(userId);
        });
        break;

      case 'user-joined':
        createOffer(data.userId);
        break;

      case 'offer':
        handleOffer(data);
        break;

      case 'answer':
        handleAnswer(data);
        break;

      case 'ice-candidate':
        handleIceCandidate(data);
        break;

      case 'user-left':
        const pc = peerConnectionsRef.current.get(data.userId);
        if (pc) {
          pc.close();
          peerConnectionsRef.current.delete(data.userId);
        }
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
        setStatus('Peer disconnected');
        break;

      case 'stream':
        console.log('Stream message:', data.text);
        break;

      case 'error':
        setStatus(`Error: ${data.message}`);
        break;
    }
  };

  const sendMessage = (message: ClientMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const getLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setStatus('Local stream acquired');
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setStatus('Error accessing camera/microphone');
    }
  };

  const createPeerConnection = (targetId: string) => {
    const pc = new RTCPeerConnection(configuration);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setStatus('Connected to peer');
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendMessage({
          type: 'ice-candidate',
          target: targetId,
          candidate: event.candidate
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`Connection state: ${pc.connectionState}`);
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        setStatus('Connection lost');
      }
    };

    return pc;
  };

  const createOffer = async (targetId: string) => {
    const pc = createPeerConnection(targetId);
    peerConnectionsRef.current.set(targetId, pc);

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      sendMessage({
        type: 'offer',
        target: targetId,
        offer: offer
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleOffer = async (data: { sender: string; offer: RTCSessionDescriptionInit }) => {
    const pc = createPeerConnection(data.sender);
    peerConnectionsRef.current.set(data.sender, pc);

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      sendMessage({
        type: 'answer',
        target: data.sender,
        answer: answer
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (data: { sender: string; answer: RTCSessionDescriptionInit }) => {
    const pc = peerConnectionsRef.current.get(data.sender);
    if (pc) {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    }
  };

  const handleIceCandidate = async (data: { sender: string; candidate: RTCIceCandidateInit }) => {
    const pc = peerConnectionsRef.current.get(data.sender);
    if (pc) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  };

  const cleanup = () => {
    peerConnectionsRef.current.forEach(pc => {
      pc.close();
    });
    peerConnectionsRef.current.clear();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      alert('Please enter a room ID');
      return;
    }

    setJoined(true);
    sendMessage({ type: 'join-room', roomId: roomId.trim() });
    setStatus(`Joined room: ${roomId}`);
  };

  const handleLeaveRoom = () => {
    sendMessage({ type: 'leave-room' });
    setJoined(false);
    cleanup();
    getLocalStream();
    setStatus('Left room');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-6xl w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          WebRTC Video Chat
        </h1>

        <div className="flex gap-4 mb-6 flex-wrap">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter room ID"
            disabled={joined}
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 min-w-[200px] disabled:bg-gray-100"
          />
          {!joined ? (
            <button
              onClick={handleJoinRoom}
              disabled={!isConnected}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              Join Room
            </button>
          ) : (
            <button
              onClick={handleLeaveRoom}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Leave Room
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
              You
            </div>
          </div>
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
              Remote
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg text-center ${
          status.includes('Connected') || status.includes('Connected to peer')
            ? 'bg-green-100 text-green-800'
            : status.includes('Error') || status.includes('Disconnected')
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {status}
        </div>
      </div>
    </main>
  );
}
