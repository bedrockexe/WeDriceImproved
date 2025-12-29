import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Settings() {
  const [name, setName] = useState("Kenn N. Jarangue");
  const [contacts, setContacts] = useState("Kenn N. Jarangue");
  const [gmail, setGmail] = useState("Kenn N. Jarangue");
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");

  const handleEdit = (field, currentValue) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const handleSave = () => {
    if (editingField === "name") setName(tempValue);
    if (editingField === "contacts") setContacts(tempValue);
    if (editingField === "gmail") setGmail(tempValue);
    setEditingField(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-6 sm:p-8 lg:p-12">
        <div className="flex flex-col items-center sm:items-start gap-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28">
              <AvatarImage src="" alt="Profile" />
              <AvatarFallback className="text-2xl bg-muted">
                {name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button variant="ghost">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="w-full space-y-6">
            {/* Name Field */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Name</p>
                <p className="text-foreground">{name}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit("name", name)}
                className="self-end sm:self-center"
              >
                <Pencil className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            </div>

            {/* Contacts Field */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Contacts</p>
                <p className="text-foreground">{contacts}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit("contacts", contacts)}
                className="self-end sm:self-center"
              >
                <Pencil className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            </div>

            {/* Gmail Field */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Gmail</p>
                <p className="text-foreground">{gmail}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit("gmail", gmail)}
                className="self-end sm:self-center"
              >
                <Pencil className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editingField !== null} onOpenChange={() => setEditingField(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editingField}</DialogTitle>
            <DialogDescription>
              Update your {editingField} information below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-field">
                {editingField?.charAt(0).toUpperCase() + editingField?.slice(1)}
              </Label>
              <Input
                id="edit-field"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                placeholder={`Enter ${editingField}`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingField(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
