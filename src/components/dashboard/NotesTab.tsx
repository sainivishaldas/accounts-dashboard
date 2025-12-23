import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { canCreateResident } from "@/lib/permissions";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Note } from "@/types/database";

interface NotesTabProps {
  residentId: string;
  notes: Note[];
  onNotesChange: (notes: Note[]) => void;
}

export function NotesTab({ residentId, notes, onNotesChange }: NotesTabProps) {
  const { userRole } = useAuth();
  const [showAddNote, setShowAddNote] = useState(false);
  const [showEditNote, setShowEditNote] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState("");

  const handleAddNote = () => {
    if (!noteContent.trim()) {
      toast.error("Note content cannot be empty");
      return;
    }

    const newNote: Note = {
      id: crypto.randomUUID(),
      resident_id: residentId,
      content: noteContent.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onNotesChange([newNote, ...notes]);
    setNoteContent("");
    setShowAddNote(false);
    toast.success("Note added successfully");
  };

  const handleEditNote = () => {
    if (!noteContent.trim() || !editingNote) {
      toast.error("Note content cannot be empty");
      return;
    }

    const updatedNotes = notes.map((note) =>
      note.id === editingNote.id
        ? { ...note, content: noteContent.trim(), updated_at: new Date().toISOString() }
        : note
    );

    onNotesChange(updatedNotes);
    setNoteContent("");
    setEditingNote(null);
    setShowEditNote(false);
    toast.success("Note updated successfully");
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      onNotesChange(notes.filter((note) => note.id !== noteId));
      toast.success("Note deleted successfully");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Notes</h3>
        {canCreateResident(userRole) && (
          <Button size="sm" onClick={() => setShowAddNote(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Note
          </Button>
        )}
      </div>

      {notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-lg border border-border bg-muted/30 space-y-2"
            >
              <div className="flex items-start justify-between">
                <p className="text-sm whitespace-pre-wrap flex-1">{note.content}</p>
                {canCreateResident(userRole) && (
                  <div className="flex items-center gap-1 ml-4 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditingNote(note);
                        setNoteContent(note.content);
                        setShowEditNote(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-destructive/10"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(note.created_at), "MMM d, yyyy 'at' h:mm a")}
                {note.updated_at !== note.created_at && " (edited)"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">No notes yet</p>
          <p className="text-xs text-muted-foreground mt-1">Click "Add Note" to create one</p>
        </div>
      )}

      {/* Add Note Dialog */}
      <Dialog open={showAddNote} onOpenChange={setShowAddNote}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Enter your note..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddNote(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote}>Add Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={showEditNote} onOpenChange={setShowEditNote}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Enter your note..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditNote(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditNote}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
