'use client';

import { useEffect, useRef, useState } from 'react';
import type { ServerMessage, ClientMessage } from '@jaglak/shared-types';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState('room1');
  const [status, setStatus] = useState('Not connected');
  const [joined, setJoined] = useState(false);
  const [streamMessages, setStreamMessages] = useState<string[]>([]);
  const [connectionStats, setConnectionStats] = useState<{
    connectionState: string;
    iceConnectionState: string;
    iceGatheringState: string;
    signalingState: string;
    localCandidate?: string;
    remoteCandidate?: string;
  } | null>(null);
  const [showStats, setShowStats] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const mySocketIdRef = useRef<string | null>(null);
  const autoJoinedRef = useRef<boolean>(false);

  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  const updateConnectionStats = async () => {
    const pcs = Array.from(peerConnectionsRef.current.values());
    if (pcs.length === 0) {
      setConnectionStats(null);
      return;
    }

    const pc = pcs[0]; // Get first peer connection
    const stats: any = {
      connectionState: pc.connectionState,
      iceConnectionState: pc.iceConnectionState,
      iceGatheringState: pc.iceGatheringState,
      signalingState: pc.signalingState,
    };

    try {
      const statsReport = await pc.getStats();
      statsReport.forEach((report) => {
        if (report.type === 'local-candidate' && report.candidateType) {
          stats.localCandidate = `${report.candidateType} (${report.protocol})`;
        }
        if (report.type === 'remote-candidate' && report.candidateType) {
          stats.remoteCandidate = `${report.candidateType} (${report.protocol})`;
        }
      });
    } catch (error) {
      console.error('Error getting stats:', error);
    }

    setConnectionStats(stats);
  };

  useEffect(() => {
    connectWebSocket();
    getLocalStream();

    // Poll connection stats
    const statsInterval = setInterval(() => {
      updateConnectionStats();
    }, 1000);

    return () => {
      cleanup();
      clearInterval(statsInterval);
    };
  }, []);

  const connectWebSocket = () => {
    // Hardcoded for testing
    const WS_URL = 'ws://localhost:3000';
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
        // Auto-join room for testing
        if (!autoJoinedRef.current && roomId) {
          autoJoinedRef.current = true;
          sendMessage({ type: 'join-room', roomId: roomId });
          setJoined(true);
          setStatus(`Auto-joined room: ${roomId}`);
        }
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
        setStreamMessages(prev => [...prev.slice(-4), data.text]); // Keep last 5 messages
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
      updateConnectionStats();
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        setStatus('Connection lost');
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state: ${pc.iceConnectionState}`);
      updateConnectionStats();
    };

    pc.onicegatheringstatechange = () => {
      console.log(`ICE gathering state: ${pc.iceGatheringState}`);
      updateConnectionStats();
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
    autoJoinedRef.current = false;
    cleanup();
    getLocalStream();
    setStatus('Left room');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-6xl w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            WebRTC Video Chat
          </h1>
          <div className="flex gap-2 items-center">
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
              TEST MODE
            </div>
            <button
              onClick={() => setShowStats(!showStats)}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold hover:bg-blue-200 transition"
            >
              {showStats ? 'Hide' : 'Show'} Stats
            </button>
            <a
              href="https://test.webrtc.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold hover:bg-green-200 transition"
            >
              WebRTC Test
            </a>
          </div>
        </div>

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

        <div className={`p-4 rounded-lg text-center mb-4 ${
          status.includes('Connected') || status.includes('Connected to peer')
            ? 'bg-green-100 text-green-800'
            : status.includes('Error') || status.includes('Disconnected')
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {status}
        </div>

        {showStats && connectionStats && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="text-sm font-semibold text-gray-800 mb-3">WebRTC Connection Stats:</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-semibold text-gray-600">Connection State:</span>
                <span className={`ml-2 font-mono ${
                  connectionStats.connectionState === 'connected' ? 'text-green-600' :
                  connectionStats.connectionState === 'failed' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {connectionStats.connectionState}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-600">ICE Connection:</span>
                <span className={`ml-2 font-mono ${
                  connectionStats.iceConnectionState === 'connected' ? 'text-green-600' :
                  connectionStats.iceConnectionState === 'failed' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {connectionStats.iceConnectionState}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-600">ICE Gathering:</span>
                <span className="ml-2 font-mono text-gray-700">{connectionStats.iceGatheringState}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Signaling State:</span>
                <span className="ml-2 font-mono text-gray-700">{connectionStats.signalingState}</span>
              </div>
              {connectionStats.localCandidate && (
                <div className="col-span-2">
                  <span className="font-semibold text-gray-600">Local Candidate:</span>
                  <span className="ml-2 font-mono text-gray-700">{connectionStats.localCandidate}</span>
                </div>
              )}
              {connectionStats.remoteCandidate && (
                <div className="col-span-2">
                  <span className="font-semibold text-gray-600">Remote Candidate:</span>
                  <span className="ml-2 font-mono text-gray-700">{connectionStats.remoteCandidate}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {streamMessages.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm font-semibold text-blue-800 mb-2">Stream Messages (Last 5):</div>
            <div className="space-y-1">
              {streamMessages.map((msg, idx) => (
                <div key={idx} className="text-sm text-blue-700 font-mono">
                  {msg}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
