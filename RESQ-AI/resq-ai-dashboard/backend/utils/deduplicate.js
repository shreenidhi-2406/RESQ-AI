export function deduplicate(items) {
    const seen = new Set();
    return items.filter(item => {
        const key = item.id || item.source_url || item.title;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}
