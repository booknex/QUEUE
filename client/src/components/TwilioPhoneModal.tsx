import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Phone, MessageSquare, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TwilioPhoneModalProps {
  open: boolean;
  onClose: () => void;
}

export function TwilioPhoneModal({ open, onClose }: TwilioPhoneModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [smsMessage, setSmsMessage] = useState("");
  const { toast } = useToast();

  const callMutation = useMutation({
    mutationFn: async (to: string) => {
      const response = await apiRequest("POST", "/api/twilio/call", { to });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to place call");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Call initiated",
        description: "Your call is being connected.",
      });
      setPhoneNumber("");
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Call failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const smsMutation = useMutation({
    mutationFn: async ({ to, message }: { to: string; message: string }) => {
      const response = await apiRequest("POST", "/api/twilio/sms", { to, message });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send SMS");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "SMS sent",
        description: "Your message has been sent successfully.",
      });
      setPhoneNumber("");
      setSmsMessage("");
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "SMS failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCall = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter a phone number to call.",
        variant: "destructive",
      });
      return;
    }
    callMutation.mutate(phoneNumber);
  };

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

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    }
    return "+" + cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
  };

  return (
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
            Make calls or send SMS messages using your Twilio account
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="call" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="call" data-testid="tab-call">
              <Phone className="h-4 w-4 mr-2" />
              Call
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
                onChange={handlePhoneChange}
                data-testid="input-call-phone"
              />
              <p className="text-xs text-muted-foreground">
                Include country code (e.g., +1 for US)
              </p>
            </div>

            <Button
              onClick={handleCall}
              disabled={callMutation.isPending}
              className="w-full"
              data-testid="button-place-call"
            >
              <Phone className="h-4 w-4 mr-2" />
              {callMutation.isPending ? "Calling..." : "Place Call"}
            </Button>
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
                onChange={handlePhoneChange}
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
      </DialogContent>
    </Dialog>
  );
}
