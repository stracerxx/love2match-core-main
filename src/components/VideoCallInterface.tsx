import React, { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'simple-peer';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useToast } from './ui/use-toast';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Phone, PhoneIncoming } from 'lucide-react';

interface VideoCallInterfaceProps {
  matchId: string;           // The match record ID (for channel naming)
  receiverId: string;        // The other user's ID
  receiverEmail: string;
  receiverName?: string;
  onCallEnd?: (duration: number, status: string) => void;
  initialCallType?: 'video' | 'audio';
}

interface SignalData {
  type: 'offer' | 'answer' | 'call-ended';
  signal?: Peer.SignalData;
  from: string;
  to: string;
  callId: string;
  callType?: 'video' | 'audio';
}

// ICE servers for NAT traversal - includes TURN servers for better connectivity
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  // Free TURN servers (for production, use your own TURN server)
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  }
];

export const VideoCallInterface: React.FC<VideoCallInterfaceProps> = ({
  matchId,
  receiverId,
  receiverEmail,
  receiverName,
  onCallEnd,
  initialCallType = 'video'
}) => {
  const [callStatus, setCallStatus] = useState<'idle' | 'ringing' | 'incoming' | 'connecting' | 'active' | 'ended'>('idle');
  const [callType, setCallType] = useState<'video' | 'audio'>(initialCallType);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [incomingCallData, setIncomingCallData] = useState<SignalData | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout>();
  const peerRef = useRef<Peer.Instance | null>(null);
  const callIdRef = useRef<string>('');
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Generate unique call ID
  const generateCallId = () => {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Duration timer
  useEffect(() => {
    if (callStatus === 'active') {
      durationIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [callStatus]);

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Handle incoming signal
  const handleSignal = useCallback((data: SignalData) => {
    console.log('Received signal:', data.type, 'from:', data.from, 'to:', data.to);

    // Ignore signals not meant for us
    if (data.to !== user?.id) {
      console.log('Signal not for us, ignoring');
      return;
    }

    // Ignore our own signals
    if (data.from === user?.id) {
      console.log('Signal from ourselves, ignoring');
      return;
    }

    switch (data.type) {
      case 'offer':
        // Incoming call
        if (callStatus === 'idle') {
          console.log('Incoming call from:', data.from);
          setIncomingCallData(data);
          setCallStatus('incoming');
          if (data.callType) {
            setCallType(data.callType);
          }
          toast({
            title: 'Incoming Call',
            description: `${receiverName || receiverEmail} is calling...`,
          });
        }
        break;

      case 'answer':
        // Call was answered
        if (peerRef.current && data.signal && data.callId === callIdRef.current) {
          console.log('Call answered, signaling peer');
          peerRef.current.signal(data.signal);
        }
        break;

      case 'call-ended':
        // Remote party ended the call
        if (data.callId === callIdRef.current || callStatus === 'incoming') {
          console.log('Remote party ended call');
          endCall('completed', false);
        }
        break;
    }
  }, [user?.id, callStatus, receiverName, receiverEmail, toast]);

  // Create a consistent channel name for both users
  // Sort the user IDs to ensure both users get the same channel name
  const getChannelName = useCallback(() => {
    if (!user?.id || !receiverId) return null;
    const sortedIds = [user.id, receiverId].sort();
    return `video_call_${sortedIds[0]}_${sortedIds[1]}`;
  }, [user?.id, receiverId]);

  // Set up signaling channel
  useEffect(() => {
    if (!user?.id || !receiverId) return;

    // Create a unique channel for this pair of users
    const channelName = getChannelName();
    if (!channelName) return;

    console.log('Subscribing to channel:', channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'broadcast',
        { event: 'signal' },
        (payload: { payload: SignalData }) => {
          handleSignal(payload.payload);
        }
      )
      .subscribe((status) => {
        console.log('Channel subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      console.log('Cleaning up channel');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      cleanupCall();
    };
  }, [receiverId, user?.id, handleSignal, getChannelName]);

  // Send signal through the channel
  const sendSignal = async (signalData: SignalData) => {
    if (!channelRef.current) {
      console.error('No channel available');
      return;
    }

    console.log('Sending signal:', signalData.type, 'to:', signalData.to);

    await channelRef.current.send({
      type: 'broadcast',
      event: 'signal',
      payload: signalData
    });
  };

  // Get user media
  const getUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      return stream;
    } catch (error) {
      console.error('Error getting user media:', error);
      throw error;
    }
  };

  // Create peer connection
  const createPeer = (initiator: boolean, stream: MediaStream): Peer.Instance => {
    console.log('Creating peer, initiator:', initiator);

    const peer = new Peer({
      initiator,
      trickle: true, // Enable trickle ICE for faster connection
      stream,
      config: {
        iceServers: ICE_SERVERS
      }
    });

    peer.on('signal', (signal) => {
      console.log('Peer signal generated');
      sendSignal({
        type: initiator ? 'offer' : 'answer',
        signal,
        from: user?.id || '',
        to: receiverId,
        callId: callIdRef.current,
        callType
      });
    });

    peer.on('stream', (remoteStream) => {
      console.log('Received remote stream');
      setRemoteStream(remoteStream);
      setCallStatus('active');
      toast({
        title: 'Call Connected',
        description: `Connected to ${receiverName || receiverEmail}`,
      });
    });

    peer.on('connect', () => {
      console.log('Peer connected');
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      toast({
        title: 'Connection Error',
        description: err.message || 'Failed to establish connection',
        variant: 'destructive'
      });
      endCall('failed', true);
    });

    peer.on('close', () => {
      console.log('Peer connection closed');
      if (callStatus === 'active') {
        endCall('completed', false);
      }
    });

    return peer;
  };

  // Start outgoing call
  const startCall = async () => {
    try {
      console.log('Starting call to:', receiverId);
      callIdRef.current = generateCallId();
      setCallStatus('ringing');

      const stream = await getUserMedia();
      setLocalStream(stream);

      const peer = createPeer(true, stream);
      peerRef.current = peer;

      // Set timeout for unanswered call
      setTimeout(() => {
        if (callStatus === 'ringing') {
          toast({
            title: 'No Answer',
            description: 'The call was not answered',
            variant: 'destructive'
          });
          endCall('missed', true);
        }
      }, 30000); // 30 second timeout

    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: 'Call Failed',
        description: 'Could not access camera/microphone. Please check permissions.',
        variant: 'destructive'
      });
      setCallStatus('idle');
    }
  };

  // Answer incoming call
  const answerCall = async () => {
    if (!incomingCallData || !incomingCallData.signal) {
      console.error('No incoming call data');
      return;
    }

    try {
      console.log('Answering call');
      callIdRef.current = incomingCallData.callId;
      setCallStatus('connecting');

      const stream = await getUserMedia();
      setLocalStream(stream);

      const peer = createPeer(false, stream);
      peer.signal(incomingCallData.signal);
      peerRef.current = peer;

      setIncomingCallData(null);

    } catch (error) {
      console.error('Error answering call:', error);
      toast({
        title: 'Call Failed',
        description: 'Could not access camera/microphone. Please check permissions.',
        variant: 'destructive'
      });
      declineCall();
    }
  };

  // Decline incoming call
  const declineCall = () => {
    if (incomingCallData) {
      sendSignal({
        type: 'call-ended',
        from: user?.id || '',
        to: receiverId,
        callId: incomingCallData.callId
      });
    }
    setIncomingCallData(null);
    setCallStatus('idle');
  };

  // Clean up call resources
  const cleanupCall = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }
  };

  // End call
  const endCall = (status: 'completed' | 'missed' | 'declined' | 'failed' = 'completed', notifyRemote: boolean = true) => {
    console.log('Ending call, status:', status);

    // Notify remote party
    if (notifyRemote && callIdRef.current) {
      sendSignal({
        type: 'call-ended',
        from: user?.id || '',
        to: receiverId,
        callId: callIdRef.current
      });
    }

    cleanupCall();
    setCallStatus('ended');
    setIncomingCallData(null);
    onCallEnd?.(callDuration, status);

    if (status === 'completed' && callDuration > 0) {
      toast({
        title: 'Call Ended',
        description: `Call duration: ${formatDuration(callDuration)}`,
      });
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = isVideoOff;
      });
    }
    setIsVideoOff(!isVideoOff);
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset call
  const resetCall = () => {
    setCallStatus('idle');
    setCallDuration(0);
    callIdRef.current = '';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Incoming Call Modal */}
      {callStatus === 'incoming' && (
        <Card className="mb-4 border-2 border-green-500 animate-pulse">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <PhoneIncoming className="h-6 w-6 text-green-500" />
              Incoming {callType === 'video' ? 'Video' : 'Audio'} Call
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{receiverName || receiverEmail} is calling...</p>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button
              onClick={answerCall}
              size="lg"
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <Phone className="h-5 w-5" />
              Answer
            </Button>
            <Button
              onClick={declineCall}
              variant="destructive"
              size="lg"
              className="gap-2"
            >
              <PhoneOff className="h-5 w-5" />
              Decline
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Call Status Card */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>
              {callType === 'video' ? 'Video' : 'Audio'} Call - {receiverName || receiverEmail}
            </span>
            {callStatus === 'active' && (
              <Badge variant="default" className="text-sm">
                {formatDuration(callDuration)}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <Badge variant={callStatus === 'active' ? 'default' : 'secondary'}>
              {callStatus === 'idle' && 'Ready to Call'}
              {callStatus === 'ringing' && 'Ringing...'}
              {callStatus === 'incoming' && 'Incoming Call'}
              {callStatus === 'connecting' && 'Connecting...'}
              {callStatus === 'active' && 'Active'}
              {callStatus === 'ended' && 'Ended'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Video/Audio Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Local Video */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">You</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
              {callType === 'video' && localStream ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover mirror"
                  style={{ transform: 'scaleX(-1)' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                  <div className="text-center">
                    <Mic className="h-16 w-16 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      {callType === 'audio' ? 'Audio Only' : 'Camera Off'}
                    </p>
                  </div>
                </div>
              )}
              {isVideoOff && callType === 'video' && (
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                  <VideoOff className="h-16 w-16 text-white" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Remote Video */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{receiverName || receiverEmail}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
              {callStatus === 'active' && remoteStream ? (
                callType === 'video' ? (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/20 to-secondary/5">
                    <div className="text-center">
                      <Mic className="h-16 w-16 mx-auto mb-2 text-secondary animate-pulse" />
                      <p className="text-sm text-muted-foreground">Audio Connected</p>
                    </div>
                  </div>
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/20">
                  <div className="text-center">
                    <Phone className={`h-16 w-16 mx-auto mb-2 text-muted-foreground ${callStatus === 'ringing' || callStatus === 'connecting' ? 'animate-pulse' : ''}`} />
                    <p className="text-sm text-muted-foreground">
                      {callStatus === 'ringing' && 'Ringing...'}
                      {callStatus === 'connecting' && 'Connecting...'}
                      {callStatus === 'idle' && 'Waiting to start'}
                      {callStatus === 'ended' && 'Call ended'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call Controls */}
      <Card>
        <CardFooter className="flex justify-center gap-4 p-6">
          {callStatus === 'idle' && (
            <Button
              onClick={startCall}
              size="lg"
              className="gap-2"
            >
              <Phone className="h-5 w-5" />
              Start Call
            </Button>
          )}

          {(callStatus === 'ringing' || callStatus === 'connecting' || callStatus === 'active') && (
            <>
              {callType === 'video' && (
                <Button
                  onClick={toggleVideo}
                  variant={isVideoOff ? 'destructive' : 'secondary'}
                  size="lg"
                  className="gap-2"
                >
                  {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                  {isVideoOff ? 'Turn On Video' : 'Turn Off Video'}
                </Button>
              )}

              <Button
                onClick={toggleMute}
                variant={isMuted ? 'destructive' : 'secondary'}
                size="lg"
                className="gap-2"
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>

              <Button
                onClick={() => endCall('completed', true)}
                variant="destructive"
                size="lg"
                className="gap-2"
              >
                <PhoneOff className="h-5 w-5" />
                End Call
              </Button>
            </>
          )}

          {callStatus === 'ended' && (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Call ended {callDuration > 0 ? `- Duration: ${formatDuration(callDuration)}` : ''}
              </p>
              <Button
                onClick={resetCall}
                variant="outline"
              >
                Start New Call
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Instructions */}
      {callStatus === 'idle' && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Before you start</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Make sure your browser has permission to access camera and microphone</li>
              <li>• Use a stable internet connection for best quality</li>
              <li>• Headphones are recommended to prevent echo</li>
              <li>• The other person needs to be on this page to receive your call</li>
              <li>• Calls will timeout after 30 seconds if not answered</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
