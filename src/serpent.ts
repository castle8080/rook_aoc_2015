// Serpent: some utility functions on iterables.
// Is there reall not a common package for lodash like functions on Iterables?

export function fold<T, S>(initial: S, iter: Iterable<T>, f: (item: T, state: S) => S): S {
    let current = initial;
    for (const v of iter) {
        current = f(v, current);
    }
    return current;
}

export function max_by<T>(iter: Iterable<T>, comparator: (a: T, b: T) => number): T|undefined {
    return fold(undefined as T|undefined, iter, (item, cur_max) => {
        //console.log("comparing: ", item, cur_max);
        return (cur_max == undefined || comparator(item, cur_max) > 0)
            ? item
            : cur_max;
    });
}

export function* map<T, S>(iter: Iterable<T>, f: (item: T) => S): Iterable<S> {
    for (const item of iter) {
        yield f(item);
    }
}
