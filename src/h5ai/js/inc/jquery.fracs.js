/*
 * jQuery.fracs 0.10
 * http://larsjung.de/fracs
 * 
 * provided under the terms of the MIT License
 */

/*
 * ModPlug 0.4
 * http://larsjung.de/modplug
 *
 * provided under the terms of the MIT License
 */

(function ($) {
    "use strict";
    /*globals jQuery */
    /*jslint confusion: true */

    var reference = "_mp_api";

    $.ModPlug = $.ModPlug || {
        plugin: function (namespace, options) {

            if (!namespace || $[namespace] || $.fn[namespace]) {
                // $.error("No namespace specified, or a plugin already exists on 'jQuery." + namespace + "'");
                return !namespace ? 1 : ($[namespace] ? 2 : 3);
            }

            var defaults = {
                    statics: {},
                    methods: {},
                    defaultStatic: undefined,
                    defaultMethod: undefined
                },
                settings = $.extend({}, defaults, options),
                staticPlug = function () {

                    var args, defaultMethod;

                    args = Array.prototype.slice.call(arguments);
                    defaultMethod = settings.defaultStatic instanceof Function ? settings.defaultStatic.apply(this, args) : settings.defaultStatic;
                    if (staticPlug[defaultMethod] instanceof Function) {
                        return staticPlug[defaultMethod].apply(this, args);
                    }
                    $.error("Static method defaulted to '" + defaultMethod + "' does not exist on 'jQuery." + namespace + "'");
                },
                methods = {},
                methodPlug = function (method) {

                    var args, defaultMethod;

                    if (methods[method] instanceof Function) {
                        args = Array.prototype.slice.call(arguments, 1);
                        return methods[method].apply(this, args);
                    }

                    args = Array.prototype.slice.call(arguments);
                    defaultMethod = settings.defaultMethod instanceof Function ? settings.defaultMethod.apply(this, args) : settings.defaultMethod;
                    if (methods[defaultMethod] instanceof Function) {
                        return methods[defaultMethod].apply(this, args);
                    }
                    $.error("Method '" + method + "' defaulted to '" + defaultMethod + "' does not exist on 'jQuery." + namespace + "'");
                },
                api = {
                    addStatics: function (newStatics) {

                        $.extend(staticPlug, newStatics);
                        staticPlug[reference] = api;
                        return this;
                    },
                    addMethods: function (newMethods) {

                        $.extend(methods, newMethods);
                        return this;
                    }
                };

            api.addStatics(settings.statics).addMethods(settings.methods);
            $[namespace] = staticPlug;
            $.fn[namespace] = methodPlug;
            return 0;
        },
        module: function (namespace, options) {

            if (!$[namespace] || !$[namespace][reference]) {
                // $.error("No ModPlug plugin exists on 'jQuery." + namespace + "'");
                return !$[namespace] ? 1 : 2;
            }

            var defaults = {
                    statics: {},
                    methods: {}
                },
                settings = $.extend({}, defaults, options);

            $[namespace][reference].addStatics(settings.statics).addMethods(settings.methods);
            return 0;
        }
    };

}(jQuery));

/*
 * jQuery.fracs - Core API
 */

