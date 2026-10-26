"use client";

import { useEffect, useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { Button, Modal, EmptyState, PageLoader, Stars } from "@/components/ui";
import { useShop } from "@/context/ShopContext";
import { timeAgo } from "@/lib/utils";

type Review = { id: number; productId: number; authorName: string; rating: number; title?: string | null; comment?: string | null; createdAt: string };

export default function AdminReviewsPage() {
  const { toast } = useShop();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [delId, setDelId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/reviews").then((r) => r.json()).then((j) => setReviews(j.reviews || [])).finally(() => setLoading(false));
  }, []);

  const doDelete = async () => {
    if (!delId) return;
    const prev = [...reviews];
    setReviews((rs) => rs.filter((r) => r.id !== delId));
    setDelId(null);
    try {
      await fetch(`/api/reviews?id=${delId}`, { method: "DELETE" });
      toast("Review deleted", { type: "info" });
    } catch {
      setReviews(prev);
      toast("Delete failed", { type: "error" });
    }
  };

  if (loading) return <PageLoader message="Loading reviews..." />;

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Reviews</h1>
          <p className="text-sm text-slate-500">{reviews.length} reviews • {avg} average rating</p>
        </div>
      </div>
      {reviews.length === 0 ? (
        <EmptyState icon={<Star className="h-8 w-8" />} title="No reviews yet" message="Customer reviews will appear here." />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900">{r.authorName}</p>
                    <Stars value={r.rating} size={13} />
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">Product #{r.productId} • {timeAgo(r.createdAt)}</p>
                </div>
                <button onClick={() => setDelId(r.id)} className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-500"><Trash2 size={14} /></button>
              </div>
              {r.title && <p className="mt-2 text-sm font-bold text-slate-800">{r.title}</p>}
              <p className="mt-1 text-sm text-slate-600">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
      <Modal open={!!delId} onClose={() => setDelId(null)} title="Delete Review?">
        <p className="text-sm text-slate-600">This review will be permanently removed.</p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setDelId(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={doDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
