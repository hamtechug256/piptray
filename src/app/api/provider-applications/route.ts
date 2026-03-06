import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// GET - Fetch user's applications or all applications (admin)
export async function GET(request: NextRequest) {
  try {
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

    // If admin, fetch all applications, otherwise fetch only user's applications
    let query = supabase
      .from('provider_applications')
      .select(`
        *,
        user:users(id, email, name, avatar)
      `)
      .order('created_at', { ascending: false });

    if (user.role !== 'admin') {
      query = query.eq('user_id', userId);
    }

    const { data: applications, error } = await query;

    if (error) {
      console.error('Error fetching applications:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform snake_case from DB to camelCase for frontend
    const transformedApplications = (applications || []).map(app => ({
      id: app.id,
      userId: app.user_id,
      status: app.status,
      tradingExperience: app.trading_experience,
      experienceLevel: app.experience_level,
      tradingStyle: app.trading_style,
      marketsTraded: app.markets_traded,
      averageMonthlySignals: app.average_monthly_signals,
      estimatedWinRate: app.estimated_win_rate,
      trackRecordDescription: app.track_record_description,
      telegramChannel: app.telegram_channel,
      twitterHandle: app.twitter_handle,
      tradingViewProfile: app.trading_view_profile,
      otherSocialLinks: app.other_social_links,
      motivationStatement: app.motivation_statement,
      identityDocumentUrl: app.identity_document_url,
      tradingStatementUrl: app.trading_statement_url,
      adminNotes: app.admin_notes,
      rejectionReason: app.rejection_reason,
      createdAt: app.created_at,
      updatedAt: app.updated_at,
      user: app.user,
    }));

    return NextResponse.json({ success: true, data: transformedApplications });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Submit a new provider application
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const userId = authHeader?.replace('Bearer ', '');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await request.json();
    const {
      tradingExperience,
      experienceLevel,
      tradingStyle,
      marketsTraded,
      averageMonthlySignals,
      estimatedWinRate,
      trackRecordDescription,
      telegramChannel,
      twitterHandle,
      tradingViewProfile,
      otherSocialLinks,
      motivationStatement,
      identityDocumentUrl,
      tradingStatementUrl,
    } = body;

    // Validate required fields
    if (!tradingExperience || !experienceLevel || !tradingStyle?.length || 
        !marketsTraded?.length || !motivationStatement) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    // Check if user exists
    const { data: user } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for existing pending application
    const { data: existingApp } = await supabase
      .from('provider_applications')
      .select('id, status')
      .eq('user_id', userId)
      .in('status', ['pending', 'under_review'])
      .maybeSingle();

    if (existingApp) {
      return NextResponse.json(
        { error: 'You already have a pending application', application: existingApp },
        { status: 400 }
      );
    }

    // Create application with snake_case column names (PostgreSQL convention)
    const { data: application, error } = await supabase
      .from('provider_applications')
      .insert({
        user_id: userId,
        status: 'pending',
        trading_experience: parseInt(tradingExperience),
        experience_level: experienceLevel,
        trading_style: tradingStyle,
        markets_traded: marketsTraded,
        average_monthly_signals: averageMonthlySignals || 10,
        estimated_win_rate: estimatedWinRate ? parseFloat(estimatedWinRate) : null,
        track_record_description: trackRecordDescription || null,
        telegram_channel: telegramChannel || null,
        twitter_handle: twitterHandle || null,
        trading_view_profile: tradingViewProfile || null,
        other_social_links: otherSocialLinks || null,
        motivation_statement: motivationStatement,
        identity_document_url: identityDocumentUrl || null,
        trading_statement_url: tradingStatementUrl || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating application:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: application,
      message: 'Application submitted successfully. You will be notified once reviewed.' 
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
