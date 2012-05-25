var catmullrom = function(spline, t) {
    var x0 = spline[0][0], y0 = spline[0][1],
        x1 = spline[1][0], y1 = spline[1][1],
        x2 = spline[2][0], y2 = spline[2][1],
        x3 = spline[3][0], y3 = spline[3][1];

    var x = 0.5 * (
        (2 * x1) +
        (-x0 + x2) * t +
        (2 * x0 - 5 * x1 + 4 * x2 - x3) * t * t +
        (-x0 + 3 * x1 - 3 * x2 + x3) * t * t * t
    );

    var y = 0.5 * (
        (2 * y1) +
            (-y0 + y2) * t +
            (2 * y0 - 5 * y1 + 4 * y2 - y3) * t * t +
            (-y0 + 3 * y1 - 3 * y2 + y3) * t * t * t
        );


    return [x,y];
};

var getPointOnSpline = function(spline, t) {
    var x0 = spline[0][0], y0 = spline[0][1],
        x1 = spline[1][0], y1 = spline[1][1],
        x2 = spline[2][0], y2 = spline[2][1],
        x3 = spline[3][0], y3 = spline[3][1];

    var x = t^3 * (x3 - 3*x2 + 3*x1 - x0) +
        t^2 * (3*x2 - 6*x1 + 3*x0) +
        t   * (3*x1 - 3*x0) +
        x0;
    var y = t^3 * (y3 - 3*y2 + 3*y1 - y0) +
        t^2 * (3*y2 - 6*y1 + 3*y0) +
        t   * (3*y1 - 3*y0) +
        y0;

    return [x,y];
}

var getSpline = function(lastFrame, currentFrame, frames) {
    var x1 = $V(lastFrame.position.elements);
    var v1 = $V(lastFrame.velocity.elements);
    var x2 = $V(currentFrame.position.elements);
    var v2 = $V(currentFrame.velocity.elements);
    var a2 = $V(currentFrame.acceleration.elements);

    var c1 = x1;
    var c2 = x1.add(v1);
    var c4 = x2
        .add(v2.x(frames))
        .add(a2.x(0.5 * frames * frames));
    var c3 = c4.subtract(v2.add(a2.x(frames)));

    return [c1.elements, c2.elements, c3.elements, c4.elements];
};
