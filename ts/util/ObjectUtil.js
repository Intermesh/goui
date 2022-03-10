export class ObjectUtil {
    /**
     * Simple JSON path function
     *
     * eg.
     * const obj = {
     *   foo : {
     *     bar: {
     *       test: 1
     *     }
     *   }
     * }
     *
     * Object.path(obj, 'foo.bar.test'); // 1
     *
     * @param obj
     * @param path
     * @return The value from the path or undefined if not found
     */
    static path(obj, path) {
        const dotPos = path.indexOf(".");
        const prop = dotPos > -1 ? path.substr(0, dotPos) : path;
        const next = obj[prop];
        if (!next) {
            return next;
        }
        if (dotPos == -1) {
            return next;
        }
        if (!ObjectUtil.isObject(next)) {
            return undefined;
        }
        return this.path(next, path.substr(dotPos + 1));
    }
}
ObjectUtil.isObject = (obj) => {
    return Object.prototype.toString.call(obj) === '[object Object]';
};
//# sourceMappingURL=ObjectUtil.js.map