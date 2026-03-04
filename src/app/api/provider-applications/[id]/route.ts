import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
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

    // Fetch application with snake_case column names
    const { data: application, error } = await supabase
      .from('provider_applications')
      .select(`
        *,
        user:users(id, email, name, avatar),
        reviewer:users(id, email, name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Only allow admin or application owner to view
    if (user.role !== 'admin' && application.user_id !== userId) {
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

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
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

    // Update application status with SNAKE_CASE column names
    const { error: updateError } = await supabase
      .from('provider_applications')
      .update({
        status,
        admin_notes: adminNotes || null,
        rejection_reason: status === 'rejected' ? rejectionReason : null,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
          updated_at: new Date().toISOString() 
        })
        .eq('id', application.user_id);

      if (userUpdateError) {
        console.error('Error updating user role:', userUpdateError);
      }

      // Get user data for display name
      const { data: userData } = await supabase
        .from('users')
        .select('name, email, avatar')
        .eq('id', application.user_id)
        .single();

      // Create provider profile with SNAKE_CASE column names
      const { error: providerError } = await supabase
        .from('providers')
        .insert({
          user_id: application.user_id,
          display_name: userData?.name || userData?.email?.split('@')[0] || 'New Provider',
          avatar: userData?.avatar || null,
          bio: null,
          pairs: [],
          timeframes: [],
          currency: 'UGX',
          monthly_price: 0,
          weekly_price: 0,
          quarterly_price: 0,
          yearly_price: 0,
          subscribers: 0,
          is_verified: false,
          verified_at: null,
          is_active: true,  // ACTIVE BY DEFAULT WHEN APPROVED
          total_signals: 0,
          win_rate: 0,
          total_pips: 0,
          avg_rr: 0,
          tier: 'new',
          average_rating: 0,
          total_reviews: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (providerError) {
        console.error('Error creating provider profile:', providerError);
        // Try to provide more details
        return NextResponse.json({ 
          error: 'Failed to create provider profile: ' + providerError.message 
        }, { status: 500 });
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
