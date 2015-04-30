(function (cf, Backbone, _, d3, cola) {
    "use strict";

    cf.view.Cola = Backbone.View.extend({
        initialize: function () {
            if (!this.model) {
                throw cf.error.required("model");
            }

            if (!this.el) {
                throw cf.error.required("el");
            }

            this.nodeRadius = 7.5;

            this.cola = cola.d3adaptor()
                .linkDistance(30)
                .avoidOverlaps(true)
                .size([this.$el.width(), this.$el.height()])
                .start();

            this.$el.html(cf.template.cola());
            this.listenTo(this.model, "change", this.render);
        },

        render: function () {
            var nodeData = this.model.get("nodes"),
                linkData = this.model.get("links");

            this.cola
                .nodes(nodeData)
                .links(linkData);

            this.nodes = d3.select(this.el)
                .select("g.nodes")
                .selectAll("circle.node")
                .data(nodeData, _.property("key"));

            this.nodes.enter()
                .append("circle")
                .classed("node", true)
                .attr("r", 0)
                .style("fill", "limegreen")
                .call(this.cola.drag)
                .transition()
                .duration(500)
                .attr("r", this.nodeRadius);

            this.links = d3.select(this.el)
                .select("g.links")
                .selectAll("line.link")
                .data(linkData, function (d) {
                    return JSON.stringify([d.source.key, d.target.key]);
                });

            this.links.enter()
                .append("line")
                .classed("link", true)
                .style("stroke-width", 0)
                .style("stroke", "black")
                .transition()
                .duration(500)
                .style("stroke-width", 1);

            this.cola.on("tick", _.bind(function () {
                var width = this.$el.width(),
                    height = this.$el.height(),
                    clamp = function (value, low, high) {
                        return value < low ? low : (value > high ? high : value);
                    },
                    clampX = _.partial(clamp, _, this.nodeRadius, width - this.nodeRadius),
                    clampY = _.partial(clamp, _, this.nodeRadius, height - this.nodeRadius);

                this.nodes
                    .attr("cx", _.compose(clampX, _.property("x")))
                    .attr("cy", _.compose(clampY, _.property("y")));

                this.links
                    .attr("x1", _.compose(clampX, function (d) {
                        return d.source.x;
                    }))
                    .attr("y1", _.compose(clampY, function (d) {
                        return d.source.y;
                    }))
                    .attr("x2", _.compose(clampX, function (d) {
                        return d.target.x;
                    }))
                    .attr("y2", _.compose(clampY, function (d) {
                        return d.target.y;
                    }));
            }, this));

            this.cola.start();
        }
    });
}(window.cf, window.Backbone, window._, window.d3, window.cola));
