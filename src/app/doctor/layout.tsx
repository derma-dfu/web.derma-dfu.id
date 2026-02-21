"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
    LayoutDashboard,
    MessageSquare,
    UserCog,
    LogOut,
    Stethoscope,
    Menu,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DoctorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [doctorProfile, setDoctorProfile] = useState<any>(null);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/auth/login?role=doctor");
                return;
            }

            // Check role - Fetch user role from user_roles table
            const { data: roleData, error: roleError } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .single();

            if (roleError || !roleData || roleData.role !== 'doctor') {
                toast.error("Akses ditolak. Area khusus dokter.");
                router.push("/");
                return;
            }

            // Fetch doctor profile
            const { data: doctorData, error: doctorError } = await supabase
                .from('doctors')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (doctorData) {
                setDoctorProfile(doctorData);
            }

            setLoading(false);

        } catch (error) {
            console.error("Auth check error:", error);
            router.push("/");
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/auth/login");
    };

    const menuItems = [
        {
            href: "/doctor",
            label: "Dashboard",
            icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
            href: "/doctor/chat",
            label: "Konsultasi Chat",
            icon: <MessageSquare className="h-4 w-4" />,
        },
        {
            href: "/doctor/profile",
            label: "Profil Saya",
            icon: <UserCog className="h-4 w-4" />,
        },
    ];

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6">
                    <Link href="/doctor" className="flex items-center gap-2 font-bold text-xl text-primary">
                        <Stethoscope className="h-6 w-6" />
                        <span>Derma-DFU</span>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex flex-col h-[calc(100vh-4rem)] justify-between p-4">
                    <div>
                        {doctorProfile && (
                            <div className="mb-6 flex flex-col items-center text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                <Avatar className="h-16 w-16 mb-3 ring-2 ring-primary/10">
                                    <AvatarImage src={doctorProfile.image_url} />
                                    <AvatarFallback>{doctorProfile.name?.substring(0, 2).toUpperCase() || "DR"}</AvatarFallback>
                                </Avatar>
                                <h3 className="font-semibold text-sm line-clamp-1">{doctorProfile.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1">{doctorProfile.specialty_id}</p>
                            </div>
                        )}

                        <nav className="space-y-1">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                            onClick={handleSignOut}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Keluar
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Header */}
                <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 lg:px-8">
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </Button>

                    <div className="flex items-center gap-4 ml-auto">
                        <span className="hidden sm:inline-block text-sm text-muted-foreground">
                            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <ThemeToggle />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
