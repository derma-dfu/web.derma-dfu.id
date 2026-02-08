"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Paperclip, Phone, Video } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

interface Message {
    id: string;
    referral_id: string;
    sender_id: string;
    message: string;
    message_type: "text" | "image" | "file";
    file_url: string | null;
    created_at: string;
    is_read: boolean;
}

interface Referral {
    id: string;
    doctor_id: string | null;
    facility: string | null;
    status: string;
    consultation_type: string;
    triage_records: {
        photo_url: string | null;
        triage_result: string;
        infection_prob: string | null;
        ischaemia_prob: string | null;
    } | null;
}

export default function ChatPage() {
    const router = useRouter();
    const params = useParams();
    const referralId = params.id as string;
    const supabase = createClient();

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [referral, setReferral] = useState<Referral | null>(null);
    const [doctorInfo, setDoctorInfo] = useState<any>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        checkAuthAndFetch();
    }, [referralId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!referralId || !user) return;

        // Subscribe to real-time messages
        const channel = supabase
            .channel(`chat:${referralId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "chat_messages",
                    filter: `referral_id=eq.${referralId}`,
                },
                (payload) => {
                    const newMsg = payload.new as Message;
                    setMessages((prev) => [...prev, newMsg]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [referralId, user]);

    const checkAuthAndFetch = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/auth");
            return;
        }
        setUser(user);
        await Promise.all([fetchReferral(), fetchMessages()]);
    };

    const fetchReferral = async () => {
        try {
            const { data, error } = await supabase
                .from("referrals")
                .select(`
          *,
          triage_records (photo_url, triage_result, infection_prob, ischaemia_prob)
        `)
                .eq("id", referralId)
                .single();

            if (error) throw error;
            setReferral(data);

            // Fetch doctor info if available
            if (data.doctor_id) {
                const { data: doctorData } = await supabase
                    .from("user")
                    .select("id, name, image")
                    .eq("id", data.doctor_id)
                    .single();
                setDoctorInfo(doctorData);
            }
        } catch (err) {
            console.error("Error fetching referral:", err);
            toast.error("Gagal memuat konsultasi");
        }
    };

    const fetchMessages = async () => {
        try {
            const { data, error } = await supabase
                .from("chat_messages")
                .select("*")
                .eq("referral_id", referralId)
                .order("created_at", { ascending: true });

            if (error) throw error;
            setMessages(data || []);
        } catch (err) {
            console.error("Error fetching messages:", err);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const { error } = await supabase.from("chat_messages").insert({
                referral_id: referralId,
                sender_id: user.id,
                message: newMessage.trim(),
                message_type: "text",
            });

            if (error) throw error;
            setNewMessage("");
            inputRef.current?.focus();
        } catch (err) {
            console.error("Error sending message:", err);
            toast.error("Gagal mengirim pesan");
        } finally {
            setSending(false);
        }
    };

    const isOwnMessage = (senderId: string) => user?.id === senderId;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">Memuat chat...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-md">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center gap-3">
                        <Link href="/triage/history">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>

                        <Avatar className="h-10 w-10">
                            <AvatarImage src={doctorInfo?.image} />
                            <AvatarFallback>
                                {doctorInfo?.name?.substring(0, 2) || "DR"}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <h1 className="font-semibold truncate">
                                {doctorInfo?.name || "Konsultasi Dokter"}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                {referral?.status === "active" ? "Online" : referral?.status}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" disabled>
                                <Phone className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" disabled>
                                <Video className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Triage Summary Card */}
            {referral?.triage_records && (
                <div className="container mx-auto px-4 py-2">
                    <Card className="bg-muted/50">
                        <CardContent className="p-3 flex items-center gap-3">
                            {referral.triage_records.photo_url && (
                                <img
                                    src={referral.triage_records.photo_url}
                                    alt="Wound"
                                    className="w-12 h-12 rounded object-cover"
                                />
                            )}
                            <div className="text-sm">
                                <p className="font-medium">
                                    Hasil Triage: {referral.triage_records.triage_result.toUpperCase()}
                                </p>
                                <p className="text-muted-foreground">
                                    Infeksi: {Math.round(parseFloat(referral.triage_records.infection_prob || "0") * 100)}%
                                    {" | "}
                                    Iskemia: {Math.round(parseFloat(referral.triage_records.ischaemia_prob || "0") * 100)}%
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        <p>Belum ada pesan</p>
                        <p className="text-sm">Mulai konsultasi dengan mengirim pesan</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${isOwnMessage(msg.sender_id) ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[75%] rounded-2xl px-4 py-2 ${isOwnMessage(msg.sender_id)
                                        ? "bg-primary text-primary-foreground rounded-br-sm"
                                        : "bg-muted rounded-bl-sm"
                                    }`}
                            >
                                {msg.message_type === "image" && msg.file_url && (
                                    <img
                                        src={msg.file_url}
                                        alt="Image"
                                        className="max-w-full rounded-lg mb-2"
                                    />
                                )}
                                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                <p
                                    className={`text-xs mt-1 ${isOwnMessage(msg.sender_id)
                                            ? "text-primary-foreground/70"
                                            : "text-muted-foreground"
                                        }`}
                                >
                                    {format(new Date(msg.created_at), "HH:mm")}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="sticky bottom-0 bg-card border-t border-border p-4">
                <form onSubmit={sendMessage} className="flex gap-2">
                    <Button type="button" variant="ghost" size="icon" disabled>
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    <Input
                        ref={inputRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Ketik pesan..."
                        className="flex-1"
                        disabled={sending}
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
