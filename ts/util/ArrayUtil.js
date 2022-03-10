export class ArrayUtil {
    /**
     * Get array of all values of array1 that are NOT present in array2
     *
     * Opposite of intersect()
     *
     * @param array1
     * @param array2
     */
    static diff(array1, array2) {
        return array1.filter((i) => {
            return array2.indexOf(i) === -1;
        });
    }
    /**
     * Get array of all values of array1 that are ALSO present in array2
     *
     * @param array1
     * @param array2
     */
    static intersect(array1, array2) {
        return array1.filter((i) => {
            return array2.indexOf(i) !== -1;
        });
    }
    /**
     * Sort an array by multiple fields
     *
     * @param array
     * @param comparators
     */
    static multiSort(array, comparators) {
        if (!comparators.length) {
            return array;
        }
        const keySort = (a, b, isAscending) => {
            const direction = isAscending ? 1 : -1;
            if (a === b) { // If the values are the same, do not switch positions.
                return 0;
            }
            // If b > a, multiply by -1 to get the reverse direction.
            return a > b ? direction : -1 * direction;
        };
        return array.sort((a, b) => {
            let sorted = 0;
            let index = 0;
            // Loop until sorted (-1 or 1) or until the sort keys have been processed.
            while (sorted === 0 && index < comparators.length) {
                const key = comparators[index].property;
                if (key) {
                    sorted = keySort(a[key], b[key], comparators[index].isAscending);
                    index++;
                }
            }
            return sorted;
        });
    }
}
//# sourceMappingURL=ArrayUtil.js.map