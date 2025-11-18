import { useState, useEffect, useRef, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Phone, MessageSquare, Mic, MicOff, PhoneOff, PhoneIncoming, Send, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Device, Call } from "@twilio/voice-sdk";
import MessageInboxModal from "@/components/MessageInboxModal";
import type { Contact } from "@shared/schema";

interface PhoneWidgetProps {
  selectedCompanyId: number | null;
}

export function PhoneWidget({ selectedCompanyId }: PhoneWidgetProps) {
  const [open, setOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [smsMessage, setSmsMessage] = useState("");
  const [device, setDevice] = useState<Device | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState<string>("");
  const [callDuration, setCallDuration] = useState(0);
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);
  const [incomingCallFrom, setIncomingCallFrom] = useState<string>("");
  const [showIncomingAlert, setShowIncomingAlert] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [inboxContact, setInboxContact] = useState<Contact | null>(null);
  const { toast } = useToast();
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts", selectedCompanyId?.toString()],
    queryFn: async () => {
      if (selectedCompanyId === null) return [];
      const response = await fetch(`/api/contacts?companyId=${selectedCompanyId}`);
      if (!response.ok) throw new Error("Failed to fetch contacts");
      return response.json();
    },
    enabled: selectedCompanyId !== null && open,
  });

  const filteredContacts = useMemo(() => {
    if (!contactSearchQuery.trim()) return contacts;
    const query = contactSearchQuery.toLowerCase();
    return contacts.filter(contact => 
      contact.name?.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query) ||
      contact.phone?.toLowerCase().includes(query)
    );
  }, [contacts, contactSearchQuery]);

  // Initialize Twilio Device on component mount (always active)
  useEffect(() => {
    setupDevice();
    return () => {
      if (device) {
        device.destroy();
      }
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);

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
        console.log("Twilio Device registered - ready for calls");
        setCallStatus("Ready");
      });

      twilioDevice.on("error", (error) => {
        console.error("Device error:", error);
      });

      twilioDevice.on("incoming", (call) => {
        console.log("🔔 INCOMING CALL RECEIVED!");
        console.log("From:", call.parameters.From);
        console.log("Call SID:", call.parameters.CallSid);
        console.log("All parameters:", call.parameters);
        
        call.on("cancel", () => {
          console.log("Incoming call cancelled by caller");
          setIncomingCall(null);
          setIncomingCallFrom("");
          setShowIncomingAlert(false);
        });

        call.on("disconnect", () => {
          console.log("Incoming call disconnected");
          setIncomingCall((prev) => {
            if (prev?.parameters.CallSid === call.parameters.CallSid) {
              setIncomingCallFrom("");
              setShowIncomingAlert(false);
              return null;
            }
            return prev;
          });
        });

        setIncomingCall(call);
        setIncomingCallFrom(call.parameters.From || "Unknown");
        setShowIncomingAlert(true);
      });

      twilioDevice.on("tokenWillExpire", async () => {
        console.log("Token will expire, refreshing...");
        try {
          const newToken = await refreshToken();
          twilioDevice.updateToken(newToken);
        } catch (error) {
          setCallStatus("Reconnecting...");
          setTimeout(() => setupDevice(), 1000);
        }
      });

      twilioDevice.on("tokenExpired", async () => {
        console.log("Token expired, reconnecting...");
        setCallStatus("Reconnecting...");
        setTimeout(() => setupDevice(), 1000);
      });

      await twilioDevice.register();
      setDevice(twilioDevice);
    } catch (error: any) {
      console.error("Setup error:", error);
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
      setShowIncomingAlert(false);
      setOpen(true); // Auto-open popover for active call
    }
  };

  const handleRejectIncomingCall = () => {
    if (incomingCall) {
      incomingCall.reject();
      setIncomingCall(null);
      setIncomingCallFrom("");
      setShowIncomingAlert(false);
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
      setCallStatus("Connected");
    });

    call.on("disconnect", () => {
      setCallStatus("Call ended");
      cleanupCall();
    });

    call.on("error", (error) => {
      console.error("Call error:", error);
      setCallStatus("Call failed");
      cleanupCall();
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
      setCallStatus("Device not ready");
      return;
    }

    if (!phoneNumber.trim()) {
      setCallStatus("Phone number required");
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
    } catch (error: any) {
      console.error("Call failed:", error);
      setCallStatus("Call failed");
      cleanupCall();
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
      setPhoneNumber("");
      setSmsMessage("");
    },
    onError: (error: Error) => {
      console.error("SMS failed:", error);
    },
  });

  const handleSendSMS = () => {
    if (!phoneNumber.trim()) {
      return;
    }
    if (!smsMessage.trim()) {
      return;
    }
    smsMutation.mutate({ to: phoneNumber, message: smsMessage });
  };

  return (
    <>
      {/* Incoming Call Alert - Fixed at top-left of screen */}
      {showIncomingAlert && (
        <div className="fixed top-4 left-4 z-50 animate-in slide-in-from-top-5">
          <Card className="p-4 shadow-lg border-2 border-green-600 bg-card w-80">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-600 p-2 rounded-full animate-pulse">
                <PhoneIncoming className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">Incoming Call</div>
                <div className="text-sm text-muted-foreground">{incomingCallFrom}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRejectIncomingCall}
                variant="outline"
                className="flex-1"
                data-testid="button-reject-call"
              >
                Decline
              </Button>
              <Button
                onClick={handleAcceptIncomingCall}
                className="flex-1 bg-green-600 hover:bg-green-700"
                data-testid="button-accept-call"
              >
                <Phone className="h-4 w-4 mr-2" />
                Accept
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Phone Widget - Popover Button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" data-testid="button-open-phone">
            <Phone className="w-4 h-4 mr-2" />
            Phone
            {callStatus && callStatus !== "Ready" && (
              <span className="ml-2 text-xs text-muted-foreground">({callStatus})</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96" align="end" data-testid="phone-widget-popover">
          <div className="space-y-4">
            {callStatus && (
              <div className="text-sm text-muted-foreground text-center">
                {callStatus}
              </div>
            )}
            
            {activeCall ? (
              <div className="space-y-4">
                {callDuration > 0 && (
                  <div className="text-center text-2xl font-mono">
                    {formatDuration(callDuration)}
                  </div>
                )}
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={handleMuteToggle}
                    variant={isMuted ? "destructive" : "outline"}
                    data-testid="button-mute"
                  >
                    {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={handleHangup}
                    variant="destructive"
                    data-testid="button-hangup"
                  >
                    <PhoneOff className="h-4 w-4 mr-2" />
                    Hang Up
                  </Button>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="contacts" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="contacts" data-testid="tab-contacts">
                    <User className="h-3 w-3 mr-2" />
                    Contacts
                  </TabsTrigger>
                  <TabsTrigger value="call" data-testid="tab-call">
                    <Phone className="h-3 w-3 mr-2" />
                    Call
                  </TabsTrigger>
                  <TabsTrigger value="sms" data-testid="tab-sms">
                    <MessageSquare className="h-3 w-3 mr-2" />
                    SMS
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="contacts" className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search contacts..."
                      value={contactSearchQuery}
                      onChange={(e) => setContactSearchQuery(e.target.value)}
                      className="pl-9"
                      data-testid="input-search-contacts-phone"
                    />
                  </div>
                  <ScrollArea className="h-64">
                    {filteredContacts.length === 0 ? (
                      <div className="text-center text-sm text-muted-foreground py-8">
                        {contactSearchQuery ? "No contacts found" : "No contacts available"}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {filteredContacts.map((contact) => (
                          <button
                            key={contact.id}
                            onClick={() => {
                              setInboxContact(contact);
                              setOpen(false);
                            }}
                            className="w-full text-left p-3 rounded-md hover-elevate active-elevate-2 transition-colors"
                            data-testid={`contact-item-${contact.id}`}
                          >
                            <div className="font-medium text-sm">{contact.name}</div>
                            {contact.phone && (
                              <div className="text-xs text-muted-foreground">{contact.phone}</div>
                            )}
                            {contact.email && (
                              <div className="text-xs text-muted-foreground">{contact.email}</div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="call" className="space-y-3">
                  <Input
                    placeholder="+1 (555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    data-testid="input-call-phone"
                  />
                  <Button
                    onClick={handleLiveCall}
                    disabled={!device || !!activeCall}
                    className="w-full bg-green-600 hover:bg-green-700"
                    data-testid="button-place-call"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {device ? "Call" : "Initializing..."}
                  </Button>
                </TabsContent>

                <TabsContent value="sms" className="space-y-3">
                  <Input
                    placeholder="+1 (555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    data-testid="input-sms-phone"
                  />
                  <Textarea
                    placeholder="Type your message..."
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    rows={3}
                    data-testid="input-sms-message"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {smsMessage.length} characters
                    </span>
                    <Button
                      onClick={handleSendSMS}
                      disabled={smsMutation.isPending}
                      size="sm"
                      data-testid="button-send-sms"
                    >
                      <Send className="h-3 w-3 mr-2" />
                      {smsMutation.isPending ? "Sending..." : "Send"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <MessageInboxModal
        contact={inboxContact}
        open={!!inboxContact}
        onOpenChange={(open) => {
          if (!open) setInboxContact(null);
        }}
        onCallContact={(phoneNumber) => {
          setPhoneNumber(phoneNumber);
          setOpen(true);
          // Auto-initiate call after a brief delay to ensure UI updates
          setTimeout(() => {
            handleLiveCall();
          }, 100);
        }}
      />
    </>
  );
}
