/**
 * Updates the values of a given object and optionally removes random entries.
 * @param details - The object containing key-value pairs to be updated.
 * @param update - The string to be appended to each value.
 * @param remove - Whether to remove random entries from the object.
 * @returns The updated object.
 */
export default (details: Record<string, string>, update: string = '', remove: boolean = false) => {
    // Convert the object to an array of key-value pairs
    const entries = Object.entries(details);

    if (remove) {
        // Determine the number of entries to remove
        const removeCount = (1 + Math.random() * entries.length) | 0;

        // Remove random entries from the array
        for (let i = 0; i < removeCount; i++) {
            const randomIndex = (Math.random() * entries.length) | 0;
            entries.splice(randomIndex, 1);
        }
    }

    // Update each value in the array
    for (let i = 0; i < entries.length; i++) {
        entries[i][1] += update;
    }

    // Convert the array back to an object and return it
    return Object.fromEntries(entries);
};
