import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, MessageSquare, Mic, PhoneIncoming, PhoneOutgoing, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
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

export default function MessageInboxModal({ contact, open, onOpenChange }: MessageInboxModalProps) {
  const [selectedCallSid, setSelectedCallSid] = useState<string | null>(null);

  const { data: calls = [], isLoading: callsLoading } = useQuery<Call[]>({
    queryKey: ["/api/twilio/calls", contact?.phone],
    enabled: open && !!contact?.phone,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/twilio/messages", contact?.phone],
    enabled: open && !!contact?.phone,
  });

  const { data: recordings = [], isLoading: recordingsLoading } = useQuery<Recording[]>({
    queryKey: ["/api/twilio/recordings", selectedCallSid],
    enabled: !!selectedCallSid,
  });

  if (!contact) return null;

  const formatDuration = (seconds: string | number) => {
    const total = typeof seconds === 'string' ? parseInt(seconds) : seconds;
    if (!total || total === 0) return "No answer";
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const isIncoming = (direction: string, from: string) => {
    return direction === "inbound" || from === contact.phone;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col" data-testid="dialog-message-inbox">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Message Inbox - {contact.name}
          </DialogTitle>
          <DialogDescription>
            {contact.phone ? `View all calls and messages with ${contact.phone}` : "No phone number available"}
          </DialogDescription>
        </DialogHeader>

        {!contact.phone ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            This contact doesn't have a phone number.
          </div>
        ) : (
          <Tabs defaultValue="calls" className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="calls" className="flex items-center gap-2" data-testid="tab-calls">
                <Phone className="w-4 h-4" />
                Calls ({calls.length})
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2" data-testid="tab-messages">
                <MessageSquare className="w-4 h-4" />
                Messages ({messages.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calls" className="flex-1 overflow-y-auto space-y-3 mt-4" data-testid="content-calls">
              {callsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : calls.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Phone className="w-12 h-12 mb-3 opacity-50" />
                  <p>No call history with this contact</p>
                </div>
              ) : (
                calls.map((call) => (
                  <Card 
                    key={call.sid} 
                    className="hover-elevate cursor-pointer"
                    onClick={() => setSelectedCallSid(call.sid)}
                    data-testid={`card-call-${call.sid}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          {isIncoming(call.direction, call.from) ? (
                            <PhoneIncoming className="w-5 h-5 text-green-600 mt-0.5" />
                          ) : (
                            <PhoneOutgoing className="w-5 h-5 text-blue-600 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">
                                {isIncoming(call.direction, call.from) ? "Incoming Call" : "Outgoing Call"}
                              </span>
                              <Badge variant="outline" className="capitalize">
                                {call.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(call.startTime), { addSuffix: true })}
                              </div>
                              <div>Duration: {formatDuration(call.duration)}</div>
                              {call.status === 'completed' && (
                                <div className="flex items-center gap-1 text-xs text-blue-600 mt-2">
                                  <Mic className="w-3 h-3" />
                                  Click to view recordings
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {selectedCallSid === call.sid && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="text-sm font-medium mb-2">Recordings:</div>
                          {recordingsLoading ? (
                            <Skeleton className="h-12 w-full" />
                          ) : recordings.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No recordings available</div>
                          ) : (
                            <div className="space-y-2">
                              {recordings.map((recording) => (
                                <div 
                                  key={recording.sid} 
                                  className="flex items-center gap-3 p-2 rounded bg-muted/50"
                                  data-testid={`recording-${recording.sid}`}
                                >
                                  <Mic className="w-4 h-4 text-muted-foreground" />
                                  <div className="flex-1 min-w-0">
                                    <audio 
                                      controls 
                                      className="w-full h-8"
                                      src={recording.url}
                                      data-testid={`audio-${recording.sid}`}
                                    >
                                      Your browser does not support the audio element.
                                    </audio>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Duration: {formatDuration(recording.duration)} • {formatDistanceToNow(new Date(recording.dateCreated), { addSuffix: true })}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="messages" className="flex-1 overflow-y-auto space-y-3 mt-4" data-testid="content-messages">
              {messagesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
                  <p>No message history with this contact</p>
                </div>
              ) : (
                messages.map((message) => (
                  <Card key={message.sid} data-testid={`card-message-${message.sid}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <MessageSquare className={`w-5 h-5 mt-0.5 ${isIncoming(message.direction, message.from) ? 'text-green-600' : 'text-blue-600'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="font-medium">
                              {isIncoming(message.direction, message.from) ? "Incoming Message" : "Outgoing Message"}
                            </span>
                            <Badge variant="outline" className="capitalize">
                              {message.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(message.dateSent || message.dateCreated), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
