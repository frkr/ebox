export function randBox(range = 8): string {
    return (Math.random() + 1).toString(36).substring(range).replaceAll(/[^a-z]/g, '')
}
