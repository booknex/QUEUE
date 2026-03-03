import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, MessageSquare, PhoneMissed, PhoneIncoming, PhoneOutgoing, Send } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Contact } from "@shared/schema";

interface MessageInboxModalProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCallContact?: (phoneNumber: string) => void;
  activeCallNumber?: string | null;
  callDuration?: number;
  onHangup?: () => void;
}

interface Call {
  sid: string;
  from: string;
  to: string;
  status: string;
  direction: string;
  duration: string;
  startTime: string;
  endTime: string;
  price: string | null;
  priceUnit: string | null;
}

interface Message {
  sid: string;
  from: string;
  to: string;
  body: string;
  status: string;
  direction: string;
  dateSent: string;
  dateCreated: string;
  price: string | null;
  priceUnit: string | null;
}

interface Recording {
  sid: string;
  duration: string;
  dateCreated: string;
  url: string;
  status: string;
}

type TimelineItem = {
  id: string;
  type: 'call' | 'sms';
  timestamp: Date;
  isIncoming: boolean;
  data: Call | Message;
  recordings?: Recording[];
};

export default function MessageInboxModal({ contact, open, onOpenChange, onCallContact, activeCallNumber, callDuration, onHangup }: MessageInboxModalProps) {
  const [expandedCallSids, setExpandedCallSids] = useState<Set<string>>(new Set());
  const [recordingsByCallSid, setRecordingsByCallSid] = useState<Map<string, Recording[]>>(new Map());
  const [messageText, setMessageText] = useState("");
  const { toast } = useToast();
  
  const isActiveCall = contact?.phone === activeCallNumber;
  
  const formatDurationLive = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const { data: calls = [], isLoading: callsLoading } = useQuery<Call[]>({
    queryKey: ["/api/twilio/calls", contact?.phone],
    enabled: open && !!contact?.phone,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/twilio/messages", contact?.phone],
    enabled: open && !!contact?.phone,
  });

  const fetchRecordingsForCall = async (callSid: string) => {
    if (recordingsByCallSid.has(callSid)) return;
    
    try {
      const response = await fetch(`/api/twilio/recordings/${callSid}`);
      if (response.ok) {
        const recordings = await response.json();
        setRecordingsByCallSid(prev => new Map(prev).set(callSid, recordings));
      }
    } catch (error) {
      console.error('Error fetching recordings:', error);
    }
  };

  const timeline = useMemo(() => {
    const items: TimelineItem[] = [];
    if (!contact) return items;

    calls.forEach((call) => {
      const timestamp = new Date(call.startTime);
      const isIncoming = call.direction === "inbound" || call.from === contact.phone;
      items.push({
        id: call.sid,
        type: 'call',
        timestamp,
        isIncoming,
        data: call,
      });
    });

    messages.forEach((message) => {
      const timestamp = new Date(message.dateSent || message.dateCreated);
      const isIncoming = message.direction === "inbound" || message.from === contact.phone;
      items.push({
        id: message.sid,
        type: 'sms',
        timestamp,
        isIncoming,
        data: message,
      });
    });

    return items.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [calls, messages, contact]);

  const groupedTimeline = useMemo(() => {
    const grouped: { date: string; items: TimelineItem[] }[] = [];
    
    timeline.forEach(item => {
      const dateStr = format(item.timestamp, 'MMMM d, yyyy');
      const existingGroup = grouped.find(g => g.date === dateStr);
      
      if (existingGroup) {
        existingGroup.items.push(item);
      } else {
        grouped.push({ date: dateStr, items: [item] });
      }
    });
    
    return grouped;
  }, [timeline]);

  const formatDuration = (seconds: string | number) => {
    const total = typeof seconds === 'string' ? parseInt(seconds) : seconds;
    if (!total || total === 0) return "0s";
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const toggleCallExpansion = (callSid: string) => {
    setExpandedCallSids(prev => {
      const newSet = new Set(prev);
      if (newSet.has(callSid)) {
        newSet.delete(callSid);
      } else {
        newSet.add(callSid);
        fetchRecordingsForCall(callSid);
      }
      return newSet;
    });
  };

  const renderCallMessage = (item: TimelineItem) => {
    const call = item.data as Call;
    const duration = parseInt(call.duration);
    const isAnswered = call.status === 'completed' && duration > 0;
    const isMissed = call.status !== 'completed' || duration === 0;
    const isExpanded = expandedCallSids.has(call.sid);
    const recordings = recordingsByCallSid.get(call.sid) || [];
    const hasRecordings = recordings.length > 0;
    const canHaveRecordings = isAnswered;

    return (
      <div 
        className={`flex ${item.isIncoming ? 'justify-start' : 'justify-end'} mb-4`}
        data-testid={`timeline-call-${call.sid}`}
      >
        <div 
          className={`max-w-[70%] ${
            item.isIncoming 
              ? 'bg-muted' 
              : 'bg-primary text-primary-foreground'
          } rounded-2xl px-4 py-2.5 shadow-sm ${canHaveRecordings ? 'cursor-pointer hover-elevate' : ''}`}
          onClick={canHaveRecordings ? () => toggleCallExpansion(call.sid) : undefined}
        >
          <div className="flex items-center gap-2 mb-1">
            {isMissed ? (
              <PhoneMissed className="w-4 h-4" />
            ) : item.isIncoming ? (
              <PhoneIncoming className="w-4 h-4" />
            ) : (
              <PhoneOutgoing className="w-4 h-4" />
            )}
            <span className="font-medium text-sm">
              {isMissed ? 'Missed call' : 'Answered call'}
            </span>
          </div>
          <div className={`text-xs ${item.isIncoming ? 'text-muted-foreground' : 'text-primary-foreground/80'}`}>
            {isAnswered ? `Duration: ${formatDuration(duration)}` : 'No answer'}
          </div>
          {hasRecordings && isExpanded && (
            <div className="mt-3 pt-3 border-t border-current/20 space-y-2">
              {recordings.map((recording) => (
                <div key={recording.sid} data-testid={`recording-${recording.sid}`}>
                  <audio 
                    controls 
                    className="w-full h-8"
                    src={recording.url}
                    data-testid={`audio-${recording.sid}`}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ))}
            </div>
          )}
          {canHaveRecordings && !isExpanded && (
            <div className={`text-xs mt-1 ${item.isIncoming ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
              {hasRecordings ? 'Click to play recording' : 'Click to load recording'}
            </div>
          )}
          {isExpanded && !hasRecordings && canHaveRecordings && (
            <div className={`text-xs mt-2 ${item.isIncoming ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
              Loading recording...
            </div>
          )}
          <div className={`text-xs mt-1 ${item.isIncoming ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
            {format(item.timestamp, 'h:mm a')}
          </div>
        </div>
      </div>
    );
  };

  const renderSmsMessage = (item: TimelineItem) => {
    const message = item.data as Message;

    return (
      <div 
        className={`flex ${item.isIncoming ? 'justify-start' : 'justify-end'} mb-4`}
        data-testid={`timeline-sms-${message.sid}`}
      >
        <div 
          className={`max-w-[70%] ${
            item.isIncoming 
              ? 'bg-muted' 
              : 'bg-primary text-primary-foreground'
          } rounded-2xl px-4 py-2.5 shadow-sm`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.body}</p>
          <div className={`text-xs mt-1 ${item.isIncoming ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
            {format(item.timestamp, 'h:mm a')}
          </div>
        </div>
      </div>
    );
  };

  const smsMutation = useMutation({
    mutationFn: async ({ to, message }: { to: string; message: string }) => {
      const response = await apiRequest("POST", "/api/twilio/sms", { to, message });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send SMS");
      return data;
    },
    onSuccess: () => {
      setMessageText("");
      toast({
        title: "Message sent",
        description: "Your SMS has been delivered",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/twilio/messages", contact?.phone] });
    },
    onError: (error: Error) => {
      console.error("SMS failed:", error);
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!contact?.phone) return;
    if (!messageText.trim()) return;
    let toNumber = contact.phone.replace(/[\s\-\(\)]/g, "");
    if (!toNumber.startsWith("+")) {
      toNumber = "+" + toNumber;
    }
    smsMutation.mutate({ to: toNumber, message: messageText });
  };

  const handleCallContact = () => {
    if (!contact?.phone) return;
    if (onCallContact) {
      onCallContact(contact.phone);
    }
  };

  if (!contact) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col" data-testid="dialog-message-inbox">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                {contact.name}
              </DialogTitle>
              <DialogDescription>
                {contact.phone ? contact.phone : "No phone number available"}
              </DialogDescription>
            </div>
            {contact.phone && (
              <Button
                onClick={handleCallContact}
                variant="outline"
                size="sm"
                disabled={!onCallContact}
                data-testid="button-call-contact"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
            )}
          </div>
        </DialogHeader>

        {!contact.phone ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            This contact doesn't have a phone number.
          </div>
        ) : (
          <>
            {/* Active Call Indicator */}
            {isActiveCall && (
              <div className="mx-2 mb-3 p-4 bg-green-50 dark:bg-green-950 border-2 border-green-500 rounded-lg" data-testid="active-call-indicator">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 p-2 rounded-full animate-pulse">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-green-700 dark:text-green-300">Call Connected</div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      {callDuration !== undefined ? `Duration: ${formatDurationLive(callDuration)}` : 'Active call in progress'}
                    </div>
                  </div>
                  {onHangup && (
                    <Button
                      onClick={onHangup}
                      variant="destructive"
                      size="sm"
                      data-testid="button-hangup-call"
                    >
                      Hang Up
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto px-2" data-testid="message-timeline">
              {callsLoading || messagesLoading ? (
                <div className="space-y-4 py-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                      <Skeleton className={`h-20 ${i % 3 === 0 ? 'w-3/4' : 'w-1/2'} rounded-2xl`} />
                    </div>
                  ))}
                </div>
              ) : timeline.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
                  <p>No conversation history with this contact</p>
                </div>
              ) : (
                <div className="py-4">
                  {groupedTimeline.map(group => (
                    <div key={group.date} className="mb-6">
                      <div className="flex items-center justify-center mb-4">
                        <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                          {group.date}
                        </div>
                      </div>
                      {group.items.map(item => (
                        <div key={item.id}>
                          {item.type === 'call' ? renderCallMessage(item) : renderSmsMessage(item)}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* SMS Input */}
            <div className="border-t pt-4 px-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={smsMutation.isPending}
                  data-testid="input-message-text"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || smsMutation.isPending}
                  data-testid="button-send-message"
                >
                  {smsMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Press Enter to send
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
