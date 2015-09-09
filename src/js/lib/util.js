(function (clique, Hashes, _, Backbone) {
    "use strict";

    clique.util = {};

    clique.util.md5 = (function () {
        var md5 = new Hashes.MD5();

        return function (s) {
            return md5.hex(s);
        };
    }());

    clique.util.linkHash = function (link) {
        var source,
            target;

        source = link.source;
        if (!_.isString(source)) {
            source = source.key;
        }

        target = link.target;
        if (!_.isString(target)) {
            target = target.key;
        }

        return JSON.stringify([source, target]);
    };

    clique.util.deepCopy = function (o) {
        if (_.isUndefined(o)) {
            return undefined;
        }
        return JSON.parse(JSON.stringify(o));
    };

    clique.util.Set = function () {
        var items = {};

        return {
            add: function (item) {
                items[item] = null;
            },

            remove: function (item) {
                delete items[item];
            },

            has: function (item) {
                return _.has(items, item);
            },

            items: function (mapper) {
                var stuff = _.keys(items);
                if (mapper) {
                    stuff = _.map(stuff, mapper);
                }
                return stuff;
            },

            size: function () {
                return _.size(items);
            }
        };
    };

    clique.util.MultiTable = function () {
        var table = {};

        return {
            add: function (key, item) {
                if (!_.has(table, key)) {
                    table[key] = new clique.util.Set();
                }

                table[key].add(item);
            },

            remove: function (key, item) {
                if (_.has(table, key)) {
                    table[key].remove(item);
                }
            },

            strike: function (key) {
                delete table[key];
            },

            has: function (key, item) {
                return _.has(table, key) && (_.isUndefined(item) || table[key].has(item));
            },

            items: function (key) {
                if (_.has(table, key)) {
                    return table[key].items();
                }
            }
        };
    };

    clique.util.require = function (arg, name) {
        if (_.isUndefined(arg)) {
            throw new Error("argument '" + name + "' is required");
        }
    };

    clique.util.Mutator = function (cfg) {
        var target = cfg.target,
            disallowed = cfg.disallowed || [];

        clique.util.require(target, "target");

        (function () {
            var disallowedList = disallowed;

            disallowed = new clique.util.Set();
            _.each(disallowedList, function (d) {
                disallowed.add(d);
            });
        }());

        return _.extend({
            key: function () {
                return target.key;
            },

            getTransient: function (prop) {
                return target[prop];
            },

            setTransient: function (prop, value) {
                if (prop === "key" || disallowed.has(prop)) {
                    return false;
                }

                target[prop] = value;
                return true;
            },

            clearTransient: function (prop) {
                if (disallowed.has(prop)) {
                    return false;
                }

                delete target[prop];
                return true;
            },

            getAllData: function () {
                return _.pairs(target.data);
            },

            getData: function (prop) {
                return target.data[prop];
            },

            setData: function (prop, value) {
                target.data[prop] = value;
                this.trigger("changed", this, prop, value);
            },

            clearData: function (prop) {
                delete target.data[prop];
                this.trigger("cleared", this, prop);
            },

            getTarget: function () {
                return target;
            }
        }, Backbone.Events);
    };
}(window.clique, window.Hashes, window._, window.Backbone));
