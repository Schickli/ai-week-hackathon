"use client";

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import React from "react";

export type DeclineDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    declineOptions: { label: string; value: string }[];
    onDecline: (reason: string) => void;
    disabled?: boolean;
};

export function DeclineDialog({ open, onOpenChange, declineOptions, onDecline, disabled }: DeclineDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="w-16 h-16 rounded-full border-2 border-red-500 text-red-500 transition-all duration-200 hover:scale-110 hover:bg-red-500 hover:text-white hover:border-red-600 focus:outline-none shadow-lg"
                    onClick={() => onOpenChange(true)}
                    aria-label="Reject"
                    disabled={disabled}
                >
                    <X className="w-12 h-12" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle
                        className="font-bold text-lg"
                        style={{
                            fontFamily: 'var(--font-sans)',
                            color: 'var(--foreground)',
                            letterSpacing: 'var(--tracking-normal)'
                        }}
                    >
                        Select decline reason
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2 mt-4">
                    {declineOptions.map(opt => (
                        <Button
                            key={opt.value}
                            variant="outline"
                            className="w-full py-3"
                            style={{
                                fontFamily: 'var(--font-sans)',
                                color: 'var(--foreground)',
                                background: 'var(--card)',
                                borderColor: 'var(--border)',
                                borderRadius: 'var(--radius-lg)',
                                boxShadow: 'var(--shadow-sm)',
                                fontWeight: 500,
                                letterSpacing: 'var(--tracking-normal)',
                                transition: 'background 0.2s, border-color 0.2s',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'var(--destructive)';
                                e.currentTarget.style.color = 'var(--destructive-foreground)';
                                e.currentTarget.style.borderColor = 'var(--destructive)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'var(--card)';
                                e.currentTarget.style.color = 'var(--foreground)';
                                e.currentTarget.style.borderColor = 'var(--border)';
                            }}
                            onClick={() => onDecline(opt.value)}
                        >
                            {opt.label}
                        </Button>
                    ))}
                </div>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        className="w-full mt-4 py-3"
                        style={{
                            fontFamily: 'var(--font-sans)',
                            color: 'var(--muted-foreground)',
                            background: 'var(--muted)',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-xs)',
                            letterSpacing: 'var(--tracking-normal)',
                            transition: 'background 0.2s, color 0.2s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'var(--accent)';
                            e.currentTarget.style.color = 'var(--accent-foreground)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'var(--muted)';
                            e.currentTarget.style.color = 'var(--muted-foreground)';
                        }}
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
