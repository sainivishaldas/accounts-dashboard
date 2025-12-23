import { useState, useEffect } from "react";
import { Plus, MessageSquare, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format, isPast, isToday } from "date-fns";
import type { Ticket, TicketComment, TicketStatus } from "@/types/database";

interface TicketsTabProps {
  residentId: string;
  tickets: Ticket[];
  onTicketsChange: (tickets: Ticket[]) => void;
}

function getStatusInfo(ticket: Ticket): { status: TicketStatus; label: string; className: string; icon: React.ReactNode } {
  if (ticket.status === "resolved") {
    return {
      status: "resolved",
      label: "Resolved",
      className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      icon: <CheckCircle className="h-3.5 w-3.5" />,
    };
  }

  const dueDate = new Date(ticket.due_date);
  if (isPast(dueDate) && !isToday(dueDate)) {
    return {
      status: "lapsed",
      label: "Lapsed",
      className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
    };
  }

  return {
    status: "pending",
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    icon: <Clock className="h-3.5 w-3.5" />,
  };
}

export function TicketsTab({ residentId, tickets, onTicketsChange }: TicketsTabProps) {
  const { user } = useAuth();
  const [showAddTicket, setShowAddTicket] = useState(false);
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newComment, setNewComment] = useState("");
  
  // Form state for new ticket
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketDueDate, setTicketDueDate] = useState("");

  const handleAddTicket = () => {
    if (!ticketTitle.trim() || !ticketDueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newTicket: Ticket = {
      id: crypto.randomUUID(),
      resident_id: residentId,
      title: ticketTitle.trim(),
      description: ticketDescription.trim(),
      status: "pending",
      due_date: ticketDueDate,
      comments: [],
      created_by: user?.email || "Unknown",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onTicketsChange([newTicket, ...tickets]);
    setTicketTitle("");
    setTicketDescription("");
    setTicketDueDate("");
    setShowAddTicket(false);
    toast.success("Ticket created successfully");
  };

  const handleMarkResolved = (ticketId: string) => {
    const updatedTickets = tickets.map((ticket) =>
      ticket.id === ticketId
        ? {
            ...ticket,
            status: "resolved" as TicketStatus,
            resolved_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        : ticket
    );
    onTicketsChange(updatedTickets);
    
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({
        ...selectedTicket,
        status: "resolved",
        resolved_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    
    toast.success("Ticket marked as resolved");
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedTicket) return;

    const comment: TicketComment = {
      id: crypto.randomUUID(),
      ticket_id: selectedTicket.id,
      content: newComment.trim(),
      created_by: user?.email || "Unknown",
      created_at: new Date().toISOString(),
    };

    const updatedTickets = tickets.map((ticket) =>
      ticket.id === selectedTicket.id
        ? {
            ...ticket,
            comments: [...ticket.comments, comment],
            updated_at: new Date().toISOString(),
          }
        : ticket
    );

    onTicketsChange(updatedTickets);
    setSelectedTicket({
      ...selectedTicket,
      comments: [...selectedTicket.comments, comment],
    });
    setNewComment("");
    toast.success("Comment added");
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Tickets</h3>
        <Button size="sm" onClick={() => setShowAddTicket(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Raise Ticket
        </Button>
      </div>

      {tickets.length > 0 ? (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const statusInfo = getStatusInfo(ticket);
            return (
              <div
                key={ticket.id}
                className="p-4 rounded-lg border border-border bg-muted/30 space-y-2 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => {
                  setSelectedTicket(ticket);
                  setShowTicketDetails(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{ticket.title}</p>
                    {ticket.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {ticket.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${statusInfo.className}`}
                  >
                    {statusInfo.icon}
                    {statusInfo.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Due: {format(new Date(ticket.due_date), "MMM d, yyyy")}</span>
                  <span>By: {ticket.created_by}</span>
                  {ticket.comments.length > 0 && (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {ticket.comments.length}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">No tickets yet</p>
          <p className="text-xs text-muted-foreground mt-1">Click "Raise Ticket" to create one</p>
        </div>
      )}

      {/* Add Ticket Dialog */}
      <Dialog open={showAddTicket} onOpenChange={setShowAddTicket}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raise New Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder="Enter ticket title"
                value={ticketTitle}
                onChange={(e) => setTicketTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Enter ticket description"
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Input
                type="date"
                value={ticketDueDate}
                onChange={(e) => setTicketDueDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTicket(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTicket}>Create Ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket Details Dialog */}
      <Dialog open={showTicketDetails} onOpenChange={setShowTicketDetails}>
        <DialogContent className="max-w-lg">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <DialogTitle className="pr-4">{selectedTicket.title}</DialogTitle>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium shrink-0 ${
                      getStatusInfo(selectedTicket).className
                    }`}
                  >
                    {getStatusInfo(selectedTicket).icon}
                    {getStatusInfo(selectedTicket).label}
                  </span>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {selectedTicket.description && (
                  <p className="text-sm text-muted-foreground">{selectedTicket.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Created: {format(new Date(selectedTicket.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                  <span>Due: {format(new Date(selectedTicket.due_date), "MMM d, yyyy")}</span>
                </div>

                {selectedTicket.resolved_date && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Resolved on: {format(new Date(selectedTicket.resolved_date), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                )}

                {/* Comments Section */}
                <div className="space-y-3 border-t border-border pt-4">
                  <h4 className="font-medium text-sm">Comments</h4>
                  
                  {selectedTicket.comments.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedTicket.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="p-3 rounded-lg bg-muted/50 text-sm"
                        >
                          <p>{comment.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {comment.created_by} • {format(new Date(comment.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No comments yet</p>
                  )}

                  {/* Add Comment */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                    />
                    <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                {selectedTicket.status !== "resolved" && (
                  <Button onClick={() => handleMarkResolved(selectedTicket.id)} className="gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Mark as Resolved
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
