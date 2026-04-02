"use client";

import { useState, useEffect } from "react";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profile?: { full_name: string | null };
}

interface Props {
  productId: string;
}

function StarRating({ rating, onRate, size = "md" }: { rating: number; onRate?: (r: number) => void; size?: "sm" | "md" }) {
  const [hover, setHover] = useState(0);
  const s = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onRate?.(i)}
          onMouseEnter={() => onRate && setHover(i)}
          onMouseLeave={() => onRate && setHover(0)}
          className={onRate ? "cursor-pointer" : "cursor-default"}
          disabled={!onRate}
        >
          <Star
            className={`${s} transition-colors ${
              i <= (hover || rating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Hôm nay";
  if (days < 7) return `${days} ngày trước`;
  if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
  return `${Math.floor(days / 30)} tháng trước`;
}

export default function ProductReviews({ productId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { user } = useAuth();

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?product_id=${productId}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setAverage(data.average || 0);
      setTotal(data.total || 0);
    } catch {
      // ignore
    }
    setLoaded(true);
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      toast.error("Vui lòng chọn số sao");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Có lỗi xảy ra");
        return;
      }
      toast.success(data.updated ? "Đã cập nhật đánh giá" : "Cảm ơn bạn đã đánh giá!");
      setRating(0);
      setComment("");
      fetchReviews();
    } catch {
      toast.error("Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  if (!loaded) return null;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-extrabold mb-6">Đánh giá sản phẩm</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Summary */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 text-center">
          <p className="text-5xl font-extrabold text-yellow-600">{average || "–"}</p>
          <StarRating rating={Math.round(average)} />
          <p className="text-sm text-gray-500 mt-2">{total} đánh giá</p>
        </div>

        {/* Distribution */}
        <div className="col-span-1 md:col-span-2 flex flex-col justify-center gap-1.5">
          {ratingCounts.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-6 text-right font-medium text-gray-600">{star}</span>
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }}
                />
              </div>
              <span className="w-8 text-xs text-gray-400">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review form */}
      {user ? (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-5 mb-8">
          <h3 className="font-bold mb-3">Viết đánh giá của bạn</h3>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm text-gray-500">Chất lượng:</span>
            <StarRating rating={rating} onRate={setRating} />
            {rating > 0 && (
              <span className="text-sm text-yellow-600 font-medium">
                {["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Rất tốt"][rating]}
              </span>
            )}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn..."
            className="w-full border rounded-xl px-4 py-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
          <div className="flex justify-end mt-3">
            <Button
              type="submit"
              disabled={submitting || !rating}
              className="rounded-xl bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4 mr-1.5" />
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-center text-sm text-gray-500">
          <a href="/dang-nhap" className="text-green-600 font-medium hover:underline">Đăng nhập</a> để viết đánh giá
        </div>
      )}

      {/* Review list */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-700">
                    {(r.profile?.full_name || "K")[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{r.profile?.full_name || "Khách hàng"}</p>
                    <StarRating rating={r.rating} size="sm" />
                  </div>
                </div>
                <span className="text-xs text-gray-400">{timeAgo(r.created_at)}</span>
              </div>
              {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
