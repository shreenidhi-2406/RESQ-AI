export function normalizeDate(dateString) {
    if (!dateString) return new Date().toISOString();
    try {
        const d = new Date(dateString);
        return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    } catch (e) {
        return new Date().toISOString();
    }
}
