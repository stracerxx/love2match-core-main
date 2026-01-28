import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface DiscoverySettingsProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export const DiscoverySettings = ({ isOpen, onClose, onSave }: DiscoverySettingsProps) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [preferences, setPreferences] = useState({
        radius: 50,
        age_min: 18,
        age_max: 99,
        show_me: "everyone",
    });

    useEffect(() => {
        if (user && isOpen) {
            loadPreferences();
        }
    }, [user, isOpen]);

    const loadPreferences = async () => {
        try {
            const { data, error } = await (supabase as any)
                .from("users")
                .select("discovery_preferences")
                .eq("id", user?.id)
                .single();

            if (data && data.discovery_preferences) {
                const prefs = data.discovery_preferences as any;
                setPreferences({
                    radius: prefs.radius || 50,
                    age_min: prefs.age_range?.min || 18,
                    age_max: prefs.age_range?.max || 99,
                    show_me: prefs.show_me || "everyone",
                });
            }
        } catch (error) {
            console.error("Error loading preferences:", error);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);

        const discovery_preferences = {
            radius: preferences.radius,
            age_range: {
                min: preferences.age_min,
                max: preferences.age_max,
            },
            show_me: preferences.show_me,
        };

        const { error } = await (supabase as any)
            .from("users")
            .update({ discovery_preferences })
            .eq("id", user.id);

        if (error) {
            toast({
                title: "Error saving settings",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Settings saved",
                description: "Your discovery preferences have been updated.",
            });
            onSave();
            onClose();
        }
        setLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-primary">Discovery Settings</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {/* Distance Radius */}
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <Label className="text-base font-semibold">Maximum Distance</Label>
                            <span className="text-sm font-medium text-primary">{preferences.radius} miles</span>
                        </div>
                        <Slider
                            value={[preferences.radius]}
                            max={100}
                            min={1}
                            step={1}
                            onValueChange={(val) => setPreferences({ ...preferences, radius: val[0] })}
                            className="py-2"
                        />
                    </div>

                    {/* Age Range */}
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <Label className="text-base font-semibold">Age Range</Label>
                            <span className="text-sm font-medium text-primary">
                                {preferences.age_min} - {preferences.age_max}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Slider
                                value={[preferences.age_min, preferences.age_max]}
                                max={99}
                                min={18}
                                step={1}
                                onValueChange={(val) =>
                                    setPreferences({ ...preferences, age_min: val[0], age_max: val[1] })
                                }
                                className="py-2"
                            />
                        </div>
                    </div>

                    {/* Show Me */}
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">Show Me</Label>
                        <Select
                            value={preferences.show_me}
                            onValueChange={(val) => setPreferences({ ...preferences, show_me: val })}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selection your preference" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="men">Men</SelectItem>
                                <SelectItem value="women">Women</SelectItem>
                                <SelectItem value="everyone">Everyone</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="gradient-primary">
                        {loading ? "Saving..." : "Apply Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
