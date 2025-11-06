import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Phone, MessageSquare, Mic, MicOff, PhoneOff, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Device, Call } from "@twilio/voice-sdk";

interface TwilioPhoneModalProps {
  open: boolean;
  onClose: () => void;
}

export function TwilioPhoneModal({ open, onClose }: TwilioPhoneModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [smsMessage, setSmsMessage] = useState("");
  const [device, setDevice] = useState<Device | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState<string>("");
  const [callDuration, setCallDuration] = useState(0);
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);
  const [incomingCallFrom, setIncomingCallFrom] = useState<string>("");
  const { toast } = useToast();
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize Twilio Device when modal opens
  useEffect(() => {
    if (open && !device) {
      setupDevice();
    }
  }, [open]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (device) {
        device.destroy();
      }
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [device]);

  const refreshToken = async () => {
    try {
      const response = await fetch("/api/twilio/token");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to refresh token");
      }

      return data.token;
    } catch (error: any) {
      console.error("Token refresh error:", error);
      toast({
        title: "Token refresh failed",
        description: "Reconnecting phone system...",
        variant: "destructive",
      });
      throw error;
    }
  };

  const setupDevice = async () => {
    try {
      const response = await fetch("/api/twilio/token");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get access token");
      }

      const twilioDevice = new Device(data.token, {
        logLevel: 1,
        codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
      });

      twilioDevice.on("registered", () => {
        console.log("Twilio Device registered");
        setCallStatus("Ready to call");
      });

      twilioDevice.on("error", (error) => {
        console.error("Device error:", error);
        toast({
          title: "Device error",
          description: error.message,
          variant: "destructive",
        });
      });

      twilioDevice.on("incoming", (call) => {
        console.log("Incoming call from:", call.parameters.From);
        
        // Handle caller hanging up before user responds
        call.on("cancel", () => {
          console.log("Incoming call cancelled by caller");
          setIncomingCall(null);
          setIncomingCallFrom("");
          toast({
            title: "Call missed",
            description: `${call.parameters.From || "Unknown"} hung up`,
          });
        });

        call.on("disconnect", () => {
          console.log("Incoming call disconnected");
          if (incomingCall) {
            setIncomingCall(null);
            setIncomingCallFrom("");
          }
        });

        setIncomingCall(call);
        setIncomingCallFrom(call.parameters.From || "Unknown");
      });

      // Handle token refresh before expiration
      twilioDevice.on("tokenWillExpire", async () => {
        console.log("Token will expire, refreshing...");
        try {
          const newToken = await refreshToken();
          twilioDevice.updateToken(newToken);
          toast({
            title: "Token refreshed",
            description: "Phone connection maintained",
          });
        } catch (error) {
          // Token refresh failed, try to reconnect
          setCallStatus("Reconnecting...");
          setTimeout(() => setupDevice(), 1000);
        }
      });

      // Fallback: handle complete token expiration
      twilioDevice.on("tokenExpired", async () => {
        console.log("Token expired, reconnecting...");
        setCallStatus("Reconnecting...");
        setTimeout(() => setupDevice(), 1000);
      });

      await twilioDevice.register();
      setDevice(twilioDevice);

      toast({
        title: "Phone ready",
        description: "You can now make and receive calls",
      });
    } catch (error: any) {
      console.error("Setup error:", error);
      toast({
        title: "Setup failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAcceptIncomingCall = () => {
    if (incomingCall) {
      incomingCall.accept();
      setActiveCall(incomingCall);
      setupCallListeners(incomingCall);
      setCallStatus(`Connected to ${incomingCallFrom}`);
      startCallTimer();
      setIncomingCall(null);
      setIncomingCallFrom("");
    }
  };

  const handleRejectIncomingCall = () => {
    if (incomingCall) {
      incomingCall.reject();
      setIncomingCall(null);
      setIncomingCallFrom("");
      toast({
        title: "Call rejected",
        description: `Declined call from ${incomingCallFrom}`,
      });
    }
  };

  const cleanupCall = () => {
    setActiveCall(null);
    setCallDuration(0);
    setIsMuted(false);
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
  };

  const setupCallListeners = (call: Call) => {
    call.on("accept", () => {
      console.log("Call accepted");
      setCallStatus("Connected");
    });

    call.on("disconnect", () => {
      console.log("Call ended");
      setCallStatus("Call ended");
      cleanupCall();
      toast({
        title: "Call ended",
        description: "The call has been disconnected",
      });
    });

    call.on("error", (error) => {
      console.error("Call error:", error);
      setCallStatus("Call failed");
      cleanupCall();
      toast({
        title: "Call error",
        description: error.message,
        variant: "destructive",
      });
    });
  };

  const startCallTimer = () => {
    setCallDuration(0);
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }
    durationInterval.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const handleLiveCall = async () => {
    if (!device) {
      toast({
        title: "Device not ready",
        description: "Please wait for the phone to initialize",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter a phone number to call",
        variant: "destructive",
      });
      return;
    }

    try {
      setCallStatus("Calling...");
      const call = await device.connect({
        params: { To: phoneNumber }
      });

      setActiveCall(call);
      setupCallListeners(call);
      startCallTimer();

      toast({
        title: "Calling",
        description: `Calling ${phoneNumber}...`,
      });
    } catch (error: any) {
      console.error("Call failed:", error);
      setCallStatus("Call failed");
      cleanupCall();
      toast({
        title: "Call failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleHangup = () => {
    if (activeCall) {
      activeCall.disconnect();
    }
  };

  const handleMuteToggle = () => {
    if (activeCall) {
      activeCall.mute(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const smsMutation = useMutation({
    mutationFn: async ({ to, message }: { to: string; message: string }) => {
      const response = await apiRequest("POST", "/api/twilio/sms", { to, message });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "SMS sent",
        description: "Your message has been sent successfully.",
      });
      setPhoneNumber("");
      setSmsMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "SMS failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendSMS = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter a phone number.",
        variant: "destructive",
      });
      return;
    }
    if (!smsMessage.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message to send.",
        variant: "destructive",
      });
      return;
    }
    smsMutation.mutate({ to: phoneNumber, message: smsMessage });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md sm:top-[10%] sm:translate-y-0" data-testid="dialog-twilio-phone">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="bg-green-600 p-2 rounded-full">
                <Phone className="h-5 w-5 text-white" />
              </div>
              Twilio Phone System
            </DialogTitle>
            <DialogDescription>
              Make live calls or send SMS messages
            </DialogDescription>
          </DialogHeader>

          {callStatus && (
            <div className="px-4 py-2 bg-muted rounded-md text-sm">
              <div className="font-medium">{callStatus}</div>
              {activeCall && callDuration > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  Duration: {formatDuration(callDuration)}
                </div>
              )}
            </div>
          )}

          {activeCall && (
            <div className="flex gap-2 justify-center">
              <Button
                onClick={handleMuteToggle}
                variant={isMuted ? "destructive" : "outline"}
                size="lg"
                data-testid="button-mute"
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button
                onClick={handleHangup}
                variant="destructive"
                size="lg"
                data-testid="button-hangup"
              >
                <PhoneOff className="h-5 w-5 mr-2" />
                Hang Up
              </Button>
            </div>
          )}

          {!activeCall && (
            <Tabs defaultValue="call" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="call" data-testid="tab-call">
                  <Phone className="h-4 w-4 mr-2" />
                  Live Call
                </TabsTrigger>
                <TabsTrigger value="sms" data-testid="tab-sms">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  SMS
                </TabsTrigger>
              </TabsList>

              <TabsContent value="call" className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="call-phone" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <Input
                    id="call-phone"
                    placeholder="+1 (555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    data-testid="input-call-phone"
                    disabled={!!activeCall}
                  />
                  <p className="text-xs text-muted-foreground">
                    Include country code (e.g., +1 for US)
                  </p>
                </div>

                <Button
                  onClick={handleLiveCall}
                  disabled={!device || !!activeCall}
                  className="w-full bg-green-600 hover:bg-green-700"
                  data-testid="button-place-call"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {device ? "Call Now (Live Audio)" : "Initializing..."}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  🎧 Make sure your microphone and speakers are enabled
                </p>
              </TabsContent>

              <TabsContent value="sms" className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="sms-phone" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <Input
                    id="sms-phone"
                    placeholder="+1 (555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    data-testid="input-sms-phone"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="sms-message" className="text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="sms-message"
                    placeholder="Type your message here..."
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    rows={4}
                    data-testid="input-sms-message"
                  />
                  <p className="text-xs text-muted-foreground">
                    {smsMessage.length} characters
                  </p>
                </div>

                <Button
                  onClick={handleSendSMS}
                  disabled={smsMutation.isPending}
                  className="w-full"
                  data-testid="button-send-sms"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {smsMutation.isPending ? "Sending..." : "Send SMS"}
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Incoming Call Alert Dialog */}
      <AlertDialog open={!!incomingCall}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <PhoneIncoming className="h-5 w-5 text-green-600" />
              Incoming Call
            </AlertDialogTitle>
            <AlertDialogDescription>
              Incoming call from <strong>{incomingCallFrom}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleRejectIncomingCall} data-testid="button-reject-call">
              Decline
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAcceptIncomingCall} className="bg-green-600 hover:bg-green-700" data-testid="button-accept-call">
              <PhoneOutgoing className="h-4 w-4 mr-2" />
              Accept
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
