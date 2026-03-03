import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// GET - Get single application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const userId = authHeader?.replace('Bearer ', '');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
    
    // Get user to check role
    const { data: user } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch application
    const { data: application, error } = await supabase
      .from('provider_applications')
      .select(`
        *,
        user:users!provider_applications_userId_fkey(id, email, name, avatar),
        reviewer:users!provider_applications_reviewedBy_fkey(id, email, name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Only allow admin or application owner to view
    if (user.role !== 'admin' && application.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: application });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update application status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const userId = authHeader?.replace('Bearer ', '');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, adminNotes, rejectionReason } = body;

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
    
    // Get user to check role
    const { data: user } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get the application
    const { data: application } = await supabase
      .from('provider_applications')
      .select('*')
      .eq('id', id)
      .single();

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Update application status
    const { error: updateError } = await supabase
      .from('provider_applications')
      .update({
        status,
        adminNotes: adminNotes || null,
        rejectionReason: status === 'rejected' ? rejectionReason : null,
        reviewedBy: userId,
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating application:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // If approved, update user role and create provider profile
    if (status === 'approved') {
      // Update user role
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ 
          role: 'provider',
          updatedAt: new Date().toISOString() 
        })
        .eq('id', application.userId);

      if (userUpdateError) {
        console.error('Error updating user role:', userUpdateError);
      }

      // Create provider profile
      const { data: userData } = await supabase
        .from('users')
        .select('name, email, avatar')
        .eq('id', application.userId)
        .single();

      const { error: providerError } = await supabase
        .from('providers')
        .insert({
          userId: application.userId,
          displayName: userData?.name || userData?.email?.split('@')[0] || 'New Provider',
          avatar: userData?.avatar || null,
          bio: null,
          pairs: [],
          timeframes: [],
          currency: 'UGX',
          monthlyPrice: 0,
          weeklyPrice: 0,
          quarterlyPrice: 0,
          yearlyPrice: 0,
          subscribers: 0,
          isVerified: false,
          verifiedAt: null,
          isActive: true,
          totalSignals: 0,
          winRate: 0,
          totalPips: 0,
          avgRR: 0,
          tier: 'new',
          averageRating: 0,
          totalReviews: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

      if (providerError) {
        console.error('Error creating provider profile:', providerError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Application ${status}` 
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
