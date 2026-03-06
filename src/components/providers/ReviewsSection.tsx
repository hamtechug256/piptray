'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, CheckCircle, MessageSquare, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ReviewsSectionProps {
  providerId: string;
  currentUserId?: string;
  canReview?: boolean;
}

export function ReviewsSection({ providerId, currentUserId, canReview = false }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [providerId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?providerId=${providerId}`);
      const data = await response.json();

      if (data.success) {
        setReviews(data.data || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!currentUserId) {
      toast.error('Please log in to submit a review');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          rating,
          title,
          comment,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Review submitted successfully!');
        setReviewDialogOpen(false);
        setTitle('');
        setComment('');
        setRating(5);
        fetchReviews();
      } else {
        toast.error(data.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (value: number, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && setRating(star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`w-5 h-5 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getRatingPercentage = (star: number) => {
    if (stats.totalReviews === 0) return 0;
    return Math.round((stats.ratingDistribution[star as keyof typeof stats.ratingDistribution] / stats.totalReviews) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Reviews ({stats.totalReviews})
        </h3>
        {canReview && currentUserId && (
          <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Write a Review</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
                <DialogDescription>
                  Share your experience with this signal provider
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex items-center gap-2">
                    {renderStars(rating, true)}
                    <span className="text-sm text-muted-foreground">{rating}/5</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title (optional)</Label>
                  <Input
                    id="title"
                    placeholder="Summarize your experience"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment">Your Review *</Label>
                  <Textarea
                    id="comment"
                    placeholder="Tell others about your experience with this provider..."
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitReview} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Overall Rating */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-5xl font-bold text-primary">
                {stats.averageRating.toFixed(1)}
              </div>
              {renderStars(Math.round(stats.averageRating))}
              <p className="text-sm text-muted-foreground mt-1">
                Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="w-8 text-sm text-muted-foreground">{star}★</span>
                  <Progress value={getRatingPercentage(star)} className="h-2 flex-1" />
                  <span className="w-8 text-sm text-muted-foreground text-right">
                    {stats.ratingDistribution[star as keyof typeof stats.ratingDistribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h4 className="font-medium mb-2">No reviews yet</h4>
            <p className="text-sm text-muted-foreground">
              Be the first to review this provider
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={review.user.avatar || undefined} />
                      <AvatarFallback>
                        {review.user.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">
                          {review.user.name || 'Anonymous'}
                        </span>
                        {review.isVerified && (
                          <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified Subscriber
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-1">
                        {renderStars(review.rating)}
                      </div>
                      {review.title && (
                        <h4 className="font-medium mt-2">{review.title}</h4>
                      )}
                      {review.comment && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {review.comment}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3">
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Helpful ({review.helpfulCount})
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