(function ($) {
    "use strict";
    /*globals jQuery, HTMLElement */
    /*jslint browser: true, vars: true */

    
    var FracsData = function (htmlElementOrRect) {
    
        var target = htmlElementOrRect,
            callbacks = [],
            prevFracs;
    
        this.size = function () {
    
            return callbacks.length;
        };
    
        this.bind = function (callback) {
    
            if (callback instanceof Function && $.inArray(callback, callbacks) === -1) {
                callbacks.push(callback);
            }
        };
    
        this.unbind = function (callback) {
    
            if (callback instanceof Function) {
                var idx = $.inArray(callback, callbacks);
                if (idx >= 0) {
                    callbacks.splice(idx, 1);
                }
            } else {
                callbacks = [];
            }
        };
    
        this.check = function () {
    
            var rect = target instanceof HTMLElement ? $.fracs.rect(target) : target,
                fracs = $.fracs.fracs(rect, $.fracs.viewport());
    
            if (!prevFracs || !prevFracs.equals(fracs)) {
                $.each(callbacks, function (idx, callback) {
                    callback.call(target, fracs, prevFracs);
                });
                prevFracs = fracs;
            }
        };
    };

    
    var Rect = function (left, top, width, height) {
    
        var fracsData;
    
        this.left = Math.round(left);
        this.top = Math.round(top);
        this.width = Math.round(width);
        this.height = Math.round(height);
        this.right = this.left + this.width;
        this.bottom = this.top + this.height;
    
        this.equals = function (that) {
    
            return this.left === that.left && this.top === that.top && this.width === that.width && this.height === that.height;
        };
    
        this.area = function () {
    
            return this.width * this.height;
        };
    
        this.intersection = function (rect) {
    
            var left = Math.max(this.left, rect.left),
                right = Math.min(this.right, rect.right),
                top = Math.max(this.top, rect.top),
                bottom = Math.min(this.bottom, rect.bottom),
                width = right - left,
                height = bottom - top;
    
            return (width >= 0 && height >= 0) ? new Rect(left, top, width, height) : undefined;
        };
    
        this.envelope = function (rect) {
    
            var left = Math.min(this.left, rect.left),
                right = Math.max(this.right, rect.right),
                top = Math.min(this.top, rect.top),
                bottom = Math.max(this.bottom, rect.bottom),
                width = right - left,
                height = bottom - top;
    
            return new Rect(left, top, width, height);
        };
    
        this.bind = function (callback) {
    
            if (!fracsData) {
                fracsData = new FracsData(this);
                $(window).bind("scroll resize", fracsData.check);
            }
            fracsData.bind(callback);
        };
    
        this.unbind = function (callback) {
    
            if (fracsData) {
                fracsData.unbind(callback);
                if (fracsData.size() === 0) {
                    $(window).unbind("scroll resize", fracsData.check);
                    fracsData = undefined;
                }
            }
        };
    
        this.check = function () {
    
            if (fracsData) {
                fracsData.check();
            }
        };
    
        this.fracs = function () {
    
            $.fracs.fracs(this);
        };
    };

    
    var FracsResult = function (rectDocument, rectElement, rectViewport, visible, viewport, possible) {
    
        /*jslint confusion: true */
    
        if (!rectDocument || !rectElement || !rectViewport || !visible || !viewport || !possible) {
            this.rects = undefined;
            this.visible = 0;
            this.viewport = 0;
            this.possible = 0;
        } else {
            this.rects = {
                document: rectDocument,
                element: rectElement,
                viewport: rectViewport
            };
            this.visible = visible;
            this.viewport = viewport;
            this.possible = possible;
        }
    
        this.equals = function (that) {
    
            return this.fracsEqual(that) && this.rectsEqual(that);
        };
    
        this.fracsEqual = function (that) {
    
            return this.visible === that.visible && this.viewport === that.viewport && this.possible === that.possible;
        };
    
        this.rectsEqual = function (that) {
    
            if (!this.rects || !that.rects) {
                return this.rects === that.rects;
            }
            return this.rects.document.equals(that.rects.document)
                && this.rects.element.equals(that.rects.element)
                && this.rects.viewport.equals(that.rects.viewport);
        };
    };

    
    var ScrollState = function () {
    
        var document = $.fracs.document(),
            viewport = $.fracs.viewport(),
            width = document.width - viewport.width,
            height = document.height - viewport.height;
    
        this.width = width <= 0 ? undefined : viewport.left / width;
        this.height = height <= 0 ? undefined : viewport.top / height;
        this.left = viewport.left;
        this.top = viewport.top;
        this.right = document.right - viewport.right;
        this.bottom = document.bottom - viewport.bottom;
    
        this.equals = function (that) {
    
            return this.width === that.width && this.height === that.height
                && this.left === that.left && this.top === that.top
                && this.right === that.right && this.bottom === that.bottom;
        };
    };

    
    var ScrollStateTracker = function () {
    
        var prevState,
            callbacks = [],
            check = function () {
    
                var state = new ScrollState();
                if (!prevState || !prevState.equals(state)) {
                    $.each(callbacks, function (idx, callback) {
                        callback.call(window, state, prevState);
                    });
                    prevState = state;
                }
            };
    
        $(window).bind("resize scroll load", check);
    
        this.bind = function (callback) {
    
            callbacks.push(callback);
        };
    };

    
    // @beta
    var FracsElement = function (htmlElement, fracs) {
    
        this.element = htmlElement;
        this.fracs = fracs;
    
        this.update = function () {
    
            var fracs = $.fracs.fracs(this.element),
                changed = !this.fracs || !this.fracs.equals(fracs);
            this.fracs = fracs;
            return changed;
        };
    };

    
    // @beta
    var FracsGroup = function (htmlElements, property, callback) {
    
        var THIS = this,
            targets = [],
            prevBest = null;
    
        $.each(htmlElements, function (idx, element) {
            if (element instanceof HTMLElement) {
                targets.push(new FracsElement(element));
            }
        });
    
        this.check = function () {
    
            var best,
                viewport = $.fracs.viewport();
    
            $.each(targets, function (idx, target) {
                target.update();
                if (!best || target.fracs[property] > best.fracs[property]) {
                    best = target;
                }
            });
    
    
            if (best && best.fracs[property] === 0) {
                best = null;
            }
    
            if (prevBest !== best) {
                callback.call(THIS, best, prevBest);
                prevBest = best;
            }
        };
    };


    var $document = $(document),
        $window = $(window),
        $htmlBody = $("html,body"),
        scrollStateTracker,
        dataNs = "fracs",
        statics = {
            document: function () {

                /*jslint confusion: true */
                return new Rect(0, 0, $document.width(), $document.height());
            },
            viewport: function () {

                /*jslint confusion: true */
                return new Rect($window.scrollLeft(), $window.scrollTop(), $window.width(), $window.height());
            },
            rect: function (htmlElement) {

                var $target = $(htmlElement),
                    offset = $target.offset();

                if (!$target.is(":visible")) {
                    return new Rect(0, 0, 0, 0);
                }
                return new Rect(offset.left, offset.top, $target.outerWidth(), $target.outerHeight());
            },
            fracs: function (rect, viewport) {

                var intersection, intersectionElementSpace, intersectionViewportSpace, intersectionArea, possibleArea;

                rect = rect instanceof HTMLElement ? statics.rect(rect) : rect;
                viewport = viewport || statics.viewport();
                intersection = rect.intersection(viewport);

                if (!intersection) {
                    return new FracsResult();
                }

                intersectionElementSpace = new Rect(intersection.left - rect.left, intersection.top - rect.top, intersection.width, intersection.height);
                intersectionViewportSpace = new Rect(intersection.left - viewport.left, intersection.top - viewport.top, intersection.width, intersection.height);
                intersectionArea = intersection.area();
                possibleArea = Math.min(rect.width, viewport.width) * Math.min(rect.height, viewport.height);

                return new FracsResult(
                    intersection,
                    intersectionElementSpace,
                    intersectionViewportSpace,
                    intersectionArea / rect.area(),
                    intersectionArea / viewport.area(),
                    intersectionArea / possibleArea
               );
            },
            round: function (value, decs) {

                if (isNaN(decs) || decs <= 0) {
                    return Math.round(value);
                }
                return Math.round(value * Math.pow(10, decs)) / Math.pow(10, decs);
            },
            scrollTo: function (left, top, duration) {

                duration = isNaN(duration) ? 1000 : duration;
                $htmlBody.stop(true).animate({ scrollLeft: left, scrollTop: top }, duration);
            },
            scroll: function (left, top, duration) {

                duration = isNaN(duration) ? 1000 : duration;
                $htmlBody.stop(true).animate({ scrollLeft: $window.scrollLeft() + left, scrollTop: $window.scrollTop() + top }, duration);
            },
            scrollState: function (callback) {

                if (callback instanceof Function) {
                    scrollStateTracker = scrollStateTracker || new ScrollStateTracker();
                    scrollStateTracker.bind(callback);
                } else {
                    return new ScrollState();
                }
            }
        },
        methods = {
            bind: function (callback) {

                return this.each(function () {

                    var $this = $(this),
                        data = $this.data(dataNs);

                    if (!data) {
                        data = new FracsData(this);
                        $this.data(dataNs, data);
                        $window.bind("scroll resize", data.check);
                    }
                    data.bind(callback);
                });
            },
            unbind: function (callback) {

                return this.each(function () {

                    var $this = $(this),
                        data = $this.data(dataNs);

                    if (data) {
                        data.unbind(callback);
                        if (data.size() === 0) {
                            $this.removeData(dataNs);
                            $window.unbind("scroll resize", data.check);
                        }
                    }
                });
            },
            check: function () {

                return this.each(function () {

                    var data = $(this).data(dataNs);

                    if (data) {
                        data.check();
                    }
                });
            },
            fracs: function () {

                return statics.fracs(statics.rect(this.get(0)), statics.viewport());
            },
            rect: function () {

                return statics.rect(this.get(0));
            },
            max: function (property, callback) {

                if (callback instanceof Function) {

                    var data = new FracsGroup(this, property, callback);

                    $window.bind("scroll resize", data.check);
                    data.check();
                    return this;
                } else {
                    var obj, elements, maxValue;

                    if ($.inArray(property, [ "possible", "visible", "viewport" ]) >= 0) {
                        obj = "fracs";
                    } else if ($.inArray(property, [ "width", "height", "left", "right", "top", "bottom" ]) >= 0) {
                        obj = "rect";
                    } else {
                        return this;
                    }

                    this.each(function () {

                        var fracs = statics[obj](this);

                        if (!maxValue || fracs[property] > maxValue) {
                            elements = [ this ];
                            maxValue = fracs[property];
                        } else if (fracs[property] === maxValue) {
                            elements.push(this);
                        }
                    });
                    return $(elements);
                }
            },
            min: function (property) {

                var obj, elements, minValue;

                if ($.inArray(property, [ "possible", "visible", "viewport" ]) >= 0) {
                    obj = "fracs";
                } else if ($.inArray(property, [ "width", "height", "left", "right", "top", "bottom" ]) >= 0) {
                    obj = "rect";
                } else {
                    return this;
                }

                this.each(function () {

                    var fracs = statics[obj](this);

                    if (!minValue || fracs[property] < minValue) {
                        elements = [ this ];
                        minValue = fracs[property];
                    } else if (fracs[property] === minValue) {
                        elements.push(this);
                    }
                });
                return $(elements);
            },
            envelope: function () {

                var envelope, rect;

                this.each(function () {
                    rect = statics.rect(this);
                    envelope = !envelope ? rect : envelope.envelope(rect);
                });
                return envelope;
            },
            scrollTo: function (paddingLeft, paddingTop, duration) {

                var rect;

                paddingLeft = paddingLeft || 0;
                paddingTop = paddingTop || 0;
                rect = statics.rect(this.get(0));

                statics.scrollTo(rect.left - paddingLeft, rect.top - paddingTop, duration);
                return this;
            },
            softLink: function (paddingLeft, paddingTop, duration) {

                return this.filter("a[href^=#]").each(function () {
                    var $a = $(this),
                        href = $a.attr("href");
                    $a.click(function () {
                        $(href).fracs("scrollTo", paddingLeft, paddingTop, duration);
                    });
                });
            }
        },
        defaultStatic = function () {

            return "fracs";
        },
        defaultMethod = function () {

            if (arguments.length === 0) {
                return "fracs";
            } else if (arguments[0] instanceof Function) {
                return "bind";
            }
        };


    $.ModPlug.plugin("fracs", {
        statics: statics,
        methods: methods,
        defaultStatic: defaultStatic,
        defaultMethod: defaultMethod
    });

}(jQuery));

