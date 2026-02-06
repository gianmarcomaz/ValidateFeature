/**
 * Competitor filtering and normalization utilities
 * Filters out non-competitor results and normalizes competitor data structure
 */

export interface NormalizedCompetitor {
    name: string;
    website: string;
    description: string;
    overlapSummary: string;
    // Keep original fields for backward compatibility
    category?: string;
    confidence?: "high" | "med" | "low";
}

// Input competitor data can have various shapes
interface RawCompetitor {
    name: string;
    domain?: string;
    url?: string;
    link?: string;
    category?: string;
    whatTheyDo?: string;
    whyOverlaps?: string;
    overlapReason?: string;
    evidenceSnippets?: string[];
    confidence?: "high" | "med" | "low";
    description?: string;
}

// Patterns that indicate non-competitor content
const NON_COMPETITOR_PATTERNS = [
    /\b(best|top|list)\b/i,
    /\b(tools|directory|directories)\b/i,
    /\b(blog|guide|tutorial)\b/i,
    /\b(forum|discussion|community)\b/i,
    /\b(comparison|compare|vs)\b/i,
    /\b(review|reviews)\b/i,
    /\b(roundup|collection)\b/i,
    /\b(\d+\s+(best|top|tools))\b/i, // "10 best", "5 top tools", etc.
];

// Domains that are known content aggregators, not actual competitors
const CONTENT_AGGREGATOR_DOMAINS = [
    'medium.com',
    'reddit.com',
    'quora.com',
    'sendpulse.com',
    'dev.to',
    'hashnode.com',
    'substack.com',
    'wordpress.com',
    'blogger.com',
    'tumblr.com',
    'producthunt.com',
    'hackernews.com',
    'news.ycombinator.com',
    'linkedin.com',
    'facebook.com',
    'twitter.com',
    'x.com',
    'instagram.com',
    'youtube.com',
    'capterra.com',
    'g2.com',
    'trustpilot.com',
    'getapp.com',
    'softwareadvice.com',
];

/**
 * Extract primary domain from URL or domain string
 */
function extractDomain(urlOrDomain: string): string {
    try {
        // If it looks like a URL, parse it
        if (urlOrDomain.includes('://') || urlOrDomain.startsWith('www.')) {
            const url = new URL(urlOrDomain.includes('://') ? urlOrDomain : `https://${urlOrDomain}`);
            return url.hostname.replace(/^www\./, '');
        }
        // Otherwise, treat as domain
        return urlOrDomain.replace(/^www\./, '').toLowerCase();
    } catch {
        // If parsing fails, return as-is (cleaned)
        return urlOrDomain.replace(/^www\./, '').toLowerCase();
    }
}

/**
 * Check if a competitor is actually a content aggregator or list
 */
function isNonCompetitor(competitor: RawCompetitor): boolean {
    const name = competitor.name || '';
    const description = competitor.whatTheyDo || competitor.description || competitor.overlapReason || '';

    // Check name and description against patterns
    const textToCheck = `${name} ${description}`;
    if (NON_COMPETITOR_PATTERNS.some(pattern => pattern.test(textToCheck))) {
        return true;
    }

    // Check domain against known aggregators
    const domain = competitor.domain || competitor.url || competitor.link || '';
    if (domain) {
        const cleanDomain = extractDomain(domain);
        if (CONTENT_AGGREGATOR_DOMAINS.some(aggregator => cleanDomain.includes(aggregator))) {
            return true;
        }
    }

    return false;
}

/**
 * Validate that a competitor has the minimum required fields
 */
function isValidCompetitor(competitor: RawCompetitor): boolean {
    // Must have a name
    if (!competitor.name || competitor.name.trim().length === 0) {
        return false;
    }

    // Must have some form of URL/domain
    if (!competitor.domain && !competitor.url && !competitor.link) {
        return false;
    }

    // Must have some description
    const hasDescription = !!(
        competitor.whatTheyDo ||
        competitor.description ||
        competitor.overlapReason ||
        competitor.whyOverlaps
    );

    return hasDescription;
}

/**
 * Filter out non-competitor results
 */
export function filterCompetitors(competitors: RawCompetitor[]): RawCompetitor[] {
    return competitors.filter(competitor => {
        return isValidCompetitor(competitor) && !isNonCompetitor(competitor);
    });
}

/**
 * Normalize a single competitor to standard structure
 */
function normalizeCompetitor(competitor: RawCompetitor): NormalizedCompetitor {
    // Get website - prefer url, then link, then domain
    const rawWebsite = competitor.url || competitor.link || (competitor.domain ? `https://${competitor.domain}` : '');
    const website = rawWebsite || 'https://example.com'; // Fallback, shouldn't happen if validated

    // Get description - prefer whatTheyDo, then description, then overlapReason
    const description = (
        competitor.whatTheyDo ||
        competitor.description ||
        competitor.overlapReason ||
        'Competitor in your market space.'
    ).trim();

    // Get overlap summary - prefer whyOverlaps, then overlapReason
    const overlapSummary = (
        competitor.whyOverlaps ||
        competitor.overlapReason ||
        ''
    ).trim();

    return {
        name: competitor.name.trim(),
        website,
        description,
        overlapSummary,
        category: competitor.category,
        confidence: competitor.confidence,
    };
}

/**
 * Normalize an array of competitors
 */
export function normalizeCompetitors(competitors: RawCompetitor[]): NormalizedCompetitor[] {
    return competitors.map(normalizeCompetitor);
}
