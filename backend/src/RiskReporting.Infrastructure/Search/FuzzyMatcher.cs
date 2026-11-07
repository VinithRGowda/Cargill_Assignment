namespace RiskReporting.Infrastructure.Search;

public static class FuzzyMatcher
{
    /// <summary>
    /// Evaluates if target text matches the search term using substring, token matching,
    /// or Levenshtein distance tolerance.
    /// </summary>
    public static bool Matches(string? target, string searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return true;
        }

        if (string.IsNullOrWhiteSpace(target))
        {
            return false;
        }

        target = target.Trim();
        searchTerm = searchTerm.Trim();

        // Direct fast substring check (case-insensitive)
        if (target.Contains(searchTerm, StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        // Tokenized multi-word search: every search term token must find a matching token in the target
        var searchTokens = searchTerm.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var targetTokens = target.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        foreach (var sToken in searchTokens)
        {
            bool tokenMatched = false;
            foreach (var tToken in targetTokens)
            {
                // Target token contains the search token (e.g. searching "Ridge" matches "Cobalt Ridge")
                if (tToken.Contains(sToken, StringComparison.OrdinalIgnoreCase))
                {
                    tokenMatched = true;
                    break;
                }

                // Check Levenshtein distance for typos on words of similar length
                if (sToken.Length >= 4 && tToken.Length >= 4 && Math.Abs(sToken.Length - tToken.Length) <= 2)
                {
                    int maxDistance = sToken.Length > 6 ? 2 : 1;
                    if (ComputeLevenshteinDistance(sToken.ToLowerInvariant(), tToken.ToLowerInvariant()) <= maxDistance)
                    {
                        tokenMatched = true;
                        break;
                    }
                }
            }

            if (!tokenMatched)
            {
                return false;
            }
        }

        return true;
    }

    /// <summary>
    /// Computes classic Levenshtein distance between two strings.
    /// </summary>
    public static int ComputeLevenshteinDistance(string s, string t)
    {
        int n = s.Length;
        int m = t.Length;
        if (n == 0) return m;
        if (m == 0) return n;

        var d = new int[n + 1, m + 1];

        for (int i = 0; i <= n; i++) d[i, 0] = i;
        for (int j = 0; j <= m; j++) d[0, j] = j;

        for (int j = 1; j <= m; j++)
        {
            for (int i = 1; i <= n; i++)
            {
                int cost = (s[i - 1] == t[j - 1]) ? 0 : 1;
                d[i, j] = Math.Min(
                    Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1),
                    d[i - 1, j - 1] + cost
                );
            }
        }

        return d[n, m];
    }
}