/*
 * jQuery.fracs - Outline API
 */

(function ($) {
    "use strict";

    /*globals jQuery */
    /*jslint browser: true, vars: true */

    
    var Outline = function (canvas, options) {
    
        if (!(canvas instanceof HTMLElement && canvas.nodeName.toLowerCase() === "canvas")) {
            return undefined;
        }
    
    
        var defaults = {
                crop: false,
                duration: 0,
                focusWidth: 0.5,
                focusHeight: 0.5,
                autoFocus: true,
                styles: [ {
                    selector: "header,footer,section,article",
                    fillStyle: "rgb(230,230,230)"
                }, {
                    selector: "h1",
                    fillStyle: "rgb(240,140,060)"
                }, {
                    selector: "h2",
                    fillStyle: "rgb(200,100,100)"
                }, {
                    selector: "h3",
                    fillStyle: "rgb(100,200,100)"
                }, {
                    selector: "h4",
                    fillStyle: "rgb(100,100,200)"
                } ],
                viewportStyle: {
                    fillStyle: "rgba(228,77,38,0.3)"
                },
                viewportDragStyle: {
                    fillStyle: "rgba(228,77,38,0.6)"
                },
                invertViewport: false
            },
            settings = $.extend({}, defaults, options),
            $window = $(window),
            $htmlBody = $("html,body"),
            $canvas = $(canvas),
            width = $canvas.attr("width"),
            height = $canvas.attr("height"),
            context = canvas.getContext("2d"),
            docRect,
            vpRect,
            scale,
            drag = false,
            focusWidth,
            focusHeight,
            scroll = function (event) {
    
                var r, x, y;
    
                r = $canvas.fracs("rect");
                x = event.pageX - r.left;
                y = event.pageY - r.top;
                $.fracs.scrollTo(x / scale - vpRect.width * focusWidth, y / scale - vpRect.height * focusHeight, settings.duration);
            },
            drawRect = function (context, rect, strokeWidth, strokeStyle, fillStyle, invert) {
    
                if (strokeWidth !== undefined && scale) {
                    strokeWidth = strokeWidth > 0.2 / scale ? strokeWidth : 0.2 / scale;
                }
    
                if (strokeStyle || fillStyle) {
                    if (invert !== true) {
                            context.beginPath();
                            context.rect(rect.left, rect.top, rect.width, rect.height);
                            if (fillStyle) {
                                context.fillStyle = fillStyle;
                                context.fill();
                            }
                            if (strokeStyle) {
                                context.lineWidth = strokeWidth;
                                context.strokeStyle = strokeStyle;
                                context.stroke();
                            }
                    } else {
                        if (fillStyle) {
                            context.beginPath();
                            context.rect(0, 0, docRect.width, rect.top);
                            context.rect(0, rect.top, rect.left, rect.height);
                            context.rect(rect.right, rect.top, docRect.right - rect.right, rect.height);
                            context.rect(0, rect.bottom, docRect.width, docRect.bottom - rect.bottom);
                            context.fillStyle = fillStyle;
                            context.fill();
                        }
                        if (strokeStyle) {
                            context.beginPath();
                            context.rect(rect.left, rect.top, rect.width, rect.height);
                            context.lineWidth = strokeWidth;
                            context.strokeStyle = strokeStyle;
                            context.stroke();
                        }
                    }
                }
            },
            drawElement = function (context, htmlElement, strokeWidth, strokeStyle, fillStyle) {
    
                var $element = $(htmlElement),
                    rect = $element.fracs("rect");
    
                if ($element.css("visibility") === "hidden") {
                    return;
                }
    
                strokeWidth = strokeWidth === "auto" ? $element.css("border-top-width") : strokeWidth;
                strokeStyle = strokeStyle === "auto" ? $element.css("border-top-color") : strokeStyle;
                fillStyle = fillStyle === "auto" ? $element.css("background-color") : fillStyle;
                drawRect(context, rect, strokeWidth, strokeStyle, fillStyle);
            },
            drawViewport = function () {
    
                var strokeWidth, strokeStyle, fillStyle;
    
                if (drag && settings.viewportDragStyle) {
                    strokeWidth = settings.viewportDragStyle.storkeWidth;
                    strokeStyle = settings.viewportDragStyle.strokeStyle;
                    fillStyle = settings.viewportDragStyle.fillStyle;
                } else {
                    strokeWidth = settings.viewportStyle.storkeWidth;
                    strokeStyle = settings.viewportStyle.strokeStyle;
                    fillStyle = settings.viewportStyle.fillStyle;
                }
                drawRect(context, vpRect, strokeWidth, strokeStyle, fillStyle, settings.invertViewport);
            },
            applyStyles = function (context) {
    
                $.each(settings.styles, function (idx, style) {
                    $(style.selector).each(function () {
                        drawElement(context, this, style.strokeWidth, style.strokeStyle, style.fillStyle);
                    });
                });
            },
            draw = function () {
    
                /*jslint confusion: true */
    
                var scaleX, scaleY;
    
                docRect = $.fracs.document();
                vpRect = $.fracs.viewport();
                scaleX = width / docRect.width;
                scaleY = height / docRect.height;
                scale = scaleX < scaleY ? scaleX : scaleY;
    
                if (settings.crop) {
                    $canvas.attr("width", docRect.width * scale).attr("height", docRect.height * scale);
                }
    
                context.clearRect(0, 0, $canvas.width(), $canvas.height());
    
                context.scale(scale, scale);
                applyStyles(context);
                drawViewport();
                context.scale(1 / scale, 1 / scale);
            },
            init = function () {
    
                $canvas
                    .css("cursor", "pointer")
                    .mousedown(function (event) {
    
                        var r;
    
                        event.preventDefault();
                        drag = true;
                        if (settings.autoFocus) {
                            r = $canvas.fracs("rect");
                            focusWidth = (((event.pageX - r.left) / scale) - vpRect.left) / vpRect.width;
                            focusHeight = (((event.pageY - r.top) / scale) - vpRect.top) / vpRect.height;
                        }
                        if (!settings.autoFocus || focusWidth < 0 || focusWidth > 1 || focusHeight < 0 || focusHeight > 1) {
                            focusWidth = settings.focusWidth;
                            focusHeight = settings.focusHeight;
                        }
                        scroll(event);
                        $canvas.css("cursor", "crosshair").addClass("dragOn");
                        $htmlBody.css("cursor", "crosshair");
                        $window
                            .bind("mousemove", scroll)
                            .one("mouseup", function (event) {
                                event.preventDefault();
                                $canvas.css("cursor", "pointer").removeClass("dragOn");
                                $htmlBody.css("cursor", "auto");
                                $window.unbind("mousemove", scroll);
                                drag = false;
                                draw();
                            });
                    });
                canvas.onselectstart = function () {
                    return false;
                };
                $window.bind("load resize scroll", draw);
                draw();
            };
    
    
        init();
    
    
        this.draw = draw;
    };


    var dataNs = "outline",
        methods = {
            outline: function (options) {

                return this.each(function () {

                    var outline;

                    if (options === "redraw") {
                        outline = $(this).data(dataNs);
                        if (outline) {
                            outline.draw();
                        }
                    } else {
                        outline = new Outline(this, options);
                        if (outline) {
                            $(this).data(dataNs, outline);
                        }
                    }
                });
            }
        };


    $.ModPlug.module("fracs", {
        methods: methods
    });

}(jQuery));

