import { Dialog, DialogContent } from "@/components/ui/dialog";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LoginDialog = ({ open, onOpenChange }: LoginDialogProps) => {
  return (
    <Dialog open={false} onOpenChange={onOpenChange}>
      <DialogContent>
        <div>This component is no longer used</div>
      </DialogContent>
    </Dialog>
  );
};
