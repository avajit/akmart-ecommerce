import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProductReviews, submitReview } from '../api/consumer.api';
import { useAuthStore } from '../store/authStore';
import { formatImageUrl } from '../utils/imageUrl';
import { toast } from 'react-toastify';
import { 
  FiStar, 
  FiThumbsUp, 
  FiMessageSquare, 
  FiEdit3, 
  FiCheckCircle, 
  FiX 
} from 'react-icons/fi';
import { ImageUploader } from './common/ImageUploader';
import {
  Button,
  IconButton,
  Textarea,
  Input,
  Rating,
  Skeleton,
} from './ui';
import { useNavigate } from 'react-router-dom';

export interface ProductReviewsSectionProps {
  product: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function ProductReviewsSection({ product }: ProductReviewsSectionProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const role = (user?.roleName || (user as any)?.role?.name || user?.role || '').toUpperCase();

  const [reviewFilter, setReviewFilter] = useState<'ALL' | '5' | '4' | '3' | '2' | '1'>('ALL');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });
  
  // Up to 3 review images state
  const [attachedReviewKeys, setAttachedReviewKeys] = useState<string[]>([]);

  // Fetch Reviews via TanStack React Query
  const { data: reviewsResponse, isLoading: reviewsLoading } = useQuery({
    queryKey: ['product-reviews', product?.id],
    queryFn: () => getProductReviews(product!.id),
    enabled: !!product?.id,
  });

  const reviewData = reviewsResponse?.data || reviewsResponse || {};
  const serverReviews: any[] = Array.isArray(reviewData.reviews) ? reviewData.reviews : [];

  const mappedReviews = useMemo(() => {
    return serverReviews.map((r: any) => ({
      id: r.id,
      author: r.user?.fullName || 'Verified Shopper',
      city: 'Nepal',
      rating: Number(r.rating) || 5,
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) : 'Recent',
      title: r.title || 'Product Review',
      comment: r.body || '',
      variantName: 'Verified Purchase',
      helpfulCount: 0,
      isVerified: !!r.isVerifiedPurchase,
      images: r.images || [],
    }));
  }, [serverReviews]);

  const { averageRating, breakdown, totalRatingsCount, recommendedPercent } = useMemo(() => {
    if (mappedReviews.length === 0) {
      return {
        averageRating: null,
        totalRatingsCount: 0,
        recommendedPercent: null,
        breakdown: [
          { stars: '5 ★', rating: 5, pct: 0, count: 0, color: 'bg-emerald-500' },
          { stars: '4 ★', rating: 4, pct: 0, count: 0, color: 'bg-green-500' },
          { stars: '3 ★', rating: 3, pct: 0, count: 0, color: 'bg-amber-500' },
          { stars: '2 ★', rating: 2, pct: 0, count: 0, color: 'bg-orange-500' },
          { stars: '1 ★', rating: 1, pct: 0, count: 0, color: 'bg-rose-500' },
        ],
      };
    }

    const total = mappedReviews.length;
    const sum = mappedReviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0);
    const avg = (sum / total).toFixed(1);

    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    mappedReviews.forEach((r: any) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      counts[star] = (counts[star] || 0) + 1;
    });

    const posCount = counts[5] + counts[4];
    const recPct = Math.round((posCount / total) * 100);

    const b = [
      { stars: '5 ★', rating: 5, pct: Math.round((counts[5] / total) * 100), count: counts[5], color: 'bg-emerald-500' },
      { stars: '4 ★', rating: 4, pct: Math.round((counts[4] / total) * 100), count: counts[4], color: 'bg-green-500' },
      { stars: '3 ★', rating: 3, pct: Math.round((counts[3] / total) * 100), count: counts[3], color: 'bg-amber-500' },
      { stars: '2 ★', rating: 2, pct: Math.round((counts[2] / total) * 100), count: counts[2], color: 'bg-orange-500' },
      { stars: '1 ★', rating: 1, pct: Math.round((counts[1] / total) * 100), count: counts[1], color: 'bg-rose-500' },
    ];

    return {
      averageRating: avg,
      totalRatingsCount: total,
      recommendedPercent: recPct,
      breakdown: b,
    };
  }, [mappedReviews]);

  const submitReviewMutation = useMutation({
    mutationFn: (data: { rating: number; title: string; body: string; imageKeys?: string[] }) => {
      if (!product?.id) throw new Error('Product not available');
      return submitReview(product.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', product?.id] });
      setShowReviewModal(false);
      setNewReview({ rating: 5, title: '', comment: '' });
      setAttachedReviewKeys([]);
      toast.success('Your verified review was published successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || err.message || 'Failed to submit review');
    },
  });

  const handleOpenReviewModal = () => {
    if (!user) {
      toast.info('Please log in with your customer account to write a review');
      navigate('/login');
      return;
    }
    if (role === 'ADMIN' || role === 'SELLER') {
      toast.info('Reviews can only be submitted from consumer accounts');
      return;
    }
    setShowReviewModal(true);
  };

  const filteredReviews = mappedReviews.filter((r) => reviewFilter === 'ALL' || r.rating.toString() === reviewFilter);

  return (
    <div className="mt-16 pt-12 border-t border-border-subtle" id="reviews">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground-primary tracking-tight">
            Customer Ratings & Reviews
          </h2>
          <p className="text-xs sm:text-sm text-foreground-secondary mt-1">
            Real feedback from verified AkMart buyers across Nepal
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenReviewModal}
          iconLeft={<FiEdit3 />}
        >
          Write a Review
        </Button>
      </div>

      {/* Ratings Summary Card & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-surface-card border border-border-subtle rounded-3xl p-6 sm:p-8 mb-10 shadow-xl">
        <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-surface-base/60 rounded-2xl border border-border-subtle">
          <div className="text-4xl sm:text-5xl font-black text-foreground-primary tracking-tight flex items-center gap-1.5">
            {averageRating || '0.0'} <span className="text-amber-400 text-3xl">★</span>
          </div>
          <div className="mt-2">
            <Rating rating={Number(averageRating) || 0} size="md" showScore={false} />
          </div>
          <p className="text-xs text-foreground-secondary mt-2">
            {totalRatingsCount > 0 
              ? `Based on ${totalRatingsCount} verified ${totalRatingsCount === 1 ? 'review' : 'reviews'}`
              : 'No reviews yet. Be the first to review!'}
          </p>
          {recommendedPercent !== null && (
            <div className="mt-4 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold">
              {recommendedPercent}% of buyers recommend this product
            </div>
          )}
        </div>

        {/* Rating Breakdown Bars */}
        <div className="lg:col-span-8 flex flex-col justify-center space-y-2.5">
          <h3 className="text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-1">Rating Breakdown</h3>
          {breakdown.map((item) => (
            <div key={item.rating} className="flex items-center gap-3 text-xs">
              <span className="w-12 font-medium text-foreground-primary">{item.stars}</span>
              <div className="flex-1 h-3 bg-surface-base rounded-full overflow-hidden border border-border-subtle">
                <div 
                  className={`h-full ${item.color} transition-all duration-500`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
              <span className="w-10 text-right text-foreground-secondary">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <span className="text-xs font-bold text-foreground-secondary uppercase tracking-wider mr-2">Filter:</span>
        {[
          { key: 'ALL', label: `All (${mappedReviews.length})` },
          { key: '5', label: '5 Stars' },
          { key: '4', label: '4 Stars' },
          { key: '3', label: '3 Stars' },
          { key: '2', label: '2 Stars' },
          { key: '1', label: '1 Star' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setReviewFilter(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              reviewFilter === tab.key
                ? 'bg-brand-saffron text-white shadow-md shadow-brand-saffron/20'
                : 'bg-surface-card border border-border-subtle text-foreground-secondary hover:text-foreground-primary hover:border-border-strong'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {reviewsLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-16 bg-surface-card border border-border-subtle rounded-3xl p-8">
          <FiMessageSquare className="w-12 h-12 text-brand-saffron mx-auto mb-3 opacity-80" />
          <h3 className="text-base font-bold text-foreground-primary">No reviews found</h3>
          <p className="text-xs text-foreground-secondary mt-1 max-w-sm mx-auto">
            {reviewFilter === 'ALL' 
              ? 'Be the first customer to share your experience with this product!' 
              : `No reviews matching ${reviewFilter} stars.`}
          </p>
          <div className="mt-5">
            <Button variant="secondary" size="sm" onClick={handleOpenReviewModal}>
              Write a Review
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((rev) => (
            <div 
              key={rev.id}
              className="bg-surface-card border border-border-subtle rounded-2xl p-6 transition hover:border-border-strong shadow-md space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-saffron/15 text-brand-saffron font-black flex items-center justify-center text-sm">
                    {rev.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground-primary flex items-center gap-2">
                      {rev.author}
                      {rev.isVerified && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                          <FiCheckCircle className="text-xs" /> Verified Buyer
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-foreground-secondary">{rev.city} • {rev.date}</span>
                  </div>
                </div>
                <Rating rating={rev.rating} size="sm" />
              </div>

              <div>
                <h5 className="text-sm font-bold text-foreground-primary">{rev.title}</h5>
                <p className="text-xs sm:text-sm text-foreground-secondary mt-1.5 leading-relaxed">
                  {rev.comment}
                </p>
              </div>

              {/* Attached Review Photos */}
              {rev.images && rev.images.length > 0 && (
                <div className="flex items-center gap-2.5 pt-2 flex-wrap">
                  {rev.images.map((img: any, idx: number) => (
                    <a 
                      key={idx} 
                      href={formatImageUrl(img.url || img.key)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-16 h-16 rounded-xl overflow-hidden border border-border-subtle bg-surface-base hover:opacity-90 transition block shadow-sm"
                    >
                      <img 
                        src={formatImageUrl(img.url || img.key)} 
                        alt="Review attachment" 
                        className="w-full h-full object-cover" 
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Write Review Modal (Accessible Dialog with Up to 3 Image Attachments) ── */}
      {showReviewModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-surface-card border border-border-subtle rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle sticky top-0 bg-surface-card z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-saffron/15 text-brand-saffron flex items-center justify-center">
                  <FiEdit3 className="text-lg" />
                </div>
                <div>
                  <h3 id="review-dialog-title" className="text-lg font-bold text-foreground-primary">
                    Write a Verified Review
                  </h3>
                  <p className="text-xs text-foreground-secondary truncate max-w-xs">{product.name}</p>
                </div>
              </div>
              <IconButton
                aria-label="Close review dialog"
                variant="ghost"
                onClick={() => setShowReviewModal(false)}
              >
                <FiX className="text-xl" />
              </IconButton>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newReview.title.trim() || !newReview.comment.trim()) {
                  return toast.error('Please complete both review headline and comments');
                }
                submitReviewMutation.mutate({
                  rating: newReview.rating,
                  title: newReview.title.trim(),
                  body: newReview.comment.trim(),
                  imageKeys: attachedReviewKeys.length > 0 ? attachedReviewKeys : undefined,
                });
              }}
              className="space-y-4"
            >
              {/* Star Rating Select */}
              <div>
                <label className="block text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-2">
                  Overall Rating *
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      aria-label={`${star} of 5 stars`}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center transition active:scale-95 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-saffron"
                    >
                      <FiStar
                        className={`text-2xl ${
                          star <= newReview.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-600 hover:text-slate-400'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-foreground-primary ml-2">{newReview.rating} of 5 Stars</span>
                </div>
              </div>

              <Input
                label="Headline / Title"
                required
                placeholder="e.g. Excellent build quality, fast delivery in Kathmandu!"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              />

              <Textarea
                label="Detailed Review"
                required
                rows={4}
                placeholder="Share details about performance, packaging, authenticity, and delivery..."
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              />

              {/* Customer Photo Attachments (Up to 3 Photos) */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
                  Customer Photos (Up to 3 Photos)
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[0, 1, 2].map((slotIdx) => (
                    <div key={slotIdx} className="bg-surface-base p-3 rounded-2xl border border-border-subtle">
                      <ImageUploader
                        purpose="review-photo"
                        label={`Photo ${slotIdx + 1}`}
                        maxSizeMB={5}
                        onUploaded={(res) => {
                          setAttachedReviewKeys((prev) => {
                            const updated = [...prev];
                            updated[slotIdx] = res.key;
                            return updated.filter(Boolean);
                          });
                        }}
                        onCleared={() => {
                          setAttachedReviewKeys((prev) => {
                            const updated = [...prev];
                            updated[slotIdx] = '';
                            return updated.filter(Boolean);
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-foreground-secondary">
                  You can upload up to 3 high-resolution photos to support your review.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 sticky bottom-0 bg-surface-card py-3 border-t border-border-subtle">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={submitReviewMutation.isPending}
                  loadingText="Publishing..."
                >
                  Publish Review
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
