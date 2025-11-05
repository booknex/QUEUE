import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UploadContactsModalProps {
  open: boolean;
  onClose: () => void;
  selectedCompanyId: number | null;
}

interface ParsedContact {
  name: string;
  phone: string;
  email: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export function UploadContactsModal({ open, onClose, selectedCompanyId }: UploadContactsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV file",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setImportResult(null);
    }
  };

  const parseCSV = (text: string): ParsedContact[] => {
    const lines = text.split("\n").filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
    const contacts: ParsedContact[] = [];

    const nameIdx = headers.findIndex(h => h.toLowerCase() === "name");
    const firstNameIdx = headers.findIndex(h => h.toLowerCase() === "first name");
    const lastNameIdx = headers.findIndex(h => h.toLowerCase() === "last name");
    const phoneIdx = headers.findIndex(h => h.toLowerCase() === "phone");
    const emailIdx = headers.findIndex(h => h.toLowerCase() === "email");

    for (let i = 1; i < lines.length; i++) {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      let name = "";
      if (nameIdx !== -1 && values[nameIdx]) {
        name = values[nameIdx].replace(/"/g, "").trim();
      } else if (firstNameIdx !== -1 || lastNameIdx !== -1) {
        const firstName = firstNameIdx !== -1 ? values[firstNameIdx]?.replace(/"/g, "").trim() : "";
        const lastName = lastNameIdx !== -1 ? values[lastNameIdx]?.replace(/"/g, "").trim() : "";
        name = `${firstName} ${lastName}`.trim();
      }

      const phone = phoneIdx !== -1 ? values[phoneIdx]?.replace(/"/g, "").trim() : "";
      const email = emailIdx !== -1 ? values[emailIdx]?.replace(/"/g, "").trim() : "";

      if (name || phone || email) {
        contacts.push({
          name: name || "",
          phone: phone || "",
          email: email || "",
        });
      }
    }

    return contacts;
  };

  const handleUpload = async () => {
    if (!file || !selectedCompanyId) return;

    setIsUploading(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const contacts = parseCSV(text);

      if (contacts.length === 0) {
        toast({
          title: "No contacts found",
          description: "The CSV file doesn't contain valid contact data",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      const response = await apiRequest("POST", "/api/contacts/bulk-import", {
        contacts,
        companyId: selectedCompanyId,
      });

      const result: ImportResult = await response.json();
      setImportResult(result);

      if (result.success > 0) {
        await queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
        
        toast({
          title: "Import completed",
          description: `Successfully imported ${result.success} contact${result.success > 1 ? "s" : ""}${result.failed > 0 ? `, ${result.failed} failed` : ""}`,
        });

        if (result.failed === 0) {
          setTimeout(() => {
            handleClose();
          }, 2000);
        }
      } else {
        toast({
          title: "Import failed",
          description: "No contacts were imported",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload contacts",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setImportResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-upload-contacts">
        <DialogHeader>
          <DialogTitle>Upload Contacts CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with contact information. Required columns: Name, Phone, or Email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="csv-file" className="text-sm font-medium">
              CSV File
            </label>
            <div className="flex items-center gap-2">
              <input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="input-csv-file"
                disabled={isUploading}
              />
            </div>
            {file && (
              <p className="text-xs text-muted-foreground">
                Selected: {file.name}
              </p>
            )}
          </div>

          {importResult && (
            <div className="space-y-2">
              {importResult.success > 0 && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Successfully imported {importResult.success} contact{importResult.success > 1 ? "s" : ""}
                  </AlertDescription>
                </Alert>
              )}
              
              {importResult.failed > 0 && importResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-semibold">
                        {importResult.failed} contact{importResult.failed > 1 ? "s" : ""} failed to import:
                      </p>
                      <ul className="list-disc list-inside text-xs max-h-32 overflow-y-auto">
                        {importResult.errors.slice(0, 10).map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                        {importResult.errors.length > 10 && (
                          <li>...and {importResult.errors.length - 10} more</li>
                        )}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
            data-testid="button-cancel-upload"
          >
            {importResult ? "Close" : "Cancel"}
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading || !selectedCompanyId}
            data-testid="button-upload-csv"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
