import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Twitter, Instagram, Globe } from 'lucide-react';

const MaintenanceMode = () => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

            <Card className="max-w-md w-full border-white/20 bg-white/5 backdrop-blur-xl shadow-2xl relative z-10">
                <CardContent className="flex flex-col items-center text-center p-8 space-y-6">
                    {/* Logo */}
                    <div className="w-24 h-24 relative group">
                        <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl group-hover:bg-primary/50 transition-all duration-500" />
                        <img
                            src="/logo.png"
                            alt="Love2Match Logo"
                            className="w-full h-full object-contain relative z-10 drop-shadow-lg"
                            onError={(e) => {
                                e.currentTarget.src = "/favicon.ico";
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-gradient-x">
                            Under Maintenance
                        </h1>
                        <p className="text-muted-foreground bg-white/10 px-4 py-1 rounded-full text-sm font-medium inline-block">
                            We'll be back shortly!
                        </p>
                    </div>

                    <p className="text-foreground/80 leading-relaxed text-sm">
                        We're currently performing some important updates to enhance your matching experience. Thank you for your patience!
                    </p>

                    {/* Social Links */}
                    <div className="flex gap-4 pt-4">
                        <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-full transition-all">
                            <Twitter className="h-5 w-5 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-full transition-all">
                            <Instagram className="h-5 w-5 text-secondary" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-full transition-all">
                            <Globe className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />

                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                        © 2026 Love2Match • Advanced Matching
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default MaintenanceMode;
