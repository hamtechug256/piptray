'use client';

import Link from 'next/link';
import { TrendingUp, Globe, MessageCircle, Twitter, Github, Heart } from 'lucide-react';
import { siteConfig, navigation } from '@/lib/constants/site';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">
                Pip<span className="text-blue-400">Tray</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm mb-4">
              {siteConfig.tagline}. Your trusted signal marketplace for East African traders.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={siteConfig.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                <Twitter className="w-5 h-5 text-slate-400" />
              </a>
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                <Github className="w-5 h-5 text-slate-400" />
              </a>
              <a
                href={siteConfig.links.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li>
                <Link href="/providers" className="hover:text-white transition-colors">
                  Browse Providers
                </Link>
              </li>
              <li>
                <Link href="/apply" className="hover:text-white transition-colors">
                  Become a Provider
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/risk" className="hover:text-white transition-colors">
                  Risk Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-400" />
                <a
                  href={siteConfig.links.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Telegram Support
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-green-400" />
                <span>{siteConfig.location}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {currentYear} PipTray. Developed by{' '}
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {siteConfig.creator}
            </a>
          </p>
          <div className="flex items-center gap-4 text-slate-500 text-sm">
            <span className="flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> in Uganda 🇺🇬
            </span>
          </div>
        </div>

        {/* Risk Warning */}
        <div className="mt-8 p-4 bg-slate-800 rounded-lg">
          <p className="text-xs text-slate-400 text-center">
            <strong>Risk Disclaimer:</strong> Trading forex, cryptocurrencies, and other financial instruments carries a high level of risk and may not be suitable for all investors. Past performance is not indicative of future results. Never trade with money you cannot afford to lose. This platform provides signals from third-party providers and does not guarantee profits.
          </p>
        </div>
      </div>
    </footer>
  );
}
