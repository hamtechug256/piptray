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
        user:users!provider_applications_userId_fkey(id, email, name, avatar),
        reviewer:users!provider_applications_reviewedBy_fkey(id, email, name)
      `)
      .order('createdAt', { ascending: false });

    if (user.role !== 'admin') {
      query = query.eq('userId', userId);
    }

    const { data: applications, error } = await query;

    if (error) {
      console.error('Error fetching applications:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: applications });
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
      .eq('userId', userId)
      .in('status', ['pending', 'under_review'])
      .single();

    if (existingApp) {
      return NextResponse.json(
        { error: 'You already have a pending application', application: existingApp },
        { status: 400 }
      );
    }

    // Create application with camelCase column names
    const { data: application, error } = await supabase
      .from('provider_applications')
      .insert({
        userId,
        status: 'pending',
        tradingExperience: parseInt(tradingExperience),
        experienceLevel,
        tradingStyle,
        marketsTraded,
        averageMonthlySignals: averageMonthlySignals || 10,
        estimatedWinRate: estimatedWinRate ? parseFloat(estimatedWinRate) : null,
        trackRecordDescription: trackRecordDescription || null,
        telegramChannel: telegramChannel || null,
        twitterHandle: twitterHandle || null,
        tradingViewProfile: tradingViewProfile || null,
        otherSocialLinks: otherSocialLinks || null,
        motivationStatement,
        identityDocumentUrl: identityDocumentUrl || null,
        tradingStatementUrl: tradingStatementUrl || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
