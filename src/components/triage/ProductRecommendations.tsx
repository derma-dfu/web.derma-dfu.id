"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";

interface Product {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    description: string | null;
    category: string;
}

interface ProductRecommendationsProps {
    t: (id: string, en: string) => string;
    category?: "wound_care" | "skincare" | "supplements";
    limit?: number;
}

export function ProductRecommendations({ t, category = "wound_care", limit = 3 }: ProductRecommendationsProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        const fetchProducts = async () => {
            try {
                const { data, error } = await supabase
                    .from("products")
                    .select("id, name, price, image_url, description, category")
                    .eq("category", category)
                    .eq("is_active", true)
                    .limit(limit);

                if (error) throw error;
                setProducts((data as Product[]) || []);
            } catch (err) {
                console.error("Error fetching products:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category, limit]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    if (loading) {
        return (
            <div className="flex gap-3 overflow-x-auto py-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="min-w-[200px] h-[220px] bg-muted animate-pulse rounded-lg" />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">
                    {t("Produk Perawatan yang Direkomendasikan", "Recommended Care Products")}
                </h4>
                <Link href="/products" className="text-xs text-primary hover:underline flex items-center gap-1">
                    {t("Lihat Semua", "View All")}
                    <ArrowRight className="h-3 w-3" />
                </Link>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
                {products.map((product) => (
                    <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="min-w-[180px] sm:min-w-[200px] flex-shrink-0"
                    >
                        <Card className="h-full hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
                            <div className="relative aspect-square bg-muted">
                                {product.image_url ? (
                                    <Image
                                        src={product.image_url}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        sizes="200px"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                        <ShoppingCart className="h-8 w-8" />
                                    </div>
                                )}
                                <Badge className="absolute top-2 left-2 bg-green-500 text-[10px]">
                                    {t("Direkomendasikan", "Recommended")}
                                </Badge>
                            </div>
                            <CardContent className="p-3 space-y-1">
                                <h5 className="font-medium text-sm line-clamp-2">{product.name}</h5>
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <Star className="h-3 w-3 fill-current" />
                                    <span className="text-xs text-muted-foreground">4.8</span>
                                </div>
                                <p className="font-bold text-sm text-primary">
                                    {formatPrice(product.price)}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <Link href="/products?category=wound_care" className="block">
                <Button variant="outline" className="w-full" size="sm">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {t("Belanja Produk Perawatan Luka", "Shop Wound Care Products")}
                </Button>
            </Link>
        </div>
    );
}
