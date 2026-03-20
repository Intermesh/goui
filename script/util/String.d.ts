export {};
declare global {
    /**
     * @category Utility
     */
    interface String {
        capitalize<T extends string>(this: T): Capitalize<T>;
        uncapitalize<T extends string>(this: T): Uncapitalize<T>;
        /**
         * Convert characters to their HTML character equivalents for safe display in web pages.
         */
        htmlEncode<T extends string>(this: T): T;
        /**
         * Remove HTML tags
         */
        stripTags<T extends string>(this: T): T;
    }
}
