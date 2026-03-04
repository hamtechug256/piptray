import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/reviews - List reviews for a provider
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    const providerId = searchParams.get('providerId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!providerId) {
      return NextResponse.json(
        { success: false, error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user:users(id, name, avatar)
      `)
      .eq('provider_id', providerId)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Get average rating
    const { data: statsData } = await supabase
      .from('reviews')
      .select('rating')
      .eq('provider_id', providerId)
      .eq('is_public', true);

    const totalReviews = statsData?.length || 0;
    const averageRating = totalReviews > 0
      ? Number((statsData?.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 0;

    // Rating distribution
    const ratingDistribution = {
      5: statsData?.filter(r => r.rating === 5).length || 0,
      4: statsData?.filter(r => r.rating === 4).length || 0,
      3: statsData?.filter(r => r.rating === 3).length || 0,
      2: statsData?.filter(r => r.rating === 2).length || 0,
      1: statsData?.filter(r => r.rating === 1).length || 0,
    };

    return NextResponse.json({
      success: true,
      data: data || [],
      stats: {
        totalReviews,
        averageRating,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a review
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { providerId, rating, title, comment } = body;

    if (!providerId || !rating) {
      return NextResponse.json(
        { success: false, error: 'Provider ID and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user has an active or past subscription with this provider
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', authUser.id)
      .eq('provider_id', providerId)
      .limit(1)
      .single();

    const isVerified = !!subscription;

    // Check if user already reviewed this provider
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('provider_id', providerId)
      .eq('user_id', authUser.id)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this provider' },
        { status: 400 }
      );
    }

    // Create review
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        provider_id: providerId,
        user_id: authUser.id,
        rating,
        title,
        comment,
        is_verified: isVerified,
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(`
        *,
        user:users(id, name, avatar)
      `)
      .single();

    if (error) {
      console.error('Error creating review:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Update provider's average rating
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('provider_id', providerId)
      .eq('is_public', true);

    const totalReviews = allReviews?.length || 0;
    const averageRating = totalReviews > 0
      ? allReviews!.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    await supabase
      .from('providers')
      .update({
        average_rating: averageRating,
        total_reviews: totalReviews,
        updated_at: new Date().toISOString(),
      })
      .eq('id', providerId);

    return NextResponse.json({
      success: true,
      data,
      message: 'Review submitted successfully!',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
