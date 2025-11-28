import React, { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useToast } from './ui/use-toast';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Phone } from 'lucide-react';

interface VideoCallInterfaceProps {
  matchId: string;
  receiverEmail: string;
  receiverName?: string;
  onCallEnd?: (duration: number, status: string) => void;
  initialCallType?: 'video' | 'audio';
}

interface SignalData {
  type: 'offer' | 'answer';
  signal: Peer.SignalData;
  from: string;
  to: string;
  callId: string;
}

export const VideoCallInterface: React.FC<VideoCallInterfaceProps> = ({
  matchId,
  receiverEmail,
  receiverName,
  onCallEnd,
  initialCallType = 'video'
}) => {
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active' | 'ended'>('idle');
  const [callType, setCallType] = useState<'video' | 'audio'>(initialCallType);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isInitiator, setIsInitiator] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout>();
  const peerRef = useRef<Peer.Instance | null>(null);
  const callIdRef = useRef<string>(`call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const { user } = useAuth();
  const { toast } = useToast();

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

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    const channel = supabase
      .channel(`video_call_${matchId}`)
      .on(
        'broadcast',
        { event: 'signal' },
        (payload: { payload: SignalData }) => {
          const data = payload.payload;
          if (data.to === user?.id && data.callId === callIdRef.current) {
            if (data.type === 'offer' && !peerRef.current) {
              answerCall(data.signal);
            } else if (data.type === 'answer' && peerRef.current) {
              peerRef.current.signal(data.signal);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [matchId, user?.id]);

  const startCall = async () => {
    try {
      setCallStatus('connecting');
      setIsInitiator(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video' ? { width: 1280, height: 720 } : false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      setLocalStream(stream);

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
          ]
        }
      });

      peer.on('signal', (signal) => {
        supabase.channel(`video_call_${matchId}`).send({
          type: 'broadcast',
          event: 'signal',
          payload: {
            type: 'offer',
            signal,
            from: user?.id,
            to: matchId,
            callId: callIdRef.current
          } as SignalData
        });
      });

      peer.on('stream', (remoteStream) => {
        setRemoteStream(remoteStream);
        setCallStatus('active');
        toast({
          title: 'Call Connected',
          description: `Connected to ${receiverName || receiverEmail}`,
        });
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        toast({
          title: 'Connection Error',
          description: 'Failed to establish connection',
          variant: 'destructive'
        });
        endCall('failed');
      });

      peer.on('close', () => {
        endCall('completed');
      });

      peerRef.current = peer;

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

  const answerCall = async (incomingSignal: Peer.SignalData) => {
    try {
      setCallStatus('connecting');
      setIsInitiator(false);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video' ? { width: 1280, height: 720 } : false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      setLocalStream(stream);

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
          ]
        }
      });

      peer.on('signal', (signal) => {
        supabase.channel(`video_call_${matchId}`).send({
          type: 'broadcast',
          event: 'signal',
          payload: {
            type: 'answer',
            signal,
            from: user?.id,
            to: matchId,
            callId: callIdRef.current
          } as SignalData
        });
      });

      peer.on('stream', (remoteStream) => {
        setRemoteStream(remoteStream);
        setCallStatus('active');
        toast({
          title: 'Call Connected',
          description: `Connected to ${receiverName || receiverEmail}`,
        });
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        toast({
          title: 'Connection Error',
          description: 'Failed to establish connection',
          variant: 'destructive'
        });
        endCall('failed');
      });

      peer.on('close', () => {
        endCall('completed');
      });

      peer.signal(incomingSignal);
      peerRef.current = peer;

    } catch (error) {
      console.error('Error answering call:', error);
      toast({
        title: 'Call Failed',
        description: 'Could not access camera/microphone. Please check permissions.',
        variant: 'destructive'
      });
      setCallStatus('idle');
    }
  };

  const endCall = (status: 'completed' | 'missed' | 'declined' | 'failed' = 'completed') => {
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

    setCallStatus('ended');
    onCallEnd?.(callDuration, status);

    toast({
      title: 'Call Ended',
      description: `Call duration: ${formatDuration(callDuration)}`,
    });
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = isVideoOff;
      });
    }
    setIsVideoOff(!isVideoOff);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
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
              {callStatus === 'connecting' && 'Connecting...'}
              {callStatus === 'active' && 'Active'}
              {callStatus === 'ended' && 'Ended'}
            </Badge>
            <span className="text-muted-foreground">
              Match ID: {matchId}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">You</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
              {callType === 'video' ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                  <div className="text-center">
                    <Mic className="h-16 w-16 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Audio Only</p>
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
                      <Mic className="h-16 w-16 mx-auto mb-2 text-secondary" />
                      <p className="text-sm text-muted-foreground">Audio Only</p>
                    </div>
                  </div>
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/20">
                  <div className="text-center">
                    <Phone className="h-16 w-16 mx-auto mb-2 text-muted-foreground animate-pulse" />
                    <p className="text-sm text-muted-foreground">
                      {callStatus === 'connecting' ? 'Connecting...' : 'Waiting for connection'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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

          {(callStatus === 'connecting' || callStatus === 'active') && (
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
                onClick={() => endCall('completed')}
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
                Call ended - Duration: {formatDuration(callDuration)}
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Start New Call
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

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
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};