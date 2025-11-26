import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useToast } from './ui/use-toast';
import { useAuth } from '../hooks/useAuth';

interface VideoCallInterfaceProps {
  matchId: string;
  receiverEmail: string;
  receiverName?: string;
  onCallEnd?: (duration: number, status: string) => void;
  initialCallType?: 'video' | 'audio';
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
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout>();
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

  const startCall = async () => {
    try {
      setCallStatus('connecting');
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video',
        audio: true
      });
      
      setLocalStream(stream);
      
      // Mock connection establishment
      setTimeout(() => {
        setCallStatus('active');
        toast({
          title: 'Call Connected',
          description: `Connected to ${receiverName || receiverEmail}`,
        });
        
        // Mock remote stream (in real app, this would come from WebRTC)
        setTimeout(() => {
          // Simulate remote stream
          setRemoteStream(stream.clone());
        }, 1000);
      }, 2000);

    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: 'Call Failed',
        description: 'Could not access camera/microphone',
        variant: 'destructive'
      });
      setCallStatus('idle');
    }
  };

  const endCall = (status: 'completed' | 'missed' | 'declined' | 'failed' = 'completed') => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
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

  const switchCallType = (newType: 'video' | 'audio') => {
    if (callStatus === 'active') {
      toast({
        title: 'Cannot Switch',
        description: 'Please end the current call to switch type',
      });
      return;
    }
    setCallType(newType);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Call Status Header */}
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

      {/* Video/Audio Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Local Video */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">You</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="aspect-video bg-black rounded-lg relative">
              {callType === 'video' ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
                  <div className="text-center">
                    <div className="text-6xl mb-2">🎤</div>
                    <p className="text-muted-foreground">Audio Only</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
              )}
              
              {/* Status Overlays */}
              {isVideoOff && callType === 'video' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-2xl mb-1">📷</div>
                    <p className="text-sm">Video Off</p>
                  </div>
                </div>
              )}
              
              {isMuted && (
                <div className="absolute top-2 right-2 bg-black/70 rounded-full p-1">
                  <div className="text-white text-xs">🔇</div>
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
            <div className="aspect-video bg-black rounded-lg relative">
              {callStatus === 'active' && callType === 'video' ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
                  <div className="text-center">
                    {callStatus === 'connecting' && (
                      <>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-muted-foreground">Connecting...</p>
                      </>
                    )}
                    {callStatus === 'idle' && (
                      <>
                        <div className="text-6xl mb-2">👤</div>
                        <p className="text-muted-foreground">Waiting to connect</p>
                      </>
                    )}
                    {callStatus === 'ended' && (
                      <>
                        <div className="text-6xl mb-2">📞</div>
                        <p className="text-muted-foreground">Call Ended</p>
                      </>
                    )}
                    {callStatus === 'active' && callType === 'audio' && (
                      <>
                        <div className="text-6xl mb-2">🎧</div>
                        <p className="text-muted-foreground">Audio Call</p>
                        <p className="text-sm text-muted-foreground">{receiverName || receiverEmail}</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Call Type Selection (only when idle) */}
            {callStatus === 'idle' && (
              <div className="flex gap-2">
                <Button
                  variant={callType === 'video' ? 'default' : 'outline'}
                  onClick={() => switchCallType('video')}
                  size="sm"
                >
                  📹 Video Call
                </Button>
                <Button
                  variant={callType === 'audio' ? 'default' : 'outline'}
                  onClick={() => switchCallType('audio')}
                  size="sm"
                >
                  🎤 Audio Call
                </Button>
              </div>
            )}

            {/* Main Call Controls */}
            <div className="flex gap-2">
              {callStatus === 'idle' && (
                <Button onClick={startCall} className="bg-green-600 hover:bg-green-700">
                  📞 Start Call
                </Button>
              )}

              {callStatus === 'connecting' && (
                <Button variant="outline" onClick={() => endCall('failed')}>
                  ❌ Cancel
                </Button>
              )}

              {callStatus === 'active' && (
                <>
                  <Button
                    variant={isMuted ? 'destructive' : 'outline'}
                    onClick={toggleMute}
                    size="sm"
                  >
                    {isMuted ? '🔇' : '🎤'}
                  </Button>
                  
                  {callType === 'video' && (
                    <Button
                      variant={isVideoOff ? 'destructive' : 'outline'}
                      onClick={toggleVideo}
                      size="sm"
                    >
                      {isVideoOff ? '📷 Off' : '📷 On'}
                    </Button>
                  )}
                  
                  <Button
                    variant="destructive"
                    onClick={() => endCall('completed')}
                  >
                    📞 End Call
                  </Button>
                </>
              )}

              {callStatus === 'ended' && (
                <Button onClick={() => setCallStatus('idle')}>
                  🔄 New Call
                </Button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                💬 Message
              </Button>
              <Button variant="outline" size="sm">
                🎁 Send Gift
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call Quality Indicators */}
      {callStatus === 'active' && (
        <Card className="mt-4">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between text-sm">
              <span>Connection Quality:</span>
              <Badge variant="default">Excellent</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};