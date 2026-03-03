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
  pendingCallNumber?: string | null;
  onCallNumberHandled?: () => void;
  externalInboxContact?: Contact | null;
  onExternalInboxContactHandled?: () => void;
}

export function PhoneWidget({ selectedCompanyId, pendingCallNumber, onCallNumberHandled, externalInboxContact, onExternalInboxContactHandled }: PhoneWidgetProps) {
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

  // Handle pending call requests from other components
  useEffect(() => {
    if (pendingCallNumber && device) {
      setOpen(true);
      // Initiate call directly with the pending number
      handleLiveCall(pendingCallNumber);
      // Clear the pending call
      if (onCallNumberHandled) {
        onCallNumberHandled();
      }
    }
  }, [pendingCallNumber, device]);

  // Handle external inbox contact requests
  useEffect(() => {
    if (externalInboxContact) {
      setInboxContact(externalInboxContact);
      // Clear the external request
      if (onExternalInboxContactHandled) {
        onExternalInboxContactHandled();
      }
    }
  }, [externalInboxContact]);

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
        setCallStatus(`Error: ${error.message || error.code || "Unknown error"}`);
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

  const handleLiveCall = async (numberToCall?: string, skipInboxOpen?: boolean) => {
    if (!device) {
      setCallStatus("Device not ready");
      return;
    }

    let targetNumber = numberToCall || phoneNumber;
    if (!targetNumber.trim()) {
      setCallStatus("Phone number required");
      return;
    }

    // Normalize to E.164 format — Twilio requires +1XXXXXXXXXX for US numbers
    targetNumber = targetNumber.replace(/[\s\-\(\)]/g, "");
    if (!targetNumber.startsWith("+")) {
      // 10-digit US number → add +1, 11-digit starting with 1 → add +, otherwise add +
      if (targetNumber.length === 10) {
        targetNumber = "+1" + targetNumber;
      } else if (targetNumber.length === 11 && targetNumber.startsWith("1")) {
        targetNumber = "+" + targetNumber;
      } else {
        targetNumber = "+" + targetNumber;
      }
    }

    try {
      setCallStatus("Calling...");
      const call = await device.connect({
        params: { To: targetNumber }
      });

      setActiveCall(call);
      setupCallListeners(call);
      startCallTimer();

      // Update phoneNumber state if we used a different number
      if (numberToCall && numberToCall !== phoneNumber) {
        setPhoneNumber(numberToCall);
      }

      // Only open inbox if not called from conversation history
      if (!skipInboxOpen) {
        // Find and open the contact's conversation history (only if not already open)
        const matchingContact = contacts.find(c => c.phone === targetNumber);
        if (matchingContact && (!inboxContact || inboxContact.id !== matchingContact.id)) {
          setInboxContact(matchingContact);
        }
      }
    } catch (error: any) {
      console.error("Call failed:", error);
      setCallStatus(`Failed: ${error.message || error.code || "Check console"}`);
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
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send SMS");
      return data;
    },
    onSuccess: () => {
      setSmsMessage("");
      toast({ title: "SMS sent", description: "Message delivered successfully." });
    },
    onError: (error: Error) => {
      console.error("SMS failed:", error);
      toast({ title: "SMS failed", description: error.message, variant: "destructive" });
    },
  });

  const handleSendSMS = () => {
    if (!phoneNumber.trim()) {
      return;
    }
    if (!smsMessage.trim()) {
      return;
    }
    let toNumber = phoneNumber.replace(/[\s\-\(\)]/g, "");
    if (!toNumber.startsWith("+")) {
      if (toNumber.length === 10) {
        toNumber = "+1" + toNumber;
      } else if (toNumber.length === 11 && toNumber.startsWith("1")) {
        toNumber = "+" + toNumber;
      } else {
        toNumber = "+" + toNumber;
      }
    }
    smsMutation.mutate({ to: toNumber, message: smsMessage });
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
              <Tabs defaultValue="call" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="call" data-testid="tab-call">
                    <Phone className="h-3 w-3 mr-2" />
                    Keypad
                  </TabsTrigger>
                  <TabsTrigger value="contacts" data-testid="tab-contacts">
                    <User className="h-3 w-3 mr-2" />
                    Contacts
                  </TabsTrigger>
                  <TabsTrigger value="sms" data-testid="tab-sms">
                    <MessageSquare className="h-3 w-3 mr-2" />
                    SMS
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="call" className="space-y-4">
                  <div className="bg-muted/30 rounded-md p-4 text-center min-h-[60px] flex items-center justify-center">
                    <div className="text-2xl font-mono tracking-wider" data-testid="keypad-display">
                      {phoneNumber || <span className="text-muted-foreground">Enter number</span>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                      <Button
                        key={digit}
                        onClick={() => setPhoneNumber(prev => prev + digit)}
                        variant="outline"
                        className="h-14 text-xl font-semibold hover-elevate active-elevate-2"
                        data-testid={`keypad-${digit}`}
                      >
                        {digit}
                      </Button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPhoneNumber(prev => prev.slice(0, -1))}
                      variant="outline"
                      className="flex-1"
                      disabled={!phoneNumber}
                      data-testid="keypad-backspace"
                    >
                      ← Delete
                    </Button>
                  </div>

                  <div className="flex justify-center pt-2">
                    <Button
                      onClick={() => handleLiveCall()}
                      disabled={!device || !!activeCall || !phoneNumber}
                      className="h-16 w-16 rounded-full bg-green-600 hover:bg-green-700 shadow-lg"
                      size="icon"
                      data-testid="button-place-call"
                    >
                      <Phone className="h-6 w-6 text-white" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="contacts" className="space-y-4">
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
                  <ScrollArea className="h-[420px]">
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

                <TabsContent value="sms" className="space-y-4">
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
                    rows={16}
                    className="min-h-[360px] resize-none"
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
          // Call directly with the number, skip opening inbox since it's already open
          // This prevents duplicate modals from appearing
          handleLiveCall(phoneNumber, true);
        }}
        activeCallNumber={activeCall ? phoneNumber : null}
        callDuration={callDuration}
        onHangup={handleHangup}
      />
    </>
  );
}
