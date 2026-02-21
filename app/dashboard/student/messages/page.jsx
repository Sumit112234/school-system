"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useStudentMessages } from "@/hooks/use-student-data";
import { Search, Mail, Send, Plus, Reply, User, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading your messages...</p>
      </div>
    </div>
  );
}

export default function StudentMessages() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [newMessage, setNewMessage] = useState({ recipient: "", subject: "", content: "" });
  const { messages, loading, error, refetch, sendMessage, replyToMessage } = useStudentMessages();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive mb-4">Error loading messages: {error}</p>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  const messagesList = messages?.data || [];
  const filteredMessages = messagesList.filter(
    (msg) =>
      msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.senderName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = messagesList.filter((m) => !m.read).length;

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      await replyToMessage(selectedMessage._id, replyText);
      toast.success("Reply sent!");
      setReplyText("");
      setSelectedMessage(null);
      refetch();
    } catch (err) {
      toast.error("Failed to send reply");
    }
  };

  const handleNewMessage = async () => {
    if (!newMessage.recipient || !newMessage.subject || !newMessage.content) {
      toast.error("Please fill all fields");
      return;
    }
    // try {
    //   await sendMessage(newMessage);
    //   toast.success("Message sent!");
    //   description: `Your message to ${newMessage.recipient} has been sent.`,
    // });
    setNewMessage({ recipient: "", subject: "", content: "" });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "teacher":
        return "bg-teacher";
      case "admin":
        return "bg-admin";
      case "helper":
        return "bg-helper";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground">Communicate with teachers and staff</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Message</DialogTitle>
              <DialogDescription>Send a message to a teacher or staff member</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Recipient</label>
                <select
                  className="w-full px-3 py-2 border rounded-md bg-card"
                  value={newMessage.recipient}
                  onChange={(e) => setNewMessage({ ...newMessage, recipient: e.target.value })}
                >
                  <option value="">Select recipient</option>
                  {mockUsers
                    .filter((u) => u.role !== "student")
                    .map((user) => (
                      <option key={user.id} value={user.name}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  placeholder="Message subject"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Type your message..."
                  rows={4}
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={handleNewMessage}>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-student/10">
                <Mail className="h-6 w-6 text-student" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockMessages.length}</p>
                <p className="text-sm text-muted-foreground">Total Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <Mail className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unreadCount}</p>
                <p className="text-sm text-muted-foreground">Unread</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <Send className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Sent Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>Your received messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No messages found.
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                    !message.read ? "bg-student/5 border-student/20" : ""
                  }`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={getRoleColor(message.senderRole)}>
                        {message.senderName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{message.senderName}</p>
                          <Badge variant="outline" className="text-xs capitalize">
                            {message.senderRole}
                          </Badge>
                          {!message.read && (
                            <Badge className="bg-student text-student-foreground text-xs">New</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-medium text-sm text-foreground mb-1">{message.subject}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMessage.subject}</DialogTitle>
                <DialogDescription>
                  From {selectedMessage.senderName} ({selectedMessage.senderRole})
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Avatar>
                    <AvatarFallback className={getRoleColor(selectedMessage.senderRole)}>
                      {selectedMessage.senderName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedMessage.senderName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="text-foreground whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reply</label>
                  <Textarea
                    placeholder="Type your reply..."
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={handleReply}>
                  <Reply className="mr-2 h-4 w-4" />
                  Send Reply
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
