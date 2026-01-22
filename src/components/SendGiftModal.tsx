import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { GiftShop } from './GiftShop';
import { Gift } from 'lucide-react';

interface SendGiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    receiverEmail?: string;
    receiverName?: string;
}

export const SendGiftModal: React.FC<SendGiftModalProps> = ({
    isOpen,
    onClose,
    receiverEmail,
    receiverName
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-primary/20">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl text-primary font-bold">
                        <Gift className="h-6 w-6" />
                        Send a Gift to {receiverName || 'Match'}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Choose a virtual gift to send. Virtual gifts can be redeemed for LOVE tokens by the recipient.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                    <GiftShop
                        receiverEmail={receiverEmail}
                        onGiftSent={() => {
                            // We can add a delay if we want to show success before closing
                            setTimeout(onClose, 2000);
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};
