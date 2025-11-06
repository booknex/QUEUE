import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, MessageSquare, PhoneMissed, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import type { Contact } from "@shared/schema";

interface MessageInboxModalProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export default function MessageInboxModal({ contact, open, onOpenChange }: MessageInboxModalProps) {
  const [expandedCallSids, setExpandedCallSids] = useState<Set<string>>(new Set());

  const { data: calls = [], isLoading: callsLoading } = useQuery<Call[]>({
    queryKey: ["/api/twilio/calls", contact?.phone],
    enabled: open && !!contact?.phone,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/twilio/messages", contact?.phone],
    enabled: open && !!contact?.phone,
  });

  const callSidsWithRecordings = useMemo(() => {
    return calls.filter(call => call.status === 'completed' && parseInt(call.duration) > 0).map(c => c.sid);
  }, [calls]);

  const { data: recordingsData = [] } = useQuery<{ callSid: string; recordings: Recording[] }[]>({
    queryKey: ["/api/twilio/recordings/batch", callSidsWithRecordings],
    queryFn: async () => {
      const results = await Promise.all(
        callSidsWithRecordings.map(async (callSid) => {
          const response = await fetch(`/api/twilio/recordings/${callSid}`);
          if (!response.ok) return { callSid, recordings: [] };
          const recordings = await response.json();
          return { callSid, recordings };
        })
      );
      return results;
    },
    enabled: callSidsWithRecordings.length > 0,
  });

  const recordingsByCallSid = useMemo(() => {
    const map = new Map<string, Recording[]>();
    recordingsData.forEach(({ callSid, recordings }) => {
      map.set(callSid, recordings);
    });
    return map;
  }, [recordingsData]);

  const timeline = useMemo(() => {
    const items: TimelineItem[] = [];

    calls.forEach((call) => {
      const timestamp = new Date(call.startTime);
      const isIncoming = call.direction === "inbound" || call.from === contact?.phone;
      items.push({
        id: call.sid,
        type: 'call',
        timestamp,
        isIncoming,
        data: call,
        recordings: recordingsByCallSid.get(call.sid) || [],
      });
    });

    messages.forEach((message) => {
      const timestamp = new Date(message.dateSent || message.dateCreated);
      const isIncoming = message.direction === "inbound" || message.from === contact?.phone;
      items.push({
        id: message.sid,
        type: 'sms',
        timestamp,
        isIncoming,
        data: message,
      });
    });

    return items.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [calls, messages, contact?.phone, recordingsByCallSid]);

  if (!contact) return null;

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
    const hasRecordings = item.recordings && item.recordings.length > 0;

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
          } rounded-2xl px-4 py-2.5 shadow-sm ${hasRecordings ? 'cursor-pointer hover-elevate' : ''}`}
          onClick={hasRecordings ? () => toggleCallExpansion(call.sid) : undefined}
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
              {item.recordings!.map((recording) => (
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
          {hasRecordings && !isExpanded && (
            <div className={`text-xs mt-1 ${item.isIncoming ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
              Click to play recording
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col" data-testid="dialog-message-inbox">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {contact.name}
          </DialogTitle>
          <DialogDescription>
            {contact.phone ? contact.phone : "No phone number available"}
          </DialogDescription>
        </DialogHeader>

        {!contact.phone ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            This contact doesn't have a phone number.
          </div>
        ) : (
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
        )}
      </DialogContent>
    </Dialog>
  );
}
